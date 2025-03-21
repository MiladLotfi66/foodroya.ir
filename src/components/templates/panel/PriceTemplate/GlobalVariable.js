// models/PriceTemplate.js


import mongoose from 'mongoose';
const GlobalVariableSchema = new mongoose.Schema({
    name: { type: String, required: true },
    alias: { type: String, required: true },
    value: { type: Number, required: true, default: 0 },
    description: { type: String },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }, { timestamps: true });
  
  // ایجاد ایندکس ترکیبی برای جلوگیری از تکرار نام یا نماد اختصاری در هر فروشگاه
  GlobalVariableSchema.index({ shop: 1, name: 1 }, { unique: true });
  GlobalVariableSchema.index({ shop: 1, alias: 1 }, { unique: true });
  

// module.exports = mongoose.model('PriceTemplate', PriceTemplateSchema);
export default mongoose.models.GlobalVariable || mongoose.model('GlobalVariable', GlobalVariableSchema);
