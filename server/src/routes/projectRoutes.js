const express = require('express');

const { deleteProject } = require('../controllers/projectController');

const router = express.Router();

router.delete('/:project_id', deleteProject);

module.exports = router;
