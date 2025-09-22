const Product = require("../models/product");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");

module.exports.createReview = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        req.flash("error", "Product not found");
        return res.redirect("/");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    product.reviews.push(newReview);
    await newReview.save();
    await product.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/product/${product._id}`);
};

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/product/${id}`);
    }

    await Product.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/product/${id}`);
};
