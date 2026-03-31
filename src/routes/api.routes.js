'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/api.ctrl.js');

router.get('/', ctrl.output.main);
router.get('/getUserData', ctrl.output.getUserData);
router.get('/setSchoolNum', ctrl.output.setSchoolNum);
router.get('/getTimetable', ctrl.output.getTimetable);
router.get('/getMeal', ctrl.output.getMeal);
router.get('/getSchedule', ctrl.output.getSchedule);
router.get('/getSelectHistory', ctrl.output.getSelectHistory);
router.get('/getAllSelectData', ctrl.output.getAllSelectData);
router.post('/submitSelect', ctrl.output.submitSelect);
router.post('/submitAllergy', ctrl.output.submitAllergy);
router.get('/login/guest', ctrl.output.loginForGuest);
router.get('/logout', ctrl.output.logout);
router.post('/submitSurvey', ctrl.output.submitSurvey);
router.post('/submitMealRating', ctrl.output.submitMealRating)

router.get('/getLostItems', ctrl.output.getLostItems);
router.post('/createLostItem', ctrl.output.createLostItem);
router.get('/getMyLostItems', ctrl.output.getMyLostItems);
router.get('/getLostItem/:id', ctrl.output.getLostItem);
router.post('/deleteLostItem', ctrl.output.deleteLostItem);
router.post('/updateLostItem', ctrl.output.updateLostItem);
module.exports = router;