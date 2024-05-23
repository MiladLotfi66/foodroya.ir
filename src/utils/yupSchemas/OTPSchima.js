import * as yup from "yup";

// *******************validate********************
const OTPSchima = yup.object().shape({
 
  OTP: yup
    .string().nullable()
    .max(5, "رمز یکبار مصرف باید ۵ رقمی باشد")
    .min(5, "رمز یکبار مصرف باید ۵ رقمی باشد")
    .required("لطفا کد یکبار مصرف را وارد نمایید"),
 

    
});

export default OTPSchima;
