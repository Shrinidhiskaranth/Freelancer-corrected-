const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const freelancerProfileController = require('../controllers/freelancerProfileController');
const FreelancerProfile = require('../models/FreelancerProfile');
const Proposal = require('../models/Proposal');
const Message = require('../models/Message');

const freelancerOnly = [verifyToken, requireRole('FREELANCER')];

const profileUpload = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'portfolioFiles', maxCount: 10 },
  { name: 'certificateFiles', maxCount: 10 },
]);

router.post('/profile', freelancerOnly, profileUpload, freelancerProfileController.completeProfile);
router.get('/profile/me', freelancerOnly, freelancerProfileController.getMyProfile);

// Public — search all freelancer profiles
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { q = '', skill = '', category = '' } = req.query;
    const filter = {};
    if (skill)    filter.skills    = { $in: [new RegExp(skill, 'i')] };
    if (category) filter.category  = new RegExp(category, 'i');

    let profiles = await FreelancerProfile.find(filter)
      .populate('user', 'fullName username email createdAt')
      .lean();

    // Text search across name / title / skills / summary
    if (q) {
      const re = new RegExp(q, 'i');
      profiles = profiles.filter(p =>
        re.test(p.user?.fullName) ||
        re.test(p.professionalTitle) ||
        re.test(p.professionalSummary) ||
        (p.skills || []).some(s => re.test(s))
      );
    }

    res.json({ success: true, freelancers: profiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch freelancers' });
  }
});

// Dashboard stats
router.get('/dashboard', freelancerOnly, async (req, res) => {
  try {
    const freelancerId = req.user._id;
    const proposals = await Proposal.find({ freelancer: freelancerId })
      .populate('project', 'status');
    
    let activeBids = 0;
    let totalEarnings = 0;
    let activeContracts = 0;

    proposals.forEach(p => {
        if (p.status === 'pending') activeBids++;
        if (p.status === 'accepted') {
            totalEarnings += (p.bidAmount || 0);
            // Count as active only when the project is still running, not finished
            if (p.project && p.project.status === 'In Progress') {
                activeContracts++;
            }
        }
    });

    const unreadMessages = await Message.countDocuments({ receiver: freelancerId, read: false });

    res.json({ 
      success: true, 
      stats: { activeBids, totalEarnings, activeContracts, unreadMessages } 
    });
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

