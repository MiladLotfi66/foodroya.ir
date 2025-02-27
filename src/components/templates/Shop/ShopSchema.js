// utils/yupSchemas/ShopSchema.js
import * as yup from "yup";

// تابع کمکی برای اعتبارسنجی ObjectId بدون نیاز به mongoose
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const ShopSchema = yup.object().shape({
  // نام منحصر به فرد فروشگاه
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
            ? '' // اگر در محیط کلاینت هستیم مسیر مطلق نیست
            : process.env.BASE_URL || 'http://localhost:3000'; // تنظیم BASE_URL مناسب در سرور

        const url = `${baseUrl}/api/shop/checkUnique`;

        try {
          const response = await fetch(url, { // ارسال درخواست به سرور
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

  // نام فروشگاه
  ShopName: yup
    .string()
    .required("وارد کردن نام فروشگاه الزامیست")
    .min(3, "نام فروشگاه باید حداقل 3 کاراکتر باشد")
    .max(50, "نام فروشگاه نمی‌تواند بیشتر از 50 کاراکتر باشد"),

  // توضیح کوتاه فروشگاه
  ShopSmallDiscription: yup
    .string()
    .required("وارد کردن توضیح کوتاه فروشگاه الزامیست")
    .max(200, "توضیح کوتاه نمی‌تواند بیشتر از 200 کاراکتر باشد"),
  
  // توضیح کامل فروشگاه
  ShopDiscription: yup
    .string()
    .required("وارد کردن توضیح فروشگاه الزامیست")
    .max(1000, "توضیح فروشگاه نمی‌تواند بیشتر از 1000 کاراکتر باشد"),

  // آدرس فروشگاه
  ShopAddress: yup
    .string()
    .required("وارد کردن آدرس فروشگاه الزامیست")
    .max(200, "آدرس فروشگاه نمی‌تواند بیشتر از 200 کاراکتر باشد"),

  // شماره تلفن ثابت فروشگاه
  ShopPhone: yup
    .string()
    .required("وارد کردن شماره تلفن فروشگاه الزامیست")
    .matches(/^[0-9]{10,11}$/, "شماره تلفن باید 10 یا 11 رقم باشد"),

  // شماره همراه فروشگاه
  ShopMobile: yup
    .string()
    .required("وارد کردن شماره همراه فروشگاه الزامیست")
    .matches(/^[0-9]{11}$/, "شماره همراه باید 11 رقم باشد"),

  // وضعیت فروشگاه
  ShopStatus: yup
    .string()
    .required("وارد کردن وضعیت فروشگاه الزامیست")
    .oneOf(["active", "inactive"], "وضعیت فروشگاه نامعتبر است"),

  // لوگو فروشگاه
  Logo: yup
    .mixed()
    .nullable()
    .test("fileSize", "حجم لوگو نباید بیشتر از 2 مگابایت باشد", value => {
      if (!value) return true; // اگر فایل انتخاب نشده، اعتبارسنجی پاس می‌شود
      return value.size <= 2000000; // 2MB
    })
    .test("fileType", "فرمت لوگو باید JPG یا PNG باشد", value => {
      if (!value) return true;
      return ["image/jpeg", "image/png"].includes(value.type);
    }),

  // متن لوگو
  TextLogo: yup
    .string()
    .required("وارد کردن متن لوگو الزامیست")
    .max(50, "متن لوگو نمی‌تواند بیشتر از 50 کاراکتر باشد"),

  // پس‌زمینه فروشگاه
  BackGroundShop: yup
    .mixed()
    .nullable()
    .test("fileSize", "حجم پس‌زمینه فروشگاه نباید بیشتر از 5 مگابایت باشد", value => {
      if (!value) return true;
      return value.size <= 5000000; // 5MB
    })
    .test("fileType", "فرمت پس‌زمینه فروشگاه باید JPG یا PNG باشد", value => {
      if (!value) return true;
      return ["image/jpeg", "image/png"].includes(value.type);
    }),

  // پس‌زمینه پنل فروشگاه
  BackGroundpanel: yup
    .mixed()
    .nullable()
    .test("fileSize", "حجم پس‌زمینه پنل نباید بیشتر از 5 مگابایت باشد", value => {
      if (!value) return true;
      return value.size <= 5000000;
    })
    .test("fileType", "فرمت پس‌زمینه پنل باید JPG یا PNG باشد", value => {
      if (!value) return true;
      return ["image/jpeg", "image/png"].includes(value.type);
    }),

  // currentShopId (فقط برای ویرایش، اختیاری)
  currentShopId: yup
    .string()
    .nullable()
    .notRequired()
    .test("isValidObjectId", "شناسه فروشگاه نامعتبر است", value => {
      if (!value) return true; // اگر مقدار ندارد، پاس می‌شود
      return isValidObjectId(value);
    }),
});

export default ShopSchema;
