// models/Account.js

import { Schema, model, models } from "mongoose";

// تعریف اسکیما حساب
const accountSchema = new Schema(
  {
    // کدینگ حساب
    accountCode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255, // حداکثر 255 کاراکتر
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
      ref: "Shop",
      required: true,
    },
    // حساب والد: ارجاع به مدل Account (خود مدل)
    parentAccount: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    // نوع حساب: صندوق، حساب عادی، حساب بانکی، کالا، دسته بندی کالا، اشخاص حقیقی، اشخاص حقوقی
    accountType: {
      type: String,
      enum: [
      ],
      required: true,
      maxlength: 255,
    },
    // ماهیت حساب
    accountNature: {
      type: String,
      enum: ["بستانکار", "بدون ماهیت", "بدهی"],
      required: true,
      trim: true,
      maxlength: 55,
    },
    // وضعیت حساب: فعال یا غیر فعال
    accountStatus: {
      type: String,
      enum: ["فعال", "غیر فعال"],
      default: "فعال",
      required: true,
    },
    // ایجاد کننده: ارجاع به مدل User
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ویرایش کننده: ارجاع به مدل User
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // سیستمی: مشخص می‌کند که حساب جزو حساب‌های سیستمی است یا خیر
    isSystem: {
      type: Boolean,
      default: false,
    },
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: function () {
        return (
          this.accountType === "اشخاص حقیقی" ||
          this.accountType === "اشخاص حقوقی"
        );
      },
    },
    creditLimit: {
      type: Number, // یا نوع مناسب دیگر
      required: function () {
        return (
          this.accountType === "اشخاص حقیقی" ||
          this.accountType === "اشخاص حقوقی"
        );
      },
    },
    balance: {
      type: Number,
      default: 0,
      required: true,
      min: [0, "مانده حساب نمی‌تواند منفی باشد."],
      validate: {
        validator: function (value) {
          const restrictedTypes = ["کالا", "صندوق", "حساب بانکی"];
          if (restrictedTypes.includes(this.accountType)) {
            return value >= 0;
          }
          return true; // برای سایر انواع، محدودیتی اعمال نمی‌شود
        },
        message: "مانده حساب برای نوع مورد نظر نمی‌تواند منفی باشد.",
      },
    },
    posConected: {
      type: Boolean, // یا نوع مناسب دیگر
      required: function () {
        return this.accountType === "حساب بانکی";
      },
    },
    bankAcountNumber: {
      type: String,
      maxlength: 55,
    },
    bankCardNumber: {
      type: String,
      maxlength: 55,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: function () {
        return this.accountType === "کالا";
      },
      default: null,
    },
  },
  {
    // افزودن گزینه timestamps برای مدیریت خودکار createdAt و updatedAt
    timestamps: true,
  }
);

// تعریف اندیس ترکیبی برای یکتایی accountCode در هر فروشگاه
accountSchema.index({ accountCode: 1, store: 1 }, { unique: true });

// عنوان حساب تعریف اندیس ترکیبی برای یکتایی در هر والد
accountSchema.index({ parentAccount: 1, title: 1, store: 1 }, { unique: true });

/**
 * Middleware برای جلوگیری از منفی شدن مانده حساب صندوق هنگام ذخیره
 */
accountSchema.pre('save', function (next) {
  if (this.accountType === "صندوق" && this.balance < 0) {
    return next(new Error('مانده حساب صندوق نمی‌تواند منفی باشد.'));
  }
  next();
});

/**
 * Middleware برای جلوگیری از منفی شدن مانده حساب صندوق هنگام بروزرسانی
 */
accountSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate();

    // بررسی اگر عملیات بروزرسانی شامل افزایش/کاهش مانده حساب باشد
    if (update.$inc && update.$inc.balance) {
      const account = await this.model.findOne(this.getQuery()).exec();
      const newBalance = account.balance + update.$inc.balance;

      if (account.accountType === "صندوق" && newBalance < 0) {
        return next(new Error('بروزرسانی مانده حساب صندوق منجر به منفی شدن آن می‌شود.'));
      }
    }

    // اگر مانده حساب مستقیماً تنظیم شده باشد
    if (update.balance !== undefined) {
      const account = await this.model.findOne(this.getQuery()).exec();
      const newBalance = update.balance;

      if (account.accountType === "صندوق" && newBalance < 0) {
        return next(new Error('تنظیم مانده حساب صندوق به مقدار منفی مجاز نیست.'));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Middleware برای جلوگیری از منفی شدن مانده حساب صندوق هنگام به‌روزرسانی با سایر عملگرها
 */
accountSchema.pre('updateOne', async function (next) {
  try {
    const update = this.getUpdate();

    // بررسی اگر عملیات بروزرسانی شامل افزایش/کاهش مانده حساب باشد
    if (update.$inc && update.$inc.balance) {
      const account = await this.model.findOne(this.getQuery()).exec();
      const newBalance = account.balance + update.$inc.balance;

      if (account.accountType === "صندوق" && newBalance < 0) {
        return next(new Error('بروزرسانی مانده حساب صندوق منجر به منفی شدن آن می‌شود.'));
      }
    }

    // اگر مانده حساب مستقیماً تنظیم شده باشد
    if (update.balance !== undefined) {
      const account = await this.model.findOne(this.getQuery()).exec();
      const newBalance = update.balance;

      if (account.accountType === "صندوق" && newBalance < 0) {
        return next(new Error('تنظیم مانده حساب صندوق به مقدار منفی مجاز نیست.'));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Account = models.Account || model("Account", accountSchema);

export default Account;
