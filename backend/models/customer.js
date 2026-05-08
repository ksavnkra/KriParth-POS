const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Customer", customerSchema);
