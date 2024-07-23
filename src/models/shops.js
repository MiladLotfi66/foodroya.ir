import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
    ShopUniqueName: {
      type: String,
      required: true,
      unique: true ,// اطمینان از منحصر به فرد بودن
      minlength: 5,   // حداقل 5 کاراکتر
      maxlength: 255   // حداکثر 30 کاراکتر
    },

    ShopName: {
      type: String,
      required: true,
      minlength: 5,   // حداقل 5 کاراکتر
      maxlength: 255   // حداکثر 30 کاراکتر
    },

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
      ref: 'Users',    },

    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',    },

    LogoUrl: { type: String, required: true },
    TextLogoUrl: { type: String, required: true },
    BackGroundShopUrl: { type: String, required: true },
    BackGroundpanelUrl: { type: String, required: true },
    ShopStatus: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export default models.Shop || model("Shop", schema);
