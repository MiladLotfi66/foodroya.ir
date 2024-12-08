import * as yup from "yup";
import { isUniqShop } from "@/templates/Shop/ShopServerActions";

// تعریف یک قانون مشترک برای فیلدهای تصویر
const imageValidationSchema = yup
  .mixed()
  .required("وارد کردن تصویر الزامیست")
  .test("fileOrUrl", "فرمت تصویر یا آدرس تصویر معتبر نیست", function (value) {
    if (typeof value === "string") {
      // بررسی کنید که آیا URL آپلود است یا خیر
      return value.startsWith("/Uploads/");
    }
    if (value && value.length > 0) {
      return value.length > 0;
    }
    return true; // برای URL نیازی به بررسی حجم نیست
  })
  .test(
    "fileSize",
    "حجم تصویر باید کمتر از 2 مگابایت باشد",
    function (value) {
      if (value && typeof value !== "string" && value.length > 0) {
        return value[0].size <= 2000000; // 2MB in bytes
      }
      return true; // برای URL نیازی به بررسی حجم نیست
    }
  )
  .test(
    "fileType",
    "فرمت تصویر باید JPEG، PNG یا WebP باشد",
    function (value) {
      if (value && typeof value !== "string" && value.length > 0) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp","image/jpg"];
        return allowedTypes.includes(value[0].type);
      }
      return true; // برای URL نیازی به بررسی نوع فایل نیست
    }
  );

const ShopSchema = yup.object().shape({

 
  
  ShopName: yup
    .string()
    .required("وارد کردن عنوان فروشگاه الزامیست")
    .max(25, "عنوان فروشگاه نمی‌تواند بیشتر از 25 کاراکتر باشد"),

  ShopSmallDiscription: yup
    .string()
    .required("وارد کردن توضیح مختصر الزامیست")
    .max(70, "توضیح مختصر فروشگاه نمی‌تواند بیشتر از 70 کاراکتر باشد"),

  ShopDiscription: yup
    .string()
    .required("وارد کردن توضیح کامل الزامیست زیرا این توضیحات در قسمت درباره ی ما قرار می گیرد ")
    .max(500, "توضیح کامل فروشگاه نمی‌تواند بیشتر از 500 کاراکتر باشد"),

  ShopAddress: yup
    .string()
    .required("وارد کردن آدرس الزامیست")

    .nullable()
    .max(255, "آدرس حداکثر باید ۲۵۵ کاراکتر باشد"),

  ShopPhone: yup
    .string()
    .matches(/^[0-9۰-۹]{3,11}$/, "شماره تلفن وارد شده معتبر نیست")
    .required("وارد کردن فیلد شماره تلفن الزامیست "),

  ShopMobile: yup
    .string()
    .matches(/^[۰-۹0-9]{11}$/, "شماره تلفن وارد شده معتبر نیست")
    .required("وارد کردن فیلد تلفن همراه الزامیست "),

  ShopStatus: yup.boolean("فرمت وضعیت فروشگاه صحیح نمی باشد"),

  Logo: imageValidationSchema,
  TextLogo: imageValidationSchema,
  BackGroundShop: imageValidationSchema,
  BackGroundpanel: imageValidationSchema,
  ShopUniqueName: yup
  .string()
  .required("وارد کردن نام منحصر به فرد فروشگاه الزامیست")
  .min(5, "نام منحصر به فرد فروشگاه باید حداقل 5 کاراکتر باشد")
  .max(30, "نام منحصر به فرد فروشگاه نمی‌تواند بیشتر از 30 کاراکتر باشد")
  .matches(/^\w+$/, "نام منحصر به فرد فروشگاه باید فقط شامل حروف، اعداد و زیرخط باشد")
  .test("isUnique", "این نام فروشگاه تکراری می باشد", async function (value) {
    const { error } = await isUniqShop(value);
    return !error;
  })
  ,
});

export default ShopSchema;
