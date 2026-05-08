const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventoryLogSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  type: {
    type: String,
    enum: ["sale", "restock", "adjustment", "return"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousStock: {
    type: Number,
    required: true,
  },
  newStock: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    trim: true,
    default: "",
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reference: {
    type: Schema.Types.ObjectId,
    ref: "Sale",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("InventoryLog", inventoryLogSchema);
