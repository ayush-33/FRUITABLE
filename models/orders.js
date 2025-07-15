const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = require("./product.js")
const User = require("./user.js");


const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  phone: String,
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String,
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
