'use strict';

require('dotenv').config({
    debug: false
});

const keys = {
    system: {
        PORT: process.env.PORT
    },
    api: {
        MEAL_API_KEY: process.env.MEAL_API_KEY,
        TIMETABLE_API_KEY: process.env.TIMETABLE_API_KEY,
        SCHEDULE_API_KEY: process.env.SCHEDULE_API_KEY
    },
    google: {
        ID: process.env.GOOGLE_ID,
        SECRET: process.env.GOOGLE_SECRET
    },
    db: {
        HOST: process.env.DB_HOST,
        PORT: process.env.DB_PORT,
        USER: process.env.DB_USER,
        PASSWORD: process.env.DB_PASSWORD,
        DATABASE: process.env.DB_DATABASE,
        SESSION_KEY: process.env.SESSION_KEY,
        ISEXPIRE: process.env.ISEXPIRE === 'true',
        CHECKINTV: parseInt(process.env.CHECKINTV, 10),
        EXPIRE: parseInt(process.env.EXPIRE, 10)
    },
    school: {
        ID: process.env.SCHOOL_ID,
        OFFICE_ID: process.env.OFFICE_ID
    },
    pay: {
        EMBED_URL: process.env.EMBED_URL
    }
};

module.exports = { keys };