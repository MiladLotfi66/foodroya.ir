// models/Account.js

import { Schema, model, models } from "mongoose";


const accountSchema = new Schema({
  // کدینگ حساب
  accountCode: {
    type: String,
    required: true,
    trim: true ,
    maxlength: 255,     // حداکثر 255 کاراکتر

  },
  // عنوان حساب
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  // فروشگاه: ارجاع به مدل Store
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },

  // حساب والد: ارجاع به مدل Account (خود مدل)
  parentAccount: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    default: null
  },

  // نوع حساب: صندوق، حساب عادی، حساب بانکی، کالا، دسته بندی کالا، اشخاص حقیقی، اشخاص حقوقی
  accountType: {
    type: String,
    enum: [
      'صندوق',
      'حساب عادی',
      'حساب بانکی',
      'کالا',
      'دسته بندی کالا',
      'اشخاص حقیقی',
      'اشخاص حقوقی',
      'حساب انتظامی',
      
    ],
    required: true,
    maxlength: 255,
  },

  // ماهیت حساب
  accountNature: {
    type: String,
    required: true,
    trim: true,
    maxlength: 55,
  },

  // وضعیت حساب: فعال یا غیر فعال
  accountStatus: {
    type: String,
    enum: ['فعال', 'غیر فعال'],
    default: 'فعال',
    required: true
  },

  // ایجاد کننده: ارجاع به مدل User
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ویرایش کننده: ارجاع به مدل User
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // تاریخ ایجاد و ویرایش
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // سیستمی: مشخص می‌کند که حساب جزو حساب‌های سیستمی است یا خیر
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  // افزودن گزینه timestamps برای مدیریت خودکار createdAt و updatedAt
  timestamps: true
});

// تعریف اندیس ترکیبی برای یکتایی accountCode در هر فروشگاه
accountSchema.index({ accountCode: 1, store: 1 }, { unique: true });

//  عنوان حساب تعریف اندیس ترکیبی برای یکتایی در هر والد
accountSchema.index({ parentAccount: 1, title: 1 }, { unique: true });

// Middleware برای به‌روزرسانی updatedAt قبل از ذخیره
accountSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware برای به‌روزرسانی updatedAt قبل از بروزرسانی
accountSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

export default models.Account || model("Account", accountSchema);
