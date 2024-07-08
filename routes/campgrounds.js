const express = require('express');
const router = express.Router();
const wrapAsync = require('../Utilitys/wrapAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../Utilitys/middleware');
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({storage});

router.route('/') //router.route nos permite unir varios http verbs que pertenezcan a una misma ruta, en este caso '/campgrounds'
    .get(wrapAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(wrapAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.destroyCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgrounds.renderEditForm));



module.exports = router;