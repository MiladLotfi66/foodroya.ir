import { Schema, model, models } from "mongoose";
const BannerSchema = new Schema(
  {
    BannerBigTitle: {
      type: String,
    },

    BannersmallDiscription: {
      type: String,
    },

    BannerStep: {
      type: Number,
    },

    BannerDiscription: {
      type: String,
    },

    imageUrl: { type: String, required: true },


  },
  { timestamps: true }
);

export default models.Banner || model("Banner", BannerSchema);
