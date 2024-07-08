const express = require('express');
const router = express.Router({mergeParams: true}); //Cuando tenemos prefijado el id en nuestro index.js, tenemos que colocar esta opcion
const wrapAsync = require('../Utilitys/wrapAsync');
const Review = require('../models/review');
const Campground = require('../models/campgrounds');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../Utilitys/middleware');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.destroyReview));

module.exports = router;