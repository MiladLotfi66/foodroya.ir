// app/financialDocuments/FinancialDocumentSchema.js
import * as yup from "yup";

const FinancialDocumentSchema = yup.object().shape({
  title: yup.string().required("عنوان سند مالی الزامی است"),
  shortName: yup.string().required("نام اختصاری سند مالی الزامی است"),
  exchangeRate: yup
    .number()
    .required("نرخ برابری الزامی است")
    .positive("نرخ برابری باید مثبت باشد"),
  decimalPlaces: yup
    .number()
    .required("تعداد اعشار الزامی است")
    .min(0, "تعداد اعشار نمی‌تواند منفی باشد")
    .max(6, "تعداد اعشار نباید بیشتر از ۶ باشد"),
  status: yup
    .string()
    .oneOf(["فعال", "غیرفعال"])
    .required("وضعیت الزامی است"),
  ShopId: yup.string().required("ShopId الزامی است"),
  type: yup
    .string()
    .oneOf(["financialDocument", "invoice"])
    .required("نوع سند الزامی است"),
  entries: yup
    .array()
    .of(
      yup.object().shape({
        account: yup.string().required("حساب الزامی است"),
        debit: yup
          .number()
          .min(0, "بدهکار نمی‌تواند منفی باشد")
          .required("بدهکار الزامی است"),
        credit: yup
          .number()
          .min(0, "بستانکار نمی‌تواند منفی باشد")
          .required("بستانکار الزامی است"),
        currency: yup.string().required("ارز الزامی است"),
        description: yup
          .string()
          .max(255, "توضیحات نباید بیشتر از ۲۵۵ کاراکتر باشد"),
      })
    )
    .min(1, "حداقل یک تراکنش باید وجود داشته باشد"),
});

export default FinancialDocumentSchema;
