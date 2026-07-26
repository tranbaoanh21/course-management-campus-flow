const express = require('express');

const { getDashboardOverview } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', getDashboardOverview);

module.exports = router;
