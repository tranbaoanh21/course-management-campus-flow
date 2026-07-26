const express = require('express');

const {
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getTasks);
router.patch('/:task_id/status', updateTaskStatus);
router.patch('/:task_id', updateTask);
router.delete('/:task_id', deleteTask);

module.exports = router;
