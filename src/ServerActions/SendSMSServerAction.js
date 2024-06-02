"use server";

import OTP from "@/models/OTP";
import connectDB from "@/utils/connectToDB";
import axios from "axios";

export async function SendSMSServerAction(data) {
  await connectDB();
  const phone  = data;
  const code = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const date = new Date();
  const expTime = date.getTime() + 180000;
  const currentTime = date.getTime();



  const otpRecord = await OTP.findOne({ phone });

  if (otpRecord) {
    // Check if the last failed attempt was less than 10 minutes ago
    if (otpRecord.useStep >= 5 && otpRecord.lastFailedAttempt && (currentTime - otpRecord.lastFailedAttempt < 10 * 60 * 1000)) {
      return { error: "تعداد تلاش‌های شما به حداکثر رسیده است. لطفاً بعد از ۱۰ دقیقه دوباره سعی کنید.", status: 429 };
    }
  }




  try {
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
      await OTP.create({
        phone,
        otp: code,
        expTime,
        useStep: 0,
        tryStep:0,
      });
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
