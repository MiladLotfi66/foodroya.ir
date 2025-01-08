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

    description: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    type: { type: String, enum: ["financialDocument", "invoice"] },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: function() {
        return this.type === 'invoice';
      },
      // می‌توانید از validate برای اطمینان بیشتر استفاده کنید
      validate: {
        validator: function(v) {
          if (this.type === 'invoice' && !v) {
            return false;
          }
          return true;
        },
        message: props => `referenceId is required when type is 'invoice'`,
      },
    },
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
