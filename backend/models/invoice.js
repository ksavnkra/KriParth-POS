const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  taxRate: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  paymentMode: {
    type: String,
    enum: ["cash", "upi", "card", "split"],
    required: true,
  },
  paymentDetails: {
    cashAmount: { type: Number, default: 0 },
    cardAmount: { type: Number, default: 0 },
    upiAmount: { type: Number, default: 0 },
    transactionId: { type: String, default: "" },
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    default: null,
  },
  cashier: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "refunded", "void"],
    default: "completed",
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Sale", invoiceSchema);
