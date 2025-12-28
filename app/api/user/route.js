import connectDB from "@/config/db";
import User from "@/models/User";
import { getSessionUser } from "@/utils/getSessionUser";
import {
    hashPassword,
    verifyPassword,
    normalizeEmail,
    validatePassword,
    getSafeErrorMessage,
} from "@/utils/authHelpers";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session || session instanceof Response) return session || new Response("Unauthorized", { status: 401 });

        await connectDB();
        const user = await User.findById(session.userId).select("email name username image role status hashedPassword");
        if (!user) {
            return new Response(JSON.stringify({ message: "User not found" }), {
                status: 404,
            });
        }

        const payload = {
            id: user._id.toString(),
            email: user.email,
            name: user.name || "",
            username: user.username || "",
            image: user.image || "",
            role: user.role || "user",
            status: user.status || "active",
            hasPassword: Boolean(user.hashedPassword),
        };

        return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: getSafeErrorMessage(error, "Failed to load profile") }), {
            status: 500,
        });
    }
}

export async function PUT(req) {
    try {
        const session = await getSessionUser();
        if (!session || session instanceof Response) return session || new Response("Unauthorized", { status: 401 });

        const body = await req.json();
        const {
            name,
            username,
            email,
            currentPassword,
            newPassword,
            image,
        } = body || {};

        await connectDB();
        const user = await User.findById(session.userId).select("+hashedPassword email name username image");
        if (!user) {
            return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        // Update basic info
        if (typeof name === "string") user.name = name.trim();
        if (typeof username === "string" && username.trim()) user.username = username.trim();

        if (typeof image === "string") {
            user.image = image.trim();
        }

        if (typeof email === "string" && email.trim()) {
            const normalized = normalizeEmail(email);
            if (normalized !== user.email) {
                const existing = await User.findOne({ email: normalized });
                if (existing && existing._id.toString() !== user._id.toString()) {
                    return new Response(JSON.stringify({ message: "Email already in use" }), { status: 400 });
                }
                user.email = normalized;
            }
        }

        // Handle password change only for users with credentials
        if (currentPassword || newPassword) {
            if (!user.hashedPassword) {
                return new Response(
                    JSON.stringify({ message: "Password is managed by Google sign-in for this account" }),
                    { status: 400 }
                );
            }

            if (!currentPassword || !newPassword) {
                return new Response(JSON.stringify({ message: "Provide both current and new password" }), { status: 400 });
            }

            const validCurrent = await verifyPassword(currentPassword, user.hashedPassword);
            if (!validCurrent) {
                return new Response(JSON.stringify({ message: "Current password is incorrect" }), { status: 400 });
            }

            const strength = validatePassword(newPassword);
            if (!strength.valid) {
                return new Response(JSON.stringify({ message: strength.message }), { status: 400 });
            }

            user.hashedPassword = await hashPassword(newPassword);
        }

        await user.save();

        return new Response(
            JSON.stringify({
                message: "Profile updated",
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    username: user.username,
                    image: user.image || "",
                },
            }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify({ message: getSafeErrorMessage(error, "Failed to update profile") }), {
            status: 500,
        });
    }
}
