import { Schema, model, models } from "mongoose";

const TestimonialSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        role: {
            type: String,
            default: "Customer",
        },
        message: {
            type: String,
            required: [true, "Testimonial message is required"],
            maxlength: [500, "Testimonial cannot exceed 500 characters"],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
            default: 5,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        propertyId: {
            type: Schema.Types.ObjectId,
            ref: "Property",
        },
    },
    {
        timestamps: true,
    }
);

const Testimonial = models.Testimonial || model("Testimonial", TestimonialSchema);

export default Testimonial;
