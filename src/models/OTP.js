import { Schema, model, models } from "mongoose";

const OTPSchema = new Schema(
  {
    identifier: { type: String, required: true, unique: true }, // شماره تلفن، ایمیل یا نام کاربری

    // phone: {
    //   type: String,
    //   required: true,
    // },

    otp: {
      type: String,
      required: true,
    },
    expTime: { type: Date, required: true }, // نوع Date تنظیم شده است

    useStep: {
      type: Number,
      required: true,
    },
    lastFailedAttempt: {
      type: Number,
      default: null,
    }, // New field for tracking the last failed attempt time
  },
  { timestamps: true }
);

export default models.OTP || model("OTP", OTPSchema);
