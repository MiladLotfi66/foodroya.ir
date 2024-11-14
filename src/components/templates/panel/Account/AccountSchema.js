// utils/yupSchemas/AccountSchema.js
import * as yup from 'yup';

const AccountSchema = yup.object().shape({
  // این فیلد ممکن است در هنگام ایجاد حساب جدید از سمت کلاینت ارسال نشود
  // چون سرور آن را تولید می‌کند. بنابراین می‌توانید آن را در هنگام ایجاد غیرفعال کنید.
//   accountCode: yup.string()
//     .optional(), // یا می‌توانید از .notRequired() استفاده کنید
//   store: yup.string()
//     .length(24, 'شناسه فروشگاه نامعتبر است.')
//     .required('فروشگاه الزامی است.'), // فرض بر این است که ObjectId است
  title: yup.string()
    .max(50, 'عنوان حساب باید حداکثر ۵۰ کاراکتر باشد.')
    .required('عنوان حساب الزامی است.'),
//   parentAccount: yup.string()
//     .length(24, 'شناسه حساب والد نامعتبر است.')
//     .nullable(),
  accountType: yup.string()
    .oneOf(['صندوق', 'حساب عادی', 'حساب بانکی', 'کالا', 'دسته بندی کالا', 'اشخاص حقیقی', 'اشخاص حقوقی',"حساب انتظامی" ,"انبار"], 'نوع حساب نامعتبر است.')
    .required('نوع حساب الزامی است.'),
//   accountNature: yup.string()
//     .required('ماهیت حساب الزامی است.'), // اطمینان حاصل کنید که این فیلد با تغییرات سرور هماهنگ است
  accountStatus: yup.string()
    .oneOf(['فعال', 'غیر فعال'], 'وضعیت حساب نامعتبر است.')
    .required('وضعیت حساب الزامی است.'),
//   createdBy: yup.string()
//     .length(24, 'شناسه ایجاد کننده نامعتبر است.')
//     .required('ایجاد کننده الزامی است.'),
//   updatedBy: yup.string()
//     .length(24, 'شناسه ویرایش کننده نامعتبر است.')
//     .nullable(),
//   isSystem: yup.boolean(),
});

export default AccountSchema;
