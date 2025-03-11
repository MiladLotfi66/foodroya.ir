import { Schema, model, models } from "mongoose";

// تعریف اسکیما
const ProductSchema = new Schema(
  {
    images: [
      {
        type: String,
        required: false,
      },
    ],
    title: { type: String, required: true },
    ShopId: { type: Schema.Types.ObjectId, ref: "Shop" },
    accountId: { type: Schema.Types.ObjectId, required: true, ref: "Account" },
    pricingTemplate: {
      type: Schema.Types.ObjectId,
      ref: "PriceTemplate",
    },
    minStock: { type: Number, default: 0 },
    stock: {
      type: Number,
      default: 0,
      required: true,
      min: [0, "تعداد نمی‌تواند منفی باشد"],
    },
    likes: [
      {
        type: Schema.Types.ObjectId, // ارجاع به کاربرانی که لایک کردند
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId, // ارجاع به کاربرانی که دیسلایک کردند
        ref: "User",
      },
    ],
    price: {
      type: Number,
      required: true,
      min: [0, "قیمت نمی‌تواند منفی باشد"],
    },
      lastPurchasePrice: {
      type: Number,
      default: 0,
      required: true,
      min: [0, "قیمت نمی‌تواند منفی باشد"],
    },
    parentAccount: { type: Schema.Types.ObjectId, ref: "Account" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }], // Array of tags
    Features: [{ type: Schema.Types.ObjectId, ref: "Feature" }], // Array of features
    storageLocation: { type: String },
    isSaleable: { type: Boolean, default: true },
    isMergeable: { type: Boolean, default: false },
    unit: { type: String, required: true },
    description: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // تغییر نام از 'Users' به 'User'
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // تغییر نام از 'Users' به 'User'
    },
  },
  {
    timestamps: true,
  }
);

// میدلور پیش از ذخیره (برای عملیات save و create)
ProductSchema.pre("save", function (next) {
  if (this.stock < 0) {
    return next(new Error("تعداد نمی‌تواند منفی باشد"));
  }
  next();
});

// میدلور پیش از به‌روزرسانی (برای عملیات findOneAndUpdate و update)
ProductSchema.pre(["findOneAndUpdate", "update"], async function (next) {
  const update = this.getUpdate();

  // بررسی اگر مقدار stock در عملیات به‌روزرسانی تغییر کرده باشد
  if (update.stock !== undefined) {
    if (update.stock < 0) {
      return next(new Error("تعداد نمی‌تواند منفی باشد"));
    }
  }

  // بررسی عملیات $inc برای stock
  if (update.$inc && update.$inc.stock !== undefined) {
    // اگر stock به صورت افزایشی یا کاهشی تغییر کند، باید از منفی شدن آن جلوگیری کنیم
    const currentDoc = await this.model.findOne(this.getQuery());
    const newStock = currentDoc.stock + update.$inc.stock;
    if (newStock < 0) {
      return next(new Error("تعداد نمی‌تواند منفی شود"));
    }
  }

  next();
});

// صادر کردن مدل
export default models.Product || model("Product", ProductSchema);
