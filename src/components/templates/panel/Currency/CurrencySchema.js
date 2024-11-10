// utils/yupSchemas/CurrencySchema.js
import * as yup from 'yup';

const CurrencySchema = yup.object().shape({
  title: yup.string().required('عنوان ارز الزامی است.'),
  shortName: yup.string().required('نام اختصاری ارز الزامی است.'),
  exchangeRate: yup.number().required('نرخ برابری الزامی است.'),
  decimalPlaces: yup.number().min(0).max(6).required('تعداد اعشار الزامی است.'),
  status: yup.string().oneOf(['فعال', 'غیرفعال']).required('وضعیت ارز الزامی است.'),
});

export default CurrencySchema;
