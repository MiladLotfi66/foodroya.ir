import { Schema, model, models } from "mongoose";

const ProductImageSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  imageUrl: { type: String, required: true },
  imageType: { type: String, enum: ["main", "gallery"], required: true },
});

export default models.ProductImage || model("ProductImage", ProductImageSchema);
