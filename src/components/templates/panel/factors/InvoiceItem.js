import mongoose from 'mongoose';

const { Schema } = mongoose;

const InvoiceItemSchema = new Schema(
  {
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => parseFloat(v.toString()),
      set: (v) => mongoose.Types.Decimal128.fromString(v.toString()),
    },
    totalPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: (v) => parseFloat(v.toString()),
      set: (v) => mongoose.Types.Decimal128.fromString(v.toString()),
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    Features: [{type: Schema.Types.ObjectId, ref: "Feature" }] , // Array of tags

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 0,
        maxlength: 255,
      },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

export default mongoose.models.InvoiceItem || mongoose.model('InvoiceItem', InvoiceItemSchema);