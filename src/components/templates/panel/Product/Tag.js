import { Schema, model, models } from "mongoose";

// تعریف اسکیمای تگ‌ها
const TagSchema = new Schema({
  // نام تگ (باید یکتا باشد)
  name: {
    type: String,
    required: true, // این فیلد اجباری است
    unique: true,   // نام تگ باید یکتا باشد
    trim: true,     // حذف فضاهای اضافی از ابتدا و انتهای رشته
    minlength: [2, 'نام تگ باید حداقل 2 کاراکتر باشد'],  // حداقل طول نام تگ
    maxlength: [50, 'نام تگ نباید بیشتر از ۵۰ کاراکتر باشد'],  // حداکثر طول نام تگ
  },

  CreatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // تغییر نام از 'Users' به 'User'
  },

  
  // تاریخ ایجاد و آخرین تغییر
  createdAt: { type: Date, default: Date.now },
});

// ایندکس‌گذاری برای افزایش سرعت جستجو بر اساس نام
TagSchema.index({ name: 'text' });  // این ایندکس به جستجوهای متنی کمک می‌کند

// ایندکس‌گذاری برای جستجو بر اساس نام در حالت غیر حساس به حروف بزرگ و کوچک
TagSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 1 } });

// ایجاد مدل تگ‌ها
export default models.Tag || model("Tag", TagSchema);
