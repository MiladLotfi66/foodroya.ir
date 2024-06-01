// src/actions/verifyOTP.js

"use server";

import connectDB from "@/utils/connectToDB";
import OTP from "@/models/OTP";

export async function verifyOTP(phone, otp) {
  await connectDB();

  if (!phone || !otp) {
    return { error: "شماره تماس و کد یکبار وصرف الزامی است", status: 400 };
  }

  const otpRecord = await OTP.findOne({ phone, otp });

  if (!otpRecord) {
    return { error: "کد یکبار مصرف را اشتباه وارد کرده اید", status: 401 };
  }

  const currentTime = new Date().getTime();

  if (currentTime > otpRecord.expTime) {
    return { error: "اعتبار کد یکبار مصرف به اتمام رسیده است", status: 410 };
  }

  // Mark OTP as used
  otpRecord.useStep = 1;
  await otpRecord.save();

  // Return success message
  return { message: "اعتبار سنجی با موفقیت انجام شد", status: 200 };
}
