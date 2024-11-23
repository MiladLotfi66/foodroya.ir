import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
    images: [
      {
        type: String,
        required: false
      }
    ],
  title: { type: String, required: true },
  // items: { type: [String], required: true }, // Array of item names
  // generalFeatures: [{ type: Schema.Types.ObjectId, ref: "Feature" }],
  ShopId: { type: Schema.Types.ObjectId, ref: "Shop" },
  accountId: { type: Schema.Types.ObjectId, required: true, ref: 'Account' },

  pricingTemplate: {
    type: Schema.Types.ObjectId,
    ref: "PriceTemplate",
  },
  minStock: { type: Number, default: 0 },
  parentAccount: { type: Schema.Types.ObjectId, ref: "Account" },
  tags: [{type: Schema.Types.ObjectId, ref: "Tag" }] , // Array of tags
  
  storageLocation: { type: String },
  isSaleable: { type: Boolean, default: true },
  isMergeable: { type: Boolean, default: false },
  unit: { type: String, required: true },
  description: { type: String },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // تغییر نام از 'Users' به 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // تغییر نام از 'Users' به 'User'
  },

},
{
  // افزودن گزینه timestamps برای مدیریت خودکار createdAt و updatedAt
  timestamps: true,
});
export default models.Product || model("Product", ProductSchema);
