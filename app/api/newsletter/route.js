export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Newsletter from "@/models/Newsletter";

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req) {
    try {
        await connectDB();
        const { email } = await req.json();
        if (!email || !isValidEmail(email)) {
            return new NextResponse("Invalid email", { status: 400 });
        }

        const existing = await Newsletter.findOne({ email: email.toLowerCase() });
        if (existing) {
            return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
        }

        await Newsletter.create({ email });
        return NextResponse.json({ message: "Subscribed" }, { status: 201 });
    } catch (err) {
        console.error("Newsletter subscribe error", err);
        return new NextResponse("Server error", { status: 500 });
    }
}
