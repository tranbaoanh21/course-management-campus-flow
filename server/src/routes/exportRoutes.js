const express = require('express');

const { exportUserData } = require('../controllers/exportController');

const router = express.Router();

router.get('/', exportUserData);

module.exports = router;
