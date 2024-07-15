import * as yup from "yup";

// تعریف یک قانون مشترک برای فیلدهای تصویر
const imageValidationSchema = yup
  .mixed()
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
    .nullable()
    .max(25, "عنوان فروشگاه نمی‌تواند بیشتر از 25 کاراکتر باشد"),

  ShopSmallDiscription: yup
    .string()
    .nullable()
    .max(70, "توضیح مختصر فروشگاه نمی‌تواند بیشتر از 70 کاراکتر باشد"),

  ShopDiscription: yup
    .string()
    .nullable()
    .max(500, "توضیح کامل فروشگاه نمی‌تواند بیشتر از 500 کاراکتر باشد"),

  ShopAddress: yup
    .string()
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
});

export default ShopSchema;
