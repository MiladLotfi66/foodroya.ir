import * as yup from "yup";

// *******************validate********************
const OTPSchima = yup.object().shape({
  OTP: yup
    .string()
    .matches(/^[۰-۹0-9]{5}$/, "کد وارد شده معتبر نیست")
    .nullable()
    .required("لطفا کد یکبار مصرف را وارد نمایید"),
  
});

export default OTPSchima;
