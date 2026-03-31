'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pay.ctrl.js');

/** 페이지 */
router.get('/', ctrl.output.main);
router.get('/charge', ctrl.output.charge);
router.get('/facesign-1', ctrl.output.facesign_1);
router.get('/facesign-2', ctrl.output.facesign_2);
router.get('/facesign-3', ctrl.output.facesign_3);
router.get('/facesign-privacy', ctrl.output.facesign_privacy);

/** API */
router.get('/getChargeList', ctrl.process.gerChargeList);
router.get('/getUserBalance', ctrl.process.getUserBalance);
router.get('/getUserTransaction', ctrl.process.getUserTransaction);
router.get('/getStoreName', ctrl.process.getStoreName);
router.get('/approveCharge', ctrl.process.approveCharge);
router.get('/rejectCharge', ctrl.process.rejectCharge);
router.get('/getProductName', ctrl.process.getProductName);
router.get('/getProductInfoByBarcode', ctrl.process.getProductInfoByBarcode);
router.get('/getAllProductList', ctrl.process.getAllProductList);
router.get('/queryProductInfo', ctrl.process.queryProductInfo);
router.get('/createIdempotencyKey', ctrl.process.createIdempotencyKey);
router.post('/charge', ctrl.process.charge);
router.post('/requestPayment', ctrl.process.requestPayment);
router.post('/compare_face', ctrl.process.compare_face);
router.post('/sign_face', ctrl.process.sign_face);
router.post('/sign_password', ctrl.process.sign_password);

module.exports = router;