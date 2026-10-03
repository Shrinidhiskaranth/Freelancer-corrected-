const Review   = require('../models/Review');
const Project  = require('../models/Project');
const Proposal = require('../models/Proposal');

/* ── Submit a review (CLIENT or FREELANCER) ──── */
exports.submitReview = async (req, res) => {
  try {
    const reviewerId = req.user._id;
    const role       = req.user.role; // 'CLIENT' or 'FREELANCER'
    const { projectId, rating, comment } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.status !== 'Completed')
      return res.status(400).json({ success: false, message: 'Project must be completed first' });

    // Find the accepted proposal to know who's involved
    const accepted = await Proposal.findOne({ project: projectId, status: 'accepted' });
    if (!accepted) return res.status(404).json({ success: false, message: 'No accepted freelancer for this project' });

    let revieweeId;
    if (role === 'CLIENT') {
      // Client must own this project
      if (project.clientId.toString() !== reviewerId.toString())
        return res.status(403).json({ success: false, message: 'Not your project' });
      revieweeId = accepted.freelancer; // client reviews freelancer
    } else {
      // Freelancer must be the accepted one
      if (accepted.freelancer.toString() !== reviewerId.toString())
        return res.status(403).json({ success: false, message: 'You are not the freelancer on this project' });
      revieweeId = project.clientId; // freelancer reviews client
    }

    const existing = await Review.findOne({ project: projectId, reviewer: reviewerId });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this project' });

    const review = await Review.create({
      project:      projectId,
      reviewer:     reviewerId,
      reviewee:     revieweeId,
      reviewerRole: role,
      rating:       Number(rating),
      comment:      comment || '',
    });

    res.status(201).json({ success: true, message: 'Review submitted', review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/* ── Get reviews FOR a user (as reviewee) ───── */
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'fullName username')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    const avg = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ success: true, reviews, averageRating: avg, totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/* ── Check if current user already reviewed a project ─ */
exports.checkReview = async (req, res) => {
  try {
    const reviewerId = req.user._id;
    const { projectId } = req.params;
    const review = await Review.findOne({ project: projectId, reviewer: reviewerId });
    res.json({ success: true, hasReviewed: !!review, review: review || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
