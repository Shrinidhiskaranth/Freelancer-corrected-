const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register/client', authController.registerClient);
router.post('/register/freelancer', authController.registerFreelancer);
router.post('/check-exists', authController.checkExists);

router.post('/login/client', authController.loginClient);
router.post('/login/freelancer', authController.loginFreelancer);

router.get('/me', verifyToken, authController.me);
router.post('/logout', verifyToken, authController.logout);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
