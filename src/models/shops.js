import { Schema, model, models } from "mongoose";
const schema = new Schema(
  {
    ShopName: {
      type: String,
      required: true,
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

    LogoUrl: { type: String, required: true },
    TextLogoUrl: { type: String, required: true },
    BackGroundShopUrl: { type: String, required: true },
    BackGroundpanelUrl: { type: String, required: true },
    ShopStatus: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export default models.Shop || model("Shop", schema);
