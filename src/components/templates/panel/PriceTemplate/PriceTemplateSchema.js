// PriceTemplateSchema.js

import * as yup from "yup";

const PriceTemplateSchema = yup.object().shape({
  title: yup.string().required("نام قالب قیمتی الزامی است.").max(100, "نام قالب قیمتی نباید بیشتر از ۱۰۰ کاراکتر باشد."),
  type: yup.string().required("نوع سند الزامی است"),

  status: yup.string().oneOf(["فعال", "غیرفعال"], "وضعیت باید فعال یا غیرفعال باشد.").required("وضعیت الزامی است."),
  pricingFormulas: yup.array().of(
    yup.object().shape({
      roles: yup.array().of(yup.string().required("نقش الزامی است.")).min(1, "حداقل یک نقش باید انتخاب شود."),
      formula: yup.string().required("فرمول قیمت الزامی است."),
    })
  ).min(1, "باید حداقل یک فرمول قیمت وجود داشته باشد."),
  defaultFormula: yup.string().required("فرمول پیش‌فرض قیمت الزامی است."),
});

export default PriceTemplateSchema;
