'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teacher.ctrl.js');

router.get('/choose', ctrl.output.teacherChoose);
router.get('/studentTimetable', ctrl.output.studentTimetableForTeacher);
router.get('/getStudentList', ctrl.process.getStudentList);
router.get('/getStudentTimetable', ctrl.process.getTimetableForTeacher);
router.get('/choose/download', ctrl.process.chooseDownload);

module.exports = router;