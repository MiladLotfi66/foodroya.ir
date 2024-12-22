import mongoose from 'mongoose';

const { Schema } = mongoose;

const InvoiceSchema = new Schema(
  {
    description: {
      type: String,
      trim: true,
      minlength: 0,
      maxlength: 255,
    },
    type: {
      type: String,
      enum: ["Purchase", "Sale", "PurchaseReturns", "SalesReturns", "Losses"],
      required: true,
    },
    totalPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => parseFloat(v.toString()),
      set: (v) => mongoose.Types.Decimal128.fromString(v.toString()),
    },
    totalItems: {
      type: Number,
      required: true,
      min: 0,
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    // currency: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Currency",
    //   required: true,
    // },
    InvoiceItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceItem', // فرض بر این است که مدل به صورت مفرد تعریف شده است
        required: true,
      },
    ],
    shop: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Shop", 
      required: true 
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
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
