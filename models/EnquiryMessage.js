import { Schema, model, models } from "mongoose";

const EnquiryMessageSchema = new Schema(
    {
        enquiryId: {
            type: Schema.Types.ObjectId,
            ref: "Enquiry",
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        readBy: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

EnquiryMessageSchema.index({ enquiryId: 1, createdAt: 1 });
EnquiryMessageSchema.index({ senderId: 1, createdAt: -1 });

const EnquiryMessage = models.EnquiryMessage || model("EnquiryMessage", EnquiryMessageSchema);
export default EnquiryMessage;
