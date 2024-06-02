import { Schema, model, models } from "mongoose";
const OTPSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },
    expTime: {
      type: Number,
      required: true,
    },
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
