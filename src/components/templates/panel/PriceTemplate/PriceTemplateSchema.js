// PriceTemplateSchema.js

import * as yup from "yup";

const PriceTemplateSchema = yup.object().shape({
  name: yup.string().required("نام قالب قیمتی الزامی است.").max(100, "نام قالب قیمتی نباید بیشتر از ۱۰۰ کاراکتر باشد."),
  description: yup.string().required("توضیحات قالب قیمتی الزامی است.").max(500, "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد."),
  basePrice: yup.number().required("قیمت پایه الزامی است.").min(0, "قیمت پایه نمی‌تواند منفی باشد."),
  decimalPlaces: yup.number().required("تعداد اعشار الزامی است.").min(0, "تعداد اعشار نمی‌تواند منفی باشد.").max(6, "تعداد اعشار نمی‌تواند بیشتر از ۶ باشد."),
  status: yup.string().oneOf(["فعال", "غیرفعال"], "وضعیت باید فعال یا غیرفعال باشد.").required("وضعیت الزامی است."),
  shopUniqName: yup.string().required("نام یکتا فروشگاه الزامی است."),
  pricingFormulas: yup.array().of(
    yup.object().shape({
      roles: yup.array().of(yup.string().required("نقش الزامی است.")).min(1, "حداقل یک نقش باید انتخاب شود."),
      formula: yup.string().required("فرمول قیمت الزامی است."),
    })
  ).min(1, "باید حداقل یک فرمول قیمت وجود داشته باشد."),
  defaultFormula: yup.string().required("فرمول پیش‌فرض قیمت الزامی است."),
});

export default PriceTemplateSchema;
