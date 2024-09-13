import { Schema, model, models } from "mongoose";
const BannerSchema = new Schema(
  {
    ShopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',    },

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
      ref: 'User',    },

    CreatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',    },


    imageUrl: { type: String, required: true },
    BannerStatus: { type: Boolean, required: true },
    BannerLink: { type: String},


  },
  { timestamps: true }
);

export default models.Banner || model("Banner", BannerSchema);
