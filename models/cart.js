const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = require("./product.js");

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
});

module.exports = mongoose.model("Cart", cartSchema);