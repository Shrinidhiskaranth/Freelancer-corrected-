const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Client-only AI Matching Recommendations
router.get('/project/:projectId/matches', verifyToken, requireRole('CLIENT'), aiController.getProjectMatches);

module.exports = router;
