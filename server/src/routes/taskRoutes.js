const express = require('express');

const { updateTaskStatus, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.patch('/:task_id/status', updateTaskStatus);
router.delete('/:task_id', deleteTask);

module.exports = router;
