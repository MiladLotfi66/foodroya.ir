import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
    ShopUniqueName: {
      type: String,
      required: true,
      unique: true, // اطمینان از منحصر به فرد بودن
      minlength: 5, // حداقل 5 کاراکتر
      maxlength: 255 // حداکثر 30 کاراکتر
    },
    ShopName: {
      type: String,
      required: true,
      minlength: 5, // حداقل 5 کاراکتر
      maxlength: 255 // حداکثر 30 کاراکتر
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // تغییر نام از 'Users' به 'User'
      },
    ],
    ShopSmallDiscription: {
      type: String,
    },
    ShopDiscription: {
      type: String,
    },
    ShopAddress: {
      type: String,
    },
    ShopPhone: {
      type: String,
    },
    ShopMobile: {
      type: String,
    },
    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // تغییر نام از 'Users' به 'User'
    },
    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // تغییر نام از 'Users' به 'User'
    },
    LogoUrl: { type: String, required: true },
    TextLogoUrl: { type: String, required: true },
    BackGroundShopUrl: { type: String, required: true },
    BackGroundpanelUrl: { type: String, required: true },
    ShopStatus: { type: Boolean, required: true },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default models.Shop || model("Shop", schema);
