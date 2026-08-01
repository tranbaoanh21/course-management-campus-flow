const express = require('express');

const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
} = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use((request, response, next) => {
  response.set('Cache-Control', 'no-store');
  next();
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getCurrentUser);
router.patch('/profile', requireAuth, updateProfile);
router.patch('/password', requireAuth, changePassword);
router.post('/logout', requireAuth, logout);

module.exports = router;
