'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/image.ctrl.js');

/** process Routes */
router.get('/', ctrl.process.main);

module.exports = router;