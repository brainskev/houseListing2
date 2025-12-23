export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Newsletter from "@/models/Newsletter";

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Simple per-IP rate limiter (3 requests per 60s)
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

export async function POST(req) {
    try {
        // Rate limit + honeypot
        const ip = getClientIp(req);
        if (isRateLimited(ip)) {
            return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
        }

        await connectDB();
        const { email, hp } = await req.json();
        if (hp && String(hp).trim().length > 0) {
            return new NextResponse("Invalid submission", { status: 400 });
        }
        const normalized = String(email || "").trim().toLowerCase();
        if (!normalized || normalized.length > 254 || !isValidEmail(normalized)) {
            return new NextResponse("Invalid email", { status: 400 });
        }

        const existing = await Newsletter.findOne({ email: normalized });
        if (existing) {
            return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
        }

        await Newsletter.create({ email: normalized });
        return NextResponse.json({ message: "Subscribed" }, { status: 201 });
    } catch (err) {
        console.error("Newsletter subscribe error", err);
        return new NextResponse("Server error", { status: 500 });
    }
}
