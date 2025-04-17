const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Product = require("./product.js");

const cartSchema = new Schema ({
    quantity : Number,
    item : [{
        type : Schema.Types.ObjectId,
        ref : "Product",
    },
],
});

module.exports = mongoose.model("Cart", cartSchema);