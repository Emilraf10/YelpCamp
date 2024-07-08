const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../Utilitys/wrapAsync');
const passport = require('passport');
const { storeReturnTo } = require('../Utilitys/middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(wrapAsync(users.createUser));

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.Login);

router.get('/logout', users.Logout);

module.exports = router;