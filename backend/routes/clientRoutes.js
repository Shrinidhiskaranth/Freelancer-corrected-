const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const clientProfileController = require('../controllers/clientProfileController');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Message = require('../models/Message');

const clientOnly = [verifyToken, requireRole('CLIENT')];

const profileUpload = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 },
]);

router.post('/profile', clientOnly, profileUpload, clientProfileController.completeProfile);
router.get('/profile/me', clientOnly, clientProfileController.getMyProfile);

router.get('/dashboard', clientOnly, (req, res) => {
  res.json({ success: true, message: 'Client dashboard access granted' });
});

// Live counts for the client dashboard stat cards
router.get('/stats', clientOnly, async (req, res) => {
  try {
    const clientId = req.user._id;

    // Get all this client's projects
    const projects = await Project.find({ clientId });
    const projectIds = projects.map(p => p._id);

    // Only "In Progress" projects count as active contracts
    const inProgressIds = projects.filter(p => p.status === 'In Progress').map(p => p._id);

    // Active contracts = accepted proposals only for projects still running
    const activeContracts = await Proposal.countDocuments({
      project: { $in: inProgressIds },
      status: 'accepted'
    });

    // Pending proposals = bids still waiting for a decision across all projects
    const pendingProposals = await Proposal.countDocuments({
      project: { $in: projectIds },
      status: 'pending'
    });

    // Messages the client hasn't read yet
    const unreadMessages = await Message.countDocuments({
      receiver: clientId,
      read: false
    });

    res.json({ success: true, activeContracts, pendingProposals, unreadMessages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong', error: err.message });
  }
});

module.exports = router;
