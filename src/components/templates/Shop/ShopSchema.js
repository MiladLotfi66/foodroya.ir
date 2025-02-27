// utils/yupSchemas/ShopSchema.js
import * as yup from "yup";

// فانکشن کمکی برای بررسی URL معتبر
const isValidUrl = (url) => {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)' + // پروتکل
    '((([a-zA-Z0-9\\-])+\\.)+[a-zA-Z]{2,})' + // دامنه
    '(\\/[^\\s]*)?$' // مسیر
  );
  return urlPattern.test(url);
};

const imageValidationSchema = yup
  .mixed()
  .required("وارد کردن تصویر الزامیست")
  .test("fileOrUrl", "فرمت تصویر یا آدرس تصویر معتبر نیست", function (value) {
    if (typeof value === "string") {
      const isValid = isValidUrl(value);
      if (!isValid) {
        console.error("Invalid image URL:", value);
      }
      return isValid;
    }
    if (value instanceof File) {
      return true; // فایل آپلود شده معتبر است
    }
    console.error("Image value is neither a valid URL nor a file:", value);
    return false;
  })
  .test(
    "fileSize",
    "حجم تصویر باید کمتر از 2 مگابایت باشد",
    function (value) {
      if (value instanceof File) {
        const isValid = value.size <= 2000000; // 2MB در بایت
        if (!isValid) {
          console.error("Image file size exceeds limit:", value.size);
        }
        return isValid;
      }
      return true; // برای URL نیازی به بررسی حجم نیست
    }
  )
  .test(
    "fileType",
    "فرمت تصویر باید JPEG، PNG یا WebP باشد",
    function (value) {
      if (value instanceof File) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        const isValid = allowedTypes.includes(value.type);
        if (!isValid) {
          console.error("Invalid image file type:", value.type);
        }
        return isValid;
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
    .required("وارد کردن توضیح کامل الزامیست زیرا این توضیحات در قسمت درباره ی ما قرار می‌گیرد")
    .max(500, "توضیح کامل فروشگاه نمی‌تواند بیشتر از 500 کاراکتر باشد"),

  ShopAddress: yup
    .string()
    .required("وارد کردن آدرس الزامیست")
    .nullable()
    .max(255, "آدرس حداکثر باید ۲۵۵ کاراکتر باشد"),

  ShopPhone: yup
    .string()
    .matches(/^[0-9۰-۹]{3,11}$/, "شماره تلفن وارد شده معتبر نیست")
    .required("وارد کردن فیلد شماره تلفن الزامیست"),

  ShopMobile: yup
    .string()
    .matches(/^[۰-۹0-9]{11}$/, "شماره تلفن وارد شده معتبر نیست")
    .required("وارد کردن فیلد تلفن همراه الزامیست"),

  ShopStatus: yup.boolean("فرمت وضعیت فروشگاه صحیح نمی‌باشد"),
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
    .test(
      "isUnique",
      "این نام فروشگاه تکراری می‌باشد",
      async function (value) {
        const { currentShopId } = this.parent; // دسترسی به currentShopId از داده‌های فرم

        // تعیین URL بر اساس محیط اجرا
        const baseUrl =
          typeof window !== 'undefined'
            ? ''
            : process.env.BASE_URL || 'http://localhost:3000';
        const url = `${baseUrl}/api/shop/checkUnique`;

        try {
          const response = await fetch(url, { // استفاده از URL کامل در محیط سرور
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ShopUniqueName: value, currentShopId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            return this.createError({ message: errorData.error || "خطای سرور" });
          }

          const data = await response.json();

          if (data.error) {
            return this.createError({ message: data.error });
          }
          return true;
        } catch (error) {
          console.error("Error validating ShopUniqueName:", error);
          return this.createError({ message: "خطای شبکه" });
        }
      }
    ),
});

export default ShopSchema;
