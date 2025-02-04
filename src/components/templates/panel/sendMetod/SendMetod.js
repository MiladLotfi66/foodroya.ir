import { Schema, model, models } from "mongoose";

const SendMetodSchema = new Schema(
  {
    ShopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,

    },
    Title: {
      type: String,
      required: true,

    },
    Description: {
      type: String,
    },
    Price: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          // اجازه می دهد که مقدار مساوی "رایگان" یا یک عدد قابل تبدیل به عدد دریافت شود.
          if (value === "رایگان" ||value === "پس کرایه") {
            return true;
          }
          // بررسی می‌کنیم که آیا مقدار به عدد قابل تبدیل است
          const parsed = Number(value);
          return !isNaN(parsed);
        },
        message: (props) =>
          `${props.value} معتبر نیست. لطفاً یک عدد یا کلمه های "رایگان" یا "پس کرایه" وارد کنید.`,
      },
    },
    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      
    },
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,

    },
    imageUrl: { type: String, required: true },
    SendMetodStatus: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export default models.SendMetod || model("SendMetod", SendMetodSchema);
