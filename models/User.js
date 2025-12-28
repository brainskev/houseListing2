import { Schema, model, models } from "mongoose";
const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Email is required"],
    },
    name: {
      type: String,
    },
    username: {
      type: String,
      required: [true, "username is required"],
    },
    hashedPassword: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "assistant", "user"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    image: {
      type: String,
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Property", //to refer model from which we link this collection
      },
    ],
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;
