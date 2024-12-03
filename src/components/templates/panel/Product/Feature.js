import { Schema, model, models } from "mongoose";

const featureSchema = new Schema({
  featureKey: {
    type: Schema.Types.ObjectId,
    ref: 'FeatureKey',
    required: true
},
value: { 
  type: String, 
  required: [true, 'Value is required'],
  trim: true,
  minlength: [2, 'Value must be at least 2 characters'],
  maxlength: [100, 'Value cannot exceed 100 characters'],
},
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

// اگر برای هر محصول، هر کلید ویژگی فقط یکبار باید وجود داشته باشد:
featureSchema.index({ productId: 1, featureKey: 1 }, { unique: true });

export default models.Feature || model("Feature", featureSchema);
