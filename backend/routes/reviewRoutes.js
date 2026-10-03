const express    = require('express');
const router     = express.Router();
const reviewCtrl = require('../controllers/reviewController');
const verifyToken  = require('../middleware/authMiddleware');
const requireRole  = require('../middleware/roleMiddleware');

const anyAuth    = [verifyToken];
const clientOnly = [verifyToken, requireRole('CLIENT')];

// Both CLIENT and FREELANCER can submit (controller handles role check)
router.post('/submit',               anyAuth,    reviewCtrl.submitReview);
// Check if current user already reviewed a project
router.get('/check/:projectId',      anyAuth,    reviewCtrl.checkReview);
// Get all reviews for any user (shown on profile, bids, etc.)
router.get('/user/:userId',          anyAuth,    reviewCtrl.getUserReviews);

module.exports = router;
