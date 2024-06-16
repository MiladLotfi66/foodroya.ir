import * as yup from "yup";

// *******************validate********************
const BannerSchima = yup.object().shape({
    BannerBigTitle: yup
    .string().nullable()
    .max(25, "عنوان بنر بنر نمی‌تواند بیشتر از 25 کاراکتر باشد"),


    BannersmallDiscription: yup
    .string().nullable()
    .max(40, "توضیح مختصر بنر نمی‌تواند بیشتر از 40 کاراکتر باشد"),  


    BannerDiscription: yup
    .string().nullable()
    .max(120, "توضیح کامل بنر نمی‌تواند بیشتر از 120 کاراکتر باشد"),
 
    BannerStep: yup
    .string().nullable()
    .max(2, "شماره وارد شده باید بین ۰ تا ۹۹ باشد"),


    BannerImage: yup
    .mixed()
    .required('تصویر بنر الزامی است')
    .test('fileSize', 'حجم تصویر باید کمتر از 2 مگابایت باشد', (value) => {
      if (value && value.length > 0) {
        return value[0].size <= 2000000; // 2MB in bytes
      }
      return false;
    })
    .test('fileType', 'فرمت تصویر باید JPEG یا PNG باشد', (value) => {
      if (value && value.length > 0) {
        return value[0].type === 'image/jpeg' || value[0].type === 'image/png';
      }
      return false;
    }),
  
});

export default BannerSchima;
