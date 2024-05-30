import * as yup from "yup";

// *******************validate********************
const phoneSchema = yup.object().shape({
 
    phone: yup
    .string()
    .matches(/^[۰-۹0-9]{11}$/
    , "شماره تلفن وارد شده معتبر نیست")
    .required("وارد کردن فیلد شماره تلفن الزامیست "),

});

export default phoneSchema;
