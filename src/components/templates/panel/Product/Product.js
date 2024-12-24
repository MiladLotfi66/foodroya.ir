import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
    images: [
      {
        type: String,
        required: false
      }
    ],
  title: { type: String, required: true },
  ShopId: { type: Schema.Types.ObjectId, ref: "Shop" },
  accountId: { type: Schema.Types.ObjectId, required: true, ref: 'Account' },
  pricingTemplate: {
    type: Schema.Types.ObjectId,
    ref: "PriceTemplate",
  },
  minStock: { type: Number, default: 0 },
  stock: {
    type: Number,
    default: 0,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, "قیمت نمی‌تواند منفی باشد"],
  },

  parentAccount: { type: Schema.Types.ObjectId, ref: "Account" },
  tags: [{type: Schema.Types.ObjectId, ref: "Tag" }] , // Array of tags
  Features: [{type: Schema.Types.ObjectId, ref: "Feature" }] , // Array of tags
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
  timestamps: true,
});
export default models.Product || model("Product", ProductSchema);
