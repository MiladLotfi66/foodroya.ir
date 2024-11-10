import * as yup from 'yup';

const ProductsSchema = yup.object().shape({
  title: yup.string().required("عنوان محصول الزامی است"),
  secondaryTitle: yup.string().optional(),
  items: yup.string().required("نام شی الزامی است"),
  generalFeatures: yup.string().required("مشخصات عمومی الزامی است"),
  // سایر فیلدهای لازم را به همین صورت اضافه کنید
});

export default ProductsSchema;
