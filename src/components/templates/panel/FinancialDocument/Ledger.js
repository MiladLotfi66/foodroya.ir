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

// ایندکس‌گذاری
LedgerSchema.index({ createdBy: 1 });
LedgerSchema.index({ updatedBy: 1 });

// بررسی تراز بودن سند قبل از ذخیره
LedgerSchema.pre('save', async function(next) {
  if (this.transactions && this.transactions.length > 0) {
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
          throw new Error('مجموع بدهکارها باید برابر با مجموع بستانکارها باشد.');
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// اگر نیاز به عملیات بعد از ذخیره دارید، از post بدون next استفاده کنید
LedgerSchema.post('save', async function(doc) {
  try {
    // انجام عملیات پس از ذخیره
    console.log('سند با موفقیت ذخیره شد:', doc._id);
  } catch (error) {
    console.error('خطا در عملیات پس از ذخیره:', error);
  }
});

export default mongoose.models.Ledger || mongoose.model('Ledger', LedgerSchema);
