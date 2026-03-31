'use strict';

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

const db = require('./db.js');
const { keys } = require('./keys.js');
const { notice } = require('./notice.js');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    done(null, id);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.google.ID,
            clientSecret: keys.google.SECRET,
            callbackURL: process.env.NODE_ENV === 'production' ? 'https://nsdg.cloud/google/callback' : 'http://localhost:3000/google/callback', 
            passReqToCallback: true,
        },
        async function (request, accessToken, refreshToken, profile, done) {
            return done(null, profile);
        }
    )
);

module.exports = passport;