// src/actions/verifyOTP.js

"use server";

import connectDB from "@/utils/connectToDB";
import OTP from "@/models/OTP";

export async function verifyOTP(phone, otp) {
  await connectDB();

  if (!phone || !otp) {
    throw new Error("Phone and OTP are required");
  }

  const otpRecord = await OTP.findOne({ phone, otp });

  if (!otpRecord) {
    throw new Error("Invalid OTP");
  }

  const currentTime = new Date().getTime();

  if (currentTime > otpRecord.expTime) {
    throw new Error("OTP expired");
  }

  // Mark OTP as used
  otpRecord.useStep = 1;
  await otpRecord.save();

  // Return success message
  return { message: "OTP verified successfully" };
}
