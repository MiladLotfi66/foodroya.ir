import * as yup from "yup";

const ContactSchema = yup.object().shape({
  name: yup
    .string()
    .required("نام الزامی است")
    .min(2, "نام باید حداقل 2 حرف باشد"),
  address: yup
    .string()
    .min(5, "آدرس باید حداقل 5 حرف باشد"),
  phoneNumber: yup
    .string()
    .required("شماره تماس الزامی است")
    .matches(/^[0-9]{11}$/, "شماره تماس باید 11 رقم باشد"),
  email: yup
    .string()
    .email("ایمیل نامعتبر است"),
  nationalId: yup
    .string()
    .notRequired(),
  shopUniqName: yup.string().required(),
});

export default ContactSchema;
