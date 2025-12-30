import { Schema, model, models } from "mongoose";

const ViewingAppointmentSchema = new Schema(
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
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed"],
      default: "pending",
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

ViewingAppointmentSchema.index({ userId: 1, date: -1 });
ViewingAppointmentSchema.index({ status: 1, date: -1 });
ViewingAppointmentSchema.index({ propertyId: 1, date: -1 });

const ViewingAppointment =
  models.ViewingAppointment || model("ViewingAppointment", ViewingAppointmentSchema);
export default ViewingAppointment;
