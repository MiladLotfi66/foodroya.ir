import * as yup from "yup";

// *******************validate********************
const BannerSchema = yup.object().shape({
  BannerBigTitle: yup
    .string()
    .nullable()
    .max(25, "عنوان بنر نمی‌تواند بیشتر از 25 کاراکتر باشد"),

  BannersmallDiscription: yup
    .string()
    .nullable()
    .max(40, "توضیح مختصر بنر نمی‌تواند بیشتر از 40 کاراکتر باشد"),

  BannerDiscription: yup
    .string()
    .nullable()
    .max(120, "توضیح کامل بنر نمی‌تواند بیشتر از 120 کاراکتر باشد"),

  BannerStep: yup
    .string()
    .nullable()
    .max(2, "شماره وارد شده باید بین ۰ تا ۹۹ باشد"),

  BannerTextColor: yup
    .string()
    .required('رنگ متن الزامی است')
    .matches(/^#[0-9A-Fa-f]{6}$/, 'فرمت رنگ معتبر نیست'),

  BannerStatus: yup
    .boolean('فرمت وضعیت بنر صحیح نمی باشد'),

  BannerLink: yup
    .mixed()
    .test('is-url', 'فرمت لینک معتبر نیست', value => {
      if (!value) return true; // اجازه برای وجود نداشتن مقدار
      return /^(https?:\/\/(localhost|127\.0\.0\.1|192\.168\.1\.\d+)(:\d+)?(\/[a-zA-Z0-9-._~:\/?#[\]@!$&'()*+,;=%]*)?)?$/.test(value);
    }),

  BannerImage: yup
    .mixed()
    .test('fileOrUrl', 'فرمت تصویر یا آدرس تصویر معتبر نیست', function(value) {
      if (typeof value === 'string') {
        // بررسی کنید که آیا URL آپلود است یا خیر
        return value.startsWith('/Uploads/');
      }
      if (value && value.length > 0) {
        return value.length > 0;
      }
      return true; // برای URL نیازی به بررسی حجم نیست
    })
    .test('fileSize', 'حجم تصویر باید کمتر از 2 مگابایت باشد', function(value) {
      if (value && typeof value !== 'string' && value.length > 0) {
        return value[0].size <= 2000000; // 2MB in bytes
      }
      return true; // برای URL نیازی به بررسی حجم نیست
    })
    .test('fileType', 'فرمت تصویر باید JPEG، PNG یا WebP باشد', function(value) {
      if (value && typeof value !== 'string' && value.length > 0) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        return allowedTypes.includes(value[0].type);
      }
      return true; // برای URL نیازی به بررسی نوع فایل نیست
    }),
});

export default BannerSchema;
