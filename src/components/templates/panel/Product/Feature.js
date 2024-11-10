import { Schema, model, models } from "mongoose";

const featureSchema = new Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true } ,
    LastEditedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // تغییر نام از 'Users' به 'User'
      },
      CreatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // تغییر نام از 'Users' به 'User'
      },
  
});

const Feature = model('Feature', featureSchema);
export default models.Feature || model("Feature", featureSchema);
