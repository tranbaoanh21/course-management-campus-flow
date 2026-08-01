const express = require('express');

const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { getCourseOverview } = require('../controllers/courseOverviewController');

const router = express.Router();

router.get('/', getCourses);
router.post('/', createCourse);
router.get('/:course_id/overview', getCourseOverview);
router.patch('/:course_id', updateCourse);
router.delete('/:course_id', deleteCourse);

module.exports = router;
