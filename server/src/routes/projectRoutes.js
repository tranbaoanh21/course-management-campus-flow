const express = require('express');

const { updateProject, deleteProject } = require('../controllers/projectController');

const router = express.Router();

router.patch('/:project_id', updateProject);
router.delete('/:project_id', deleteProject);

module.exports = router;
