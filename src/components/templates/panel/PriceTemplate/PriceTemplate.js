// models/PriceTemplate.js


import mongoose from 'mongoose';

// تعریف اسکیمای فرمول قیمت برای نقش‌های مختلف
const PricingFormulaSchema = new mongoose.Schema({
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  }],
  formula: {
    type: String,
    required: [true, 'فرمول قیمت الزامی است.'],
    trim: true,
    // می‌توانید از یک رشته ساده استفاده کنید یا یک ساختار پیچیده‌تر مانند JSON برای فرمول‌ها تعریف کنید
  },
}, { _id: false }); // غیرفعال کردن شناسه خودکار برای زیراسکیمای فرمول قیمت

// تعریف اسکیمای قالب قیمتی
const PriceTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان قالب قیمتی الزامی است.'],
    trim: true,
    unique: true, // فرض بر اینکه عنوان قالب قیمتی باید یکتا باشد
    maxlength: [100, 'عنوان قالب قیمتی نباید بیشتر از ۱۰۰ کاراکتر باشد.'],
  },


  decimalPlaces: {
    type: Number,
    default: 2,
    min: [0, 'تعداد اعشار نمی‌تواند منفی باشد.'],
    max: [6, 'تعداد اعشار نمی‌تواند بیشتر از ۶ باشد.'],
  },
  status: {
    type: String,
    enum: ['فعال', 'غیرفعال'],
    default: 'فعال',
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, 'فروشگاه الزامی است.'],
  },
  pricingFormulas: {
    type: [PricingFormulaSchema],
    validate: {
      validator: function(v) {
        // اطمینان از اینکه حداقل یک فرمول قیمت وجود دارد
        return v.length > 0;
      },
      message: 'باید حداقل یک فرمول قیمت وجود داشته باشد.',
    },
  },
  defaultFormula: {
    type: String,
    required: [true, 'فرمول پیش‌فرض قیمت الزامی است.'],
    trim: true,
    // می‌توانید اعتبارسنجی‌های اضافی مانند الگوهای خاص را اضافه کنید
  },
}, {
  timestamps: true, // افزودن فیلدهای createdAt و updatedAt به اسکیمای اصلی
});

// افزودن ایندکس برای بهبود عملکرد جستجو بر اساس فروشگاه
PriceTemplateSchema.index({ shop: 1 });

// module.exports = mongoose.model('PriceTemplate', PriceTemplateSchema);
export default mongoose.models.PriceTemplate || mongoose.model('PriceTemplate', PriceTemplateSchema);
