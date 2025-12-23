import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import ViewingAppointment from "@/models/ViewingAppointment";

const allowedStatuses = ["pending", "confirmed", "completed"];

// --- Simple per-IP rate limiter (3 requests per 60s window) ---
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;
const ipRequestLog = new Map();

function getClientIp(request) {
  const xfwd = request.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  const xreal = request.headers.get("x-real-ip");
  if (xreal) return xreal.trim();
  return "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const entries = ipRequestLog.get(ip) || [];
  const recent = entries.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  ipRequestLog.set(ip, recent);
  return false;
}

function sanitizeText(value, maxLen) {
  const s = (typeof value === "string" ? value : "").trim();
  return s.replace(/[\r\n\t]+/g, " ").replace(/[<>]/g, "").slice(0, maxLen);
}

export async function POST(request) {
  try {
    // Honeypot & rate limiting
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: "Too many submissions. Please try again later." }, { status: 429 });
    }

    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;
    if (!sessionUser?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, propertyId, date, hp } = body || {};

    // Reject bots that fill the hidden honeypot field
    if (hp && String(hp).trim().length > 0) {
      return NextResponse.json({ message: "Invalid submission" }, { status: 400 });
    }

    if (!name || !phone || !propertyId || !date) {
      return NextResponse.json(
        { message: "Name, phone, propertyId, and date are required" },
        { status: 400 }
      );
    }

    const appointment = await ViewingAppointment.create({
      userId: sessionUser.userId,
      name: sanitizeText(name, 100),
      phone: sanitizeText(phone, 32),
      propertyId,
      date: new Date(date),
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json({ message: "Failed to create appointment" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (sessionUser instanceof Response) return sessionUser;
    const role = sessionUser?.user?.role;
    const userId = sessionUser?.userId;

    let query = {};
    if (!role || !["admin", "assistant"].includes(role)) {
      if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      query = { userId };
    }

    const searchParams = request.nextUrl?.searchParams;
    const sortByParam = (searchParams?.get("sortBy") || "").toLowerCase();
    const orderParam = (searchParams?.get("order") || "desc").toLowerCase();
    const fieldMap = {
      date: "date",
      user: "name",
      property: "propertyId",
    };
    const sortField = fieldMap[sortByParam] || "createdAt";
    const sortOrder = orderParam === "asc" ? 1 : -1;

    const appointments = await ViewingAppointment.find(query).sort({ [sortField]: sortOrder });
    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json({ message: "Failed to fetch appointments" }, { status: 500 });
  }
}
