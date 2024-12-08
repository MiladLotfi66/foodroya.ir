// models/Ledger.js
import mongoose from 'mongoose';

const LedgerSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 0,
      maxlength: 255,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GeneralLedger',
        required: true,
      },
    ],
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
    timestamps: true, // شامل createdAt و updatedAt
  }
);

// ایندکس‌گذاری برای بهینه‌سازی جستجو براساس کاربران یا سایر فیلدها در صورت نیاز
LedgerSchema.index({ createdBy: 1 });
LedgerSchema.index({ updatedBy: 1 });

// Middleware در مدل Ledger
LedgerSchema.post('save', async function(next) {
  try {
    const GeneralLedger = mongoose.model('GeneralLedger');
    
    const aggregateResult = await GeneralLedger.aggregate([
      { $match: { ledger: this._id } },
      {
        $group: {
          _id: '$ledger',
          totalDebit: { $sum: '$debit' },
          totalCredit: { $sum: '$credit' },
        },
      },
    ]);

    if (aggregateResult.length > 0) {
      const { totalDebit, totalCredit } = aggregateResult[0];
      if (totalDebit !== totalCredit) {
        return next(new Error('مجموع بدهکارها باید برابر با مجموع بستانکارها باشد.'));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});



export default mongoose.models.Ledger || mongoose.model('Ledger', LedgerSchema);

