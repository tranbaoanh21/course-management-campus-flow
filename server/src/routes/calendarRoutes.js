const express = require('express');

const { getCalendar } = require('../controllers/calendarController');

const router = express.Router();

router.get('/', getCalendar);

module.exports = router;
