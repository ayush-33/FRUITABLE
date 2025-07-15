const { urlencoded } = require("express");
const Product = require("./models/product.js");
const ExpressError = require("./utils/ExpressError.js");
const {productSchema ,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.method === "GET") {
      res.cookie("returnTo", req.originalUrl, { httpOnly: true });
    //   console.log(" [ReturnTo Cookie - GET] Stored:", req.originalUrl);
    } else if (req.method === "POST") {
      const returnTo = req.body.returnTo || req.get("Referer") || "/product";
      res.cookie("returnTo", returnTo, { httpOnly: true });
    //   console.log("🍪 [ReturnTo Cookie - POST] Stored:", returnTo);
    }
    req.flash("error", "You must be logged in first");
    return res.redirect("/login");
  }
  next();
};




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

module.exports.saveRedirectUrl = (req,res,next) => {
    //redirect url save
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let product = await Product.findById(id);
    //check if user is owner of listed product or not
    if(!product.owner._idequals(res.locals.curUser._id)){
        req.flash("error","You are not the owner of this listed Product");
        return res.redirect(`/product/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400,errMsg);
    }else {
        next();
    }
}