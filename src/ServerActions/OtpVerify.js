"use server";

import connectDB from "@/utils/connectToDB";
import OTP from "@/models/OTP";
import {  p2e } from "@/utils/ReplaceNumber";

export async function verifyOTP(phone, otp) {
  console.log("phone, otp",phone, otp);
  
  await connectDB();

  if (!phone || !otp) {
    return { error: "شماره تماس و کد یکبار مصرف الزامی است", status: 400 };
  }

  const otpRecord = await OTP.findOne({ identifier:phone });

console.log("otpRecord",otpRecord);

  if (!otpRecord) {
    return { error: "کد یکبار مصرف را اشتباه وارد کرده‌اید", status: 401 };
  }

  const currentTime = new Date().getTime();

  if (otpRecord.useStep >= 5 && otpRecord.lastFailedAttempt && (currentTime - otpRecord.lastFailedAttempt < 10 * 60 * 1000)) {
    return { error: "تعداد تلاش‌های شما به حداکثر رسیده است. لطفاً بعد از ۱۰ دقیقه دوباره سعی کنید.", status: 429 };
  }

  if (otpRecord.otp !== p2e(otp)){

    console.log(typeof(otp),otp);
    console.log(p2e(otp),typeof(p2e(otp)))
    console.log(otpRecord.otp,typeof(otpRecord.otp))
    
    otpRecord.useStep += 1;
    otpRecord.lastFailedAttempt = currentTime; // Update the time of the last failed attempt
    await otpRecord.save();

    return { error: "کد یکبار مصرف وارد شده اشتباه است", status: 401 };
  }

  if (currentTime > otpRecord.expTime) {
    return { error: "اعتبار کد یکبار مصرف به اتمام رسیده است", status: 410 };
  }

  otpRecord.useStep = 0;
  otpRecord.lastFailedAttempt = null;
  await otpRecord.save();
  return { message: "اعتبار سنجی با موفقیت انجام شد", status: 200 };
}
