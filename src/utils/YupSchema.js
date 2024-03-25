
import * as yup from "yup";

// *******************validate********************
const RegisterSchema = yup.object().shape({
    email: yup.string().email("ایمیل وارد شده معتبر نمی باشد").required("وارد کردن فیلد ایمیل اجباری است"),
    password: yup.string().required("وارد کردن فیلد پسورد اجباری است"),
  });


export default RegisterSchema
