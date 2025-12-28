import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import ContactMessage from "@/models/ContactMessage";

export const dynamic = "force-dynamic";

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

function validateEmail(email) {
  const s = (typeof email === "string" ? email : "").trim();
  return !s || (/.+@.+\..+/.test(s) && s.length <= 254);
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: "Too many submissions. Please try again later." }, { status: 429 });
    }

    await connectDB();
    const { name, email, phone, message, hp } = await request.json();

    if (hp && String(hp).trim().length > 0) {
      return NextResponse.json({ message: "Invalid submission" }, { status: 400 });
    }

    if (!name || !phone || !message) {
      return NextResponse.json({ message: "Name, phone, and message are required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }

    const safeName = sanitizeText(name, 100);
    const safePhone = sanitizeText(phone, 32);
    const safeBody = sanitizeText(message, 2000);
    const safeEmail = (email || "").trim().toLowerCase();

    const doc = await ContactMessage.create({
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      message: safeBody,
      status: "new",
      source: "contact",
    });

    return NextResponse.json({ message: "Message received", id: doc._id }, { status: 201 });
  } catch (error) {
    console.error("Contact message error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
