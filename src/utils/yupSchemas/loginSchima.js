import * as yup from "yup";

// *******************validate********************
const loginSchima = yup.object().shape({
  phone: yup
    .string()
    .matches(/^[۰-۹0-9]{11}$/
    , "شماره تلفن وارد شده معتبر نیست")
    .required("وارد کردن فیلد شماره تلفن الزامیست "),
 
  password: yup
    .string()
    .min(8, "پسورد باید حداقل 8 کاراکتر باشد، شامل حروف کوچک و بزرگ و یک عدد و یک نشانه")
    .matches(/[a-z]/,"پسورد باید حداقل 8 کاراکتر باشد، شامل حروف کوچک و بزرگ و یک عدد و یک نشانه")
    .matches(/[A-Z]/, "پسورد باید حداقل 8 کاراکتر باشد، شامل حروف کوچک و بزرگ و یک عدد و یک نشانه")
    .matches(/[0-9]/, "پسورد باید حداقل 8 کاراکتر باشد، شامل حروف کوچک و بزرگ و یک عدد و یک نشانه")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "پسورد باید حداقل 8 کاراکتر باشد، شامل حروف کوچک و بزرگ و یک عدد و یک نشانه")
    .required("وارد کردن فیلد پسورد اجباری است"),
  
});

export default loginSchima;
