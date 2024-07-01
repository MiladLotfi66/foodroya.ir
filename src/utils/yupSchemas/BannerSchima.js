import * as yup from "yup";

const SITE_URL = process.env.NEXTAUTH_URL;


// *******************validate********************
const BannerSchima = yup.object().shape({
    BannerBigTitle: yup
    .string().nullable()
    .max(25, "عنوان بنر نمی‌تواند بیشتر از 25 کاراکتر باشد"),

    BannersmallDiscription: yup
    .string().nullable()
    .max(40, "توضیح مختصر بنر نمی‌تواند بیشتر از 40 کاراکتر باشد"),  

    BannerDiscription: yup
    .string().nullable()
    .max(120, "توضیح کامل بنر نمی‌تواند بیشتر از 120 کاراکتر باشد"),
 
    BannerStep: yup
    .string().nullable()
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
    .required('تصویر بنر الزامی است')
    .test('fileSize', 'حجم تصویر باید کمتر از 2 مگابایت باشد', (value) => {
      if (value && value.length > 0) {
        return value[0].size <= 2000000; // 2MB in bytes
      }
      return false;
    })
    .test('fileType', 'فرمت تصویر باید JPEG، PNG یا WebP باشد', (value) => {
      if (value && value.length > 0) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        return allowedTypes.includes(value[0].type);
      }
      return false;
    }),
});

export default BannerSchima;
