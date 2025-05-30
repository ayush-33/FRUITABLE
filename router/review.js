const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Product = require("../models/product.js");
const {validateReview , isLoggedIn } = require("../middleware.js");
const reviewController = require("../controller/reviewController.js");

//Review Route
router.post("/",isLoggedIn, validateReview,wrapAsync(reviewController.createReview));

//destory review route
router.delete("/:reviewId",isLoggedIn,wrapAsync(reviewController.destroyReview));

module.exports = router;
