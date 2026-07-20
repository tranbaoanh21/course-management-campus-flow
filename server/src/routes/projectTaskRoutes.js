const express = require('express');

const { getTasksByProject, createTask } = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });

router.get('/', getTasksByProject);
router.post('/', createTask);

module.exports = router;
