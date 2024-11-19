import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
    images: [
      {
        type: String,
        required: false
      }
    ],
  title: { type: String, required: true },
  items: { type: [String], required: true }, // Array of item names
  generalFeatures: [{ type: Schema.Types.ObjectId, ref: "Feature" }],
  ShopId: [{ type: Schema.Types.ObjectId, ref: "Shop" }],
  pricingTemplate: {
    type: Schema.Types.ObjectId,
    ref: "PriceTemplate",
  },
  minStock: { type: Number, default: 0 },
  AccountId: { type: Schema.Types.ObjectId, ref: "Account" },
  parentAccount: { type: Schema.Types.ObjectId, ref: "Account" },
  tags: { type: [String] }, // Array of tags
  storageLocation: { type: String },
  isSaleable: { type: Boolean, default: true },
  isMergeable: { type: Boolean, default: false },
  unit: { type: String, required: true },
  description: { type: String },

  LastEditedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // تغییر نام از 'Users' به 'User'
  },
  CreatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // تغییر نام از 'Users' به 'User'
  },

});
export default models.Product || model("Product", ProductSchema);
