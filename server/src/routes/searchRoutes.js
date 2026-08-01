const express = require('express');

const { searchWorkspace } = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchWorkspace);

module.exports = router;
