import * as yup from "yup";

const SendMetodSchema = yup.object().shape({
  // شناسه فروشگاه (ShopId)؛ جهت اعتبارسنجی ObjectId می‌توانید از regex استفاده کنید
  ShopId: yup
    .string()
    .nullable()
    .matches(/^[0-9a-fA-F]{24}$/, "شناسه فروشگاه معتبر نیست")
    .notRequired(),

  // عنوان روش ارسال: الزامی و حداکثر 25 کاراکتر (می‌توانید مقدار max را بر اساس نیاز تغییر دهید)
  Title: yup
    .string()
    .required("عنوان روش ارسال الزامی است")
    .trim()
    .max(25, "عنوان روش ارسال نمی‌تواند بیشتر از 25 کاراکتر باشد"),

  // توضیحات روش ارسال: می‌تواند nullable باشد و حداکثر 120 کاراکتر مجاز است
  Description: yup
    .string()
    .nullable()
    .trim()
    .max(120, "توضیحات روش ارسال نمی‌تواند بیشتر از 120 کاراکتر باشد"),

  // فیلد Price: الزامی؛ مقدار باید "رایگان" یا عددی معتبر باشد.
  Price: yup
    .string()
    .required("وارد کردن قیمت یا مقدار 'رایگان' الزامی است")
    .trim()
    .test(
      "is-valid-price",
      'مقدار وارد شده باید "رایگان" یا یک عدد باشد',
      function (value) {
        if (value === "رایگان") return true;
        return !isNaN(Number(value));
      }
    ),

  // شناسه کاربری آخرین ویرایش یا مدیر ویرایش؛ مجاز به دریافت ObjectId (می‌توانید اعتبارسنجی regex اضافه کنید)
  LastEditedBy: yup
    .string()
    .nullable()
    .matches(/^[0-9a-fA-F]{24}$/, "شناسه ویرایشگر معتبر نیست")
    .notRequired(),

  // شناسه کاربری ایجادکننده؛ مجاز به دریافت ObjectId (می‌توانید اعتبارسنجی regex اضافه کنید)
  CreatedBy: yup
    .string()
    .nullable()
    .matches(/^[0-9a-fA-F]{24}$/, "شناسه ایجاد کننده معتبر نیست")
    .notRequired(),

  // آدرس تصویر (imageUrl) که الزامی است
  imageUrl: yup
    .string()
    .required("تصویر روش ارسال الزامی است")
    .trim(),

  // وضعیت روش ارسال: باید مقدار بولی داشته و الزامی است
  SendMetodStatus: yup
    .boolean()
    .required("وضعیت روش ارسال الزامی است"),
});

export default SendMetodSchema;
