// models/GeneralLedger.js
import mongoose from 'mongoose';

const GeneralLedgerSchema = new mongoose.Schema(
  {
    ledger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ledger',
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    debit: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    credit: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Currency',
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    type: { type: String, enum: ["financialDocument", "invoice"] },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ایندکس‌گذاری برای بهینه‌سازی جستجو براساس حساب‌ها و دفترکل
GeneralLedgerSchema.index({ account: 1 });
GeneralLedgerSchema.index({ ledger: 1 });
GeneralLedgerSchema.index({ createdBy: 1 });
GeneralLedgerSchema.index({ updatedBy: 1 });



export default mongoose.models.GeneralLedger || mongoose.model('GeneralLedger', GeneralLedgerSchema);