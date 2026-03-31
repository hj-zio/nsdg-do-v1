'use strict';
 
 const db = require('../config/db.js');
 const { keys } = require('../config/keys.js');
 const { notice } = require('../config/notice.js');
 
 const request = require('request-promise-native');
 
 let scheduleData;
 
 /**
  * @param {number} type
  * ex) type: 1 (자동 업데이트 요청), 2 (단순조회 요청)
  * @returns - 학교 일정표 반환
  */
 async function getSchoolSchedule(type, trace) {
     try {
         if (!scheduleData || type === 1) {
             const result = [];
             const [startDate, endDate] = getMondayAndSundayDates();
             const [Year, Month, Day] = getFormattedDate2();
 
             const options = {
                 uri: 'https://clients6.google.com/calendar/v3/calendars/nonsandaegeon.cnehs.kr_classrooma4e248e6@group.calendar.google.com/events',
                 qs: {
                     calendarId: 'nonsandaegeon.cnehs.kr_classrooma4e248e6@group.calendar.google.com',
                     singleEvents: true,
                     timeZone: 'Asia/Seoul',
                     maxAttendees: 1,
                     timeMin: `${Year}-${Month}-01T00:00:00+09:00`,
                     key: keys.api.SCHEDULE_API_KEY,
                     '%24unique': 'gc237',
                 },
             };
 
             const reqData = JSON.parse(await request(options));
             const data = reqData.items;
             for (let i = 0; i < data.length; i++) {
                 if (data[i].summary.includes('자감')) {
                     data[i].summary = data[i].summary.split('/').map((t, i) => t ? `${t} (${i+1}학년)` : `없음 (${i+1}학년)`).join(' | ')
                 }
                 const obj = {
                     title: data[i].summary.replace(/\s*:\s*/g, ': ').replace(/-/g, ''),
                     title: data[i].summary.replace(/^\s*:\s*/, ': ').replace(/-/g, ''),
                     start: data[i].start.date,
                     end: data[i].end.date
                 }
                 result.push(obj);
             }
             scheduleData = result;
         }
 
         return {
             success: true,
             data: scheduleData,
             message: notice.client.SUCCESS,
             error: null
         };
     } catch (e) {
         await db.recordErrorLog(notice.INFO.GET_100.CODE, e.message, e.stack, trace);
         return {
             success: false,
             data: null,
             message: notice.client.SERVER_ERROR,
             error: null
         };
     }
 }
 
 function getFormattedDate(date) {
     const year = date.getFullYear();
     const month = (date.getMonth() + 1).toString().padStart(2, '0');
     const day = date.getDate().toString().padStart(2, '0');
     return `${year}${month}${day}`;
 }
 
 function getFormattedDate2() {
     const date = new Date();
     const year = date.getFullYear();
     const month = (date.getMonth() + 1).toString().padStart(2, '0');
     const day = date.getDate().toString().padStart(2, '0');
     return [year, month, day];
 }
 
 function getMondayAndSundayDates() {
     try {
         const now = new Date();
         const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
         const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7 - now.getDay());
 
         const monday = getFormattedDate(weekStart);
         const sunday = getFormattedDate(weekEnd);
 
         return [monday, sunday, now.getFullYear()];
     } catch (e) {
         return [null, null, null];
     }
 }
 
 module.exports = {
     getSchoolSchedule
 }