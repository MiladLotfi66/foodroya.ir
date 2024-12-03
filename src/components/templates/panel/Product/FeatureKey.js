// models/FeatureKey.js
import { Schema, model, models } from "mongoose";

const featureKeySchema = new Schema({
    name: { type: String, required: true, unique: true },
   
});
export default models.FeatureKey || model("FeatureKey", featureKeySchema);
