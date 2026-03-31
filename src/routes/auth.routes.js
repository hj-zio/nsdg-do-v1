'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.ctrl.js');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

router.get('/', 
    passport.authenticate('google', {
         scope: ['profile', 'email'] 
    })
);

router.get('/callback',
    passport.authenticate('google', {
        failureRedirect: '/login'
    }),
    ctrl.process.main
);

module.exports = router;