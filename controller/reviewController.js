const Product = require("../models/product");
const Review = require("../models/review");

module.exports.createReview = async (req,res) => {
    let product = await Product.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    product.reviews.push(newReview);
    await newReview.save();
    await product.save();

    req.flash("success","New Review Created!");
    res.redirect(`/product/${product._id}`);
};

module.exports.destroyReview = async (req,res) => {
    let {id , reviewId} = req.params;
    await Product.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/product/${id}`);
}

