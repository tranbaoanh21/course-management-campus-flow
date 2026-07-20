const express = require('express');

const { getCourses, createCourse, deleteCourse } = require('../controllers/courseController');

const router = express.Router();

router.get('/', getCourses);
router.post('/', createCourse);
router.delete('/:course_id', deleteCourse);

module.exports = router;
