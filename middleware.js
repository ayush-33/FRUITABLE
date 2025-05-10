const { urlencoded } = require("express");
const Product = require("./models/product.js");
const ExpressError = require("./utils/ExpressError.js");
const {productSchema } = require("./schema.js");

//middleware to check product schema
module.exports.validateProduct = (req,res,next) => {
    let  {error} = productSchema.validate(req.body) ; //checking schema condition
    if(error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}