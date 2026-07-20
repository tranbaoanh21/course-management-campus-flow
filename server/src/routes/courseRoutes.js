const express = require('express');

const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

const router = express.Router();

router.get('/', getCourses);
router.post('/', createCourse);
router.patch('/:course_id', updateCourse);
router.delete('/:course_id', deleteCourse);

module.exports = router;
