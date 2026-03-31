'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/store.ctrl.js');

/** 페이지 */
router.get('/', ctrl.output.main);
router.get('/sign', ctrl.output.sign);
router.get('/sign-code', ctrl.output.signCode);
router.get('/manage-product', ctrl.output.manageProduct);
router.get('/kiosk', ctrl.output.kiosk);

/** API */
router.get('/create-product', ctrl.process.createProduct);
router.get('/change-product', ctrl.process.changeProduct);
router.post('/delete-product', ctrl.process.deleteProduct);
router.get('/create-store', ctrl.process.createStore);
router.post('/sign-code', ctrl.process.signCode);

module.exports = router;