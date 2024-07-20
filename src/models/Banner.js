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
    
    BannerTextColor: {
      type: String,
    },

    LastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',    },

    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Users',    },

    imageUrl: { type: String, required: true },
    BannerStatus: { type: Boolean, required: true },
    BannerLink: { type: String},


  },
  { timestamps: true }
);

export default models.Banner || model("Banner", BannerSchema);
