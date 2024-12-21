// validation/ledgerValidation.js
import * as yup from 'yup';

export const ledgerValidationSchema = yup.object().shape({
  // ShopId: yup.string()
  //   .required('شناسه فروشگاه الزامی است')
  //   .matches(/^[0-9a-fA-F]{24}$/, 'شناسه فروشگاه نامعتبر است'),
  

      
  description: yup.string()
    .required('توضیحات الزامی است')
    .max(255, 'حداکثر طول توضیحات 255 کاراکتر است'),

  debtors: yup.array().of(
    yup.object().shape({
      account: yup.string()
        .nullable()
        .required('انتخاب حساب الزامی است')
        .matches(/^[0-9a-fA-F]{24}$/, 'شناسه حساب نامعتبر است'),
      amount: yup.number()
        .typeError('مبلغ باید یک عدد باشد')
        .required('مبلغ بدهکار الزامی است')
        .min(0, 'مبلغ بدهکار باید غیر منفی باشد'),
    })
  )
  .min(1, 'باید حداقل یک حساب بدهکار انتخاب کنید')
  .required('بدهکارها الزامی هستند'),

  creditors: yup.array().of(
    yup.object().shape({
      account: yup.string()
        .nullable()
        .required('انتخاب حساب الزامی است')
        .matches(/^[0-9a-fA-F]{24}$/, 'شناسه حساب نامعتبر است'),
      amount: yup.number()
        .typeError('مبلغ باید یک عدد باشد')
        .required('مبلغ بستانکار الزامی است')
        .min(0, 'مبلغ بستانکار باید غیر منفی باشد'),
    })
  )
  .min(1, 'باید حداقل یک حساب بستانکار انتخاب کنید')
  .required('بستانکارها الزامی هستند'),
})
.test('balance', 'مجموع بدهکارها باید برابر با مجموع بستانکارها باشد', function (value) {
  const { debtors, creditors } = value;
  const totalDebtors = debtors?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
  const totalCreditors = creditors?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
  return totalDebtors === totalCreditors;
});
