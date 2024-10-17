// models/Currency.js
import mongoose from 'mongoose';

const CurrencySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortName: { type: String, required: true, unique: true },
    exchangeRate: { type: Number, required: true },
    decimalPlaces: { type: Number, required: true, min: 0, max: 6 },
    status: { type: String, enum: ['فعال', 'غیرفعال'], default: 'فعال' },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

// اصلاح شده: استفاده از mongoose.models و mongoose.model
export default mongoose.models.Currency || mongoose.model('Currency', CurrencySchema);
