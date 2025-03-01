"use server";

import OTP from "@/models/OTP";
import connectDB from "@/utils/connectToDB";
import axios from "axios";

export async function SendSMSServerAction(data) {
  await connectDB();
  const phone = data;
  const code = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const date = new Date();
  const expTime = date.getTime() + 180000;
  const currentTime = date.getTime();
  
  // جستجوی رکورد OTP موجود
  const otpRecord = await OTP.findOne({  identifier: phone });

  if (otpRecord) {
    // بررسی تعداد تلاش‌های ناموفق
    if (otpRecord.useStep >= 5 && otpRecord.lastFailedAttempt && (currentTime - otpRecord.lastFailedAttempt < 10 * 60 * 1000)) {
      return { error: "تعداد تلاش‌های شما به حداکثر رسیده است. لطفاً بعد از ۱۰ دقیقه دوباره سعی کنید.", status: 428 };
    }
    
    // بررسی اعتبار کد قبلی
    if (otpRecord.expTime > currentTime) {
      return {
        error: "کد قبلی هنوز معتبر است، لطفاً بعد از اتمام اعتبار کد فعلی دوباره تلاش کنید.",
        status: 429
      };
    }
  }

  try {
    // ارسال کد از طریق API
    const response = await axios.post("http://ippanel.com/api/select", {
      op: "pattern",
      user: process.env.IPPANEL_USER,
      pass: process.env.IPPANEL_PASS,
      fromNum: "3000505",
      toNum: phone,
      patternCode: "l4p0h3h0vdznka5",
      inputData: [{ "verification-code": code }],
    });

    if (response.status === 200) {
      if (otpRecord) {
        // به‌روزرسانی رکورد موجود
        await OTP.updateOne(
          {  identifier: phone },
          {
            otp: code,
            expTime,
            useStep: 0,
            tryStep: 0,
          }
        );
      } else {
        // ایجاد رکورد جدید اگر وجود نداشت
        await OTP.create({
          otp: code,
          expTime,
          useStep: 0,
          tryStep: 0,
          identifier: phone // استفاده از شماره تلفن به عنوان شناسه
        });
      }
      
      return { message: "کد ارسال شد", status: 200 };
    } else {
      console.log("Error response: ", response.data);
      return { error: "کد ارسال نشد ‍، با پشتیبانی تماس بگیرید", status: 409 };
    }
  } catch (error) {
    console.log("Error: ", error);
    return { error: "کد ارسال نشد ‍، با پشتیبانی تماس بگیرید", status: 407 };
  }
}

