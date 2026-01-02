import mongoose from "mongoose";
import Enquiry from "@/models/Enquiry";
import EnquiryMessage from "@/models/EnquiryMessage";
import User from "@/models/User";
import { getIO } from "@/lib/socket/server";
import "@/models/Property";

const STAFF_ROLES = ["admin", "assistant"];

// Invariants:
// - unreadCountByUser lives on Enquiry and is only mutated here (appendMessage, markEnquiryRead).
// - Counters never derive from messages; events emit the authoritative map after each write.
// - Messages are append-only aside from readBy updates.

const toStringId = (val) => (typeof val === "string" ? val : val?.toString());

const sanitizeText = (text) => (typeof text === "string" ? text.trim() : "");

async function fetchStaffIds() {
    const staff = await User.find({ role: { $in: STAFF_ROLES }, status: { $ne: "blocked" } }, { _id: 1 })
        .lean()
        .exec();
    return staff.map((u) => toStringId(u._id));
}

function canAccessEnquiry(enquiry, session) {
    if (!enquiry || !session) return false;
    if (STAFF_ROLES.includes(session.user?.role)) return true;
    const userId = toStringId(session.userId);
    return enquiry.participants?.some((p) => toStringId(p) === userId);
}

function buildUnreadIncrements(participantIds, senderId) {
    const inc = {};
    participantIds.forEach((pid) => {
        if (toStringId(pid) === toStringId(senderId)) return;
        inc[`unreadCountByUser.${toStringId(pid)}`] = 1;
    });
    return inc;
}

export async function listEnquiriesForUser({ userId, role }) {
    const query = STAFF_ROLES.includes(role) ? {} : { participants: userId };
    return Enquiry.find(query)
        .sort({ lastMessageAt: -1 })
        .select("propertyId participants unreadCountByUser lastMessageAt contactName contactEmail contactPhone createdBy")
        .populate({ path: "propertyId", select: "name location.city location.state" })
        .lean();
}

export async function getEnquiryWithAccess(enquiryId, session) {
    const enquiry = await Enquiry.findById(enquiryId).lean();
    if (!enquiry) {
        const err = new Error("Enquiry not found");
        err.status = 404;
        throw err;
    }
    if (!canAccessEnquiry(enquiry, session)) {
        const err = new Error("Forbidden");
        err.status = 403;
        throw err;
    }
    return enquiry;
}

export async function getEnquiryMessages(enquiryId, session) {
    const enquiry = await getEnquiryWithAccess(enquiryId, session);
    const messages = await EnquiryMessage.find({ enquiryId })
        .populate('senderId', 'username name email')
        .sort({ createdAt: 1 })
        .lean();
    return { enquiry, messages };
}

export async function markEnquiryRead({ enquiryId, userId, session }) {
    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
        const err = new Error("Enquiry not found");
        err.status = 404;
        throw err;
    }
    if (!canAccessEnquiry(enquiry, session)) {
        const err = new Error("Forbidden");
        err.status = 403;
        throw err;
    }
    const uid = toStringId(userId);

    const updated = await Enquiry.findByIdAndUpdate(
        enquiryId,
        {
            $addToSet: { participants: uid },
            $set: { [`unreadCountByUser.${uid}`]: 0 },
        },
        { new: true }
    ).lean();

    await EnquiryMessage.updateMany({ enquiryId, readBy: { $ne: uid } }, { $addToSet: { readBy: uid } });

    const io = getIO();
    if (io) {
        io.to(toStringId(enquiryId)).emit("chat:read", {
            enquiryId: toStringId(enquiryId),
            userId: uid,
            unreadCountByUser: updated?.unreadCountByUser || {},
        });
    }

    return updated;
}

export async function appendMessage({ enquiryId, senderId, text, session }) {
    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
        const err = new Error("Enquiry not found");
        err.status = 404;
        throw err;
    }
    if (!canAccessEnquiry(enquiry, session)) {
        const err = new Error("Forbidden");
        err.status = 403;
        throw err;
    }

    const normalizedSender = toStringId(senderId);
    const participantIds = new Set((enquiry.participants || []).map((p) => toStringId(p)));
    participantIds.add(normalizedSender);

    const cleanText = sanitizeText(text);
    if (!cleanText) {
        const err = new Error("Message text is required");
        err.status = 400;
        throw err;
    }

    // Only mutate unread counters here to keep a single source of truth.
    const inc = buildUnreadIncrements(participantIds, normalizedSender);
    const now = new Date();

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
        enquiryId,
        {
            $addToSet: { participants: { $each: Array.from(participantIds) } },
            $set: {
                lastMessageAt: now,
                [`unreadCountByUser.${normalizedSender}`]: 0,
            },
            $inc: inc,
        },
        { new: true }
    );

    const message = await EnquiryMessage.create({
        enquiryId,
        senderId,
        text: cleanText,
        readBy: [senderId],
    });

    // Populate sender info before emitting to socket
    await message.populate('senderId', 'username name email');

    const io = getIO();
    if (io) {
        // Notify everyone in the room with the authoritative unread map from the DB write above.
        io.to(toStringId(enquiryId)).emit("message:new", {
            enquiryId: toStringId(enquiryId),
            message: message.toObject?.() || message,
            unreadCountByUser: updatedEnquiry?.unreadCountByUser || {},
        });
    }

    return { enquiry: updatedEnquiry?.toObject ? updatedEnquiry.toObject() : updatedEnquiry, message: message.toObject?.() || message };
}

export async function createEnquiryWithMessage({ propertyId, senderId, text, contactInfo = {}, session }) {
    const existing = await Enquiry.findOne({ propertyId, createdBy: senderId });
    const senderObjectId = new mongoose.Types.ObjectId(senderId);

    if (existing) {
        return appendMessage({ enquiryId: existing._id, senderId, text, session });
    }

    const staffIds = await fetchStaffIds();
    const participants = Array.from(new Set([toStringId(senderId), ...staffIds]));

    try {
        const baseEnquiry = await Enquiry.create({
            propertyId,
            createdBy: senderObjectId,
            participants,
            unreadCountByUser: {},
            lastMessageAt: new Date(),
            contactName: contactInfo?.name,
            contactEmail: contactInfo?.email,
            contactPhone: contactInfo?.phone,
        });

        return appendMessage({ enquiryId: baseEnquiry._id, senderId, text, session });
    } catch (err) {
        // If a concurrent request created the conversation, reuse it instead of failing.
        if (err?.code === 11000) {
            const existingAfterConflict = await Enquiry.findOne({ propertyId, createdBy: senderId });
            if (existingAfterConflict) {
                return appendMessage({ enquiryId: existingAfterConflict._id, senderId, text, session });
            }
        }
        throw err;
    }
}
