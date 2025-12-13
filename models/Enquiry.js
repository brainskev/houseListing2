import { Schema, model, models } from "mongoose";

const EnquirySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Enquiry = models.Enquiry || model("Enquiry", EnquirySchema);
export default Enquiry;
