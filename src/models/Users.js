import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
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
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address.'], // اعتبارسنجی فرمت ایمیل
      maxlength: 100,    // حداکثر 100 کاراکتر
      trim: true,
    }, 
    userUniqName: {
      type: String,
      unique: true,
      required: false,
      minlength: 3,
      maxlength: 30,
      trim: true,
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
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
