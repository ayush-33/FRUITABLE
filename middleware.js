const { urlencoded } = require("express");
const Product = require("./models/product.js");
const ExpressError = require("./utils/ExpressError.js");
const {productSchema ,reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    const isAPI = req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/category");
    const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"));

    console.log("isLoggedIn called on:", req.originalUrl, "isAPI:", isAPI, "isAjax:", isAjax);

    if (!isAPI && !isAjax) {
      if (req.method === "GET") {
        console.log("Saving returnTo as (GET):", req.originalUrl);
        res.cookie("returnTo", req.originalUrl, { httpOnly: true });
      } else if (req.method === "POST") {
        const returnTo = req.body.returnTo || req.get("Referer") || "/";
        console.log("Saving returnTo as (POST):", returnTo);
        res.cookie("returnTo", returnTo, { httpOnly: true }); 
      }
    } else if (req.method === "POST") {
      const returnTo = req.get("Referer") || "/";
      console.log("Saving returnTo as (API POST Referer):", returnTo);
      res.cookie("returnTo", returnTo, { httpOnly: true }); 
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