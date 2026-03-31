'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/home.ctrl.js');

/** output Routes */
router.get('/', ctrl.output.main);
router.get('/login', ctrl.output.login);
router.get('/auth', ctrl.output.auth);
router.get('/timetable', ctrl.output.timetable);
router.get('/schedule', ctrl.output.schedule);
router.get('/meal', ctrl.output.meal);
router.get('/profile', ctrl.output.profile);
router.get('/schoolNumber', ctrl.output.schoolNumber);
router.get('/error', ctrl.output.error);
router.get('/choose', ctrl.output.choose);
router.get('/allergy', ctrl.output.allergy);
router.get('/survey', ctrl.output.survey);
router.get('/lostItem', ctrl.output.lostItem)
router.get('/lostItem/post', ctrl.output.lostItemPost)
router.get('/lostItem/edit/:id', ctrl.output.lostItemEdit);

module.exports = router;