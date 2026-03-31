'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.ctrl.js');

router.get('/', ctrl.output.main);
router.get('/db', ctrl.output.db);
router.get('/server', ctrl.output.server);
router.get('/ins', ctrl.output.ins);
router.get('/meal', ctrl.output.meal);
router.get('/charge', ctrl.process.charge);
router.get('/getServerStatus', ctrl.process.getServerStatus);
router.get('/createInsSchedule', ctrl.process.createInsSchedule);
router.get('/updateInsSchedule', ctrl.process.updateInsSchedule);
router.get('/querySQL', ctrl.process.querySQL);
router.post('/uploadMeal', ctrl.process.uploadMeal);
router.get('/mealRating', ctrl.output.mealRating);
router.get('/getMealRating', ctrl.process.getMealRating)

router.get("/lostItem", ctrl.output.lostItem)
router.get("/lostItem", ctrl.output.lostItem)
router.get("/getAllLostItems", ctrl.process.getAllLostItems)
router.get("/getLostItemHistory/:id", ctrl.process.getLostItemHistory)
router.post("/hideLostItem", ctrl.process.hideLostItem)
router.post("/adminDeleteLostItem", ctrl.process.adminDeleteLostItem)
router.post("/updateLostItemStatus", ctrl.process.updateLostItemStatus)

module.exports = router;