const express = require('express');

const { getProjectsByCourse, createProject } = require('../controllers/projectController');

const router = express.Router({ mergeParams: true });

router.get('/', getProjectsByCourse);
router.post('/', createProject);

module.exports = router;
