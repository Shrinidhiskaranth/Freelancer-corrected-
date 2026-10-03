const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const freelancerOnly = [verifyToken, requireRole('FREELANCER')];
const clientOnly = [verifyToken, requireRole('CLIENT')];

// Freelancer Routes
router.post('/submit', freelancerOnly, proposalController.submitProposal);
router.get('/my-proposals', freelancerOnly, proposalController.getMyProposals);
router.get('/my-contracts', freelancerOnly, proposalController.getMyContracts);
router.put('/:proposalId/edit', freelancerOnly, proposalController.editProposal);

// Client Routes
router.get('/project/:projectId', clientOnly, proposalController.getProjectProposals);
router.put('/:proposalId/status', clientOnly, proposalController.updateProposalStatus);

module.exports = router;
