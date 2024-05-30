"use server";

import OTP from "@/models/OTP";
import axios from "axios";

export async function SendSMSServerAction(formData) {
  const { phone } = formData;
  const code = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const date = new Date();
  const expTime = date.getTime() + 300000;

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
      });
      return { message: "کد ارسال شد", status: 200 };
    } else {
      console.log("Error response: ", response.data);
      return { error: "کد ارسال نشد ‍، با پشتیبانی تماس بگیرید", status: 409 };
    }
  } catch (error) {
    console.log("Error: ", error);
    return { message: "Code not sent", status: 409 };
  }
}
