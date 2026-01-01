import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getSessionUser } from "@/utils/getSessionUser";
import Enquiry from "@/models/Enquiry";
// Ensure Property model is registered for populate
import "@/models/Property";

export const dynamic = "force-dynamic";

// --- Simple per-IP rate limiter (3 requests per 60s window) ---
// Note: In-memory storage resets between deployments and may not persist across serverless instances.
// This is intended as a lightweight anti-spam measure without external dependencies.
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
  // Basic sanitization: collapse whitespace and strip angle brackets
  const cleaned = s.replace(/[\r\n\t]+/g, " ").replace(/[<>]/g, "");
  return cleaned.slice(0, maxLen);
}

const allowedStatuses = ["new", "contacted", "closed"];

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
    const { name, phone, message, propertyId, hp } = body || {};

    // Reject bots that fill the hidden honeypot field
    if (hp && String(hp).trim().length > 0) {
      return NextResponse.json({ message: "Invalid submission" }, { status: 400 });
    }

    // Validate required fields and enforce basic length constraints
    if (!name || !phone || !message) {
      return NextResponse.json(
        { message: "Name, phone, and message are required" },
        { status: 400 }
      );
    }

    const safeName = sanitizeText(name, 100);
    const safePhone = sanitizeText(phone, 32);
    const safeMessage = sanitizeText(message, 2000);
    const safePropertyId = propertyId; // ObjectId validated by Mongoose on create

    if (!safeName || !safePhone || !safeMessage) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const enquiry = await Enquiry.create({
      userId: sessionUser.userId,
      name: safeName,
      phone: safePhone,
      message: safeMessage,
      ...(safePropertyId ? { propertyId: safePropertyId } : {}),
    });

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    console.error("Create enquiry error:", error);
    return NextResponse.json({ message: "Failed to create enquiry" }, { status: 500 });
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

    const updatedAfterParam = request.nextUrl?.searchParams?.get("updatedAfter");
    const updatedAfter = updatedAfterParam && !Number.isNaN(Date.parse(updatedAfterParam)) ? new Date(updatedAfterParam) : null;
    if (updatedAfter) {
      query.updatedAt = { $gt: updatedAfter };
    }

    const enquiries = await Enquiry.find(query)
      .populate({ path: "propertyId", select: "name" })
      .sort({ createdAt: -1 });
    return NextResponse.json({ enquiries }, { status: 200 });
  } catch (error) {
    console.error("Get enquiries error:", error);
    return NextResponse.json({ message: "Failed to fetch enquiries" }, { status: 500 });
  }
}
