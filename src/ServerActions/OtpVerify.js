// src/actions/verifyOTP.js

"use server";

import connectDB from "@/utils/connectToDB";
import OTP from "@/models/OTP";
// import CustomError from "@/utils/CustomError";

export async function verifyOTP(phone, otp) {
  await connectDB();

  if (!phone || !otp) {
    // throw new CustomError("Phone and OTP are required", 400);
    return { error: "Phone and OTP are required", status: 400 };

  }

  const otpRecord = await OTP.findOne({ phone, otp });

  if (!otpRecord) {
    // throw new CustomError("Invalid OTP", 401);
    return { error: "Invalid OTP", status: 401 };

  }

  const currentTime = new Date().getTime();

  if (currentTime > otpRecord.expTime) {
    // throw new CustomError("OTP expired", 410);
    return { error: "OTP expired", status: 410 };

  }

  // Mark OTP as used
  otpRecord.useStep = 1;
  await otpRecord.save();

  // Return success message
  return { message: "اعتبار سنجی با موفقیت انجام شد", status: 200 };
}
