const Review = require('../models/review');
const Campground = require('../models/campgrounds');

module.exports.createReview = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', "Successfully created new review");
    res.redirect(`/campgrounds/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    const {id, reviewId} = req.params
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', "Successfully deleted your review");
    res.redirect(`/campgrounds/${id}`);
};