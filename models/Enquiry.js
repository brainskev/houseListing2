import { Schema, model, models } from "mongoose";

const EnquirySchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    unreadCountByUser: {
      type: Map,
      of: Number,
      default: {},
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    contactName: String,
    contactEmail: String,
    contactPhone: String,
  },
  { timestamps: true }
);

EnquirySchema.index({ propertyId: 1, createdBy: 1 }, { unique: true });
EnquirySchema.index({ lastMessageAt: -1 });
EnquirySchema.index({ participants: 1 });

const Enquiry = models.Enquiry || model("Enquiry", EnquirySchema);
export default Enquiry;
