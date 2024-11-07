import { Schema, model, models } from "mongoose";

const featureSchema = new Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
});

const Feature = model('Feature', featureSchema);
export default models.Feature || model("Feature", featureSchema);
