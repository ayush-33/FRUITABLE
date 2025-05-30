const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const User = require("./user.js");

const ProductSchema = new Schema({  
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  isFresh : {
    type : Boolean,
    default : false,
  },
  description: String,
  price: Number,
  image: {
    url: String,
    filename: String,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
