import { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs"; // استفاده از bcryptjs به جای bcrypt

const SALT_ROUNDS = 10;

// تعریف اسکیما برای سوال امنیتی
const SecurityQuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
      trim: true,
    },
  },
  { _id: false }
);

// تعریف اسکیما برای کاربر
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,      // حداقل 3 کاراکتر
      maxlength: 30,     // حداکثر 30 کاراکتر
      trim: true,        // حذف فاصله‌های اضافی از ابتدا و انتها
    },  
    userImage: {
      type: String,
      maxlength: 500,    // حداکثر 500 کاراکتر (URL طولانی)
    }, 
    email: {
      type: String,
      required: false,
      match: [/\S+@\S+\.\S+/, 'لطفاً از فرمت ایمیل معتبر استفاده کنید.'], // اعتبارسنجی فرمت ایمیل
      maxlength: 100,    // حداکثر 100 کاراکتر
      trim: true,
      lowercase: true, // تبدیل به حروف کوچک
      unique: true,

    }, 
    userUniqName: {
      type: String,
      unique: true,
      required: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
      lowercase: true, // تبدیل به حروف کوچک

    },
    phone: {
      type: String,
      unique: true,
      required: true,
      minlength: 10,     // حداقل 10 کاراکتر (مثلاً شماره تلفن)
      maxlength: 15,     // حداکثر 15 کاراکتر
    },
    password: {
      type: String,
      required: true,
      minlength: 8,      // حداقل 8 کاراکتر برای افزایش امنیت
      maxlength: 128,    // حداکثر 128 کاراکتر
    },
    role: {
      type: String,
      default: "user",
      required: true,
      enum: ["user", "admin", "moderator"], // مثال برای نقش‌های مختلف
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
      },
    ],
    bio: {
      type: String,
      required: false,
      maxlength: 500,     // حداکثر 500 کاراکتر برای بیوگرافی
      trim: true,
    },  
    address: {
      type: String,
      required: false,
      maxlength: 255,     // حداکثر 255 کاراکتر برای آدرس
      trim: true,
    }, 

    refreshToken: {
      type: String,
      maxlength: 500,     // حداکثر طول برای توکن ریفرش
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    // افزودن فیلد تاریخ تولد
    dateOfBirth: {
      type: Date,
      required: false, // اگر لازم است اجباری باشد، مقدار را `true` تنظیم کنید
      validate: {
        validator: function(value) {
          // بررسی اینکه تاریخ تولد در گذشته باشد
          return value < new Date();
        },
        message: 'تاریخ تولد باید در گذشته باشد.',
      },
    },
    // افزودن فیلد سوال امنیتی
    securityQuestion: {
      type: SecurityQuestionSchema,
      required: false, // اگر لازم است اجباری باشد، مقدار را `true` تنظیم کنید
    },
  },
  { timestamps: true }
);

// Middleware برای هش کردن پاسخ سوال امنیتی قبل از ذخیره با استفاده از bcryptjs
UserSchema.pre("save", async function(next) {
  if (this.isModified("securityQuestion.answer")) {
    try {
      const hashedAnswer = await bcrypt.hash(this.securityQuestion.answer, SALT_ROUNDS);
      this.securityQuestion.answer = hashedAnswer;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// متدی برای اعتبارسنجی پاسخ سوال امنیتی
UserSchema.methods.validateSecurityAnswer = async function(candidateAnswer) {
  if (!this.securityQuestion || !this.securityQuestion.answer) {
    return false;
  }
  return await bcrypt.compare(candidateAnswer, this.securityQuestion.answer);
};

// حذف فیلدهای حساس هنگام تبدیل به JSON
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.securityQuestion) {
    delete obj.securityQuestion.answer;
  }
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export default models.User || model("User", UserSchema);
