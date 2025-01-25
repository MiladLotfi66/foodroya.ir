// models/Contact.js
import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'نام مخاطب الزامی است'],
      trim: true,
    },
    shop: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Shop', 
      required: true 
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'شماره تماس الزامی است'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^\d{10,15}$/.test(v); // انطباق با الگوی شماره تلفن (بین 10 تا 15 رقم)
        },
        message: props => `${props.value} یک شماره تماس نامعتبر است!`
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // اگر مقدار وجود نداشت، اعتبارسنجی را نادیده بگیر
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} یک ایمیل نامعتبر است!`
      }
    },
    nationalId: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // اگر مقدار وجود نداشت، اعتبارسنجی را نادیده بگیر
          return /^\d{10}$/.test(v); // فرض بر اینکه شماره ملی 10 رقم است
        },
        message: props => `${props.value} یک شماره ملی نامعتبر است!`
      }
    },
    economicCode: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // اگر مقدار وجود نداشت، اعتبارسنجی را نادیده بگیر
          return /^\d{10}$/.test(v); // فرض بر اینکه کد اقتصادی 10 رقم است
        },
        message: props => `${props.value} یک کد اقتصادی نامعتبر است!`
      }
    },
    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ایجاد کننده الزامی است'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ویرایش کننده الزامی است'],
    },
    RolesId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "rolePerimision", 
    }],
    // افزودن فیلدهای اضافی در صورت نیاز
  },
  {
    timestamps: true, // افزودن فیلدهای createdAt و updatedAt خودکار
  }
);
ContactSchema.index({ shop: 1, userAccount: 1 }, { unique: true });

// جلوگیری از ایجاد مدل چندباره هنگام HMR (Hot Module Replacement) در توسعه
export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
