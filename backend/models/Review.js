const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    project:      { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    reviewer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    reviewee:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    reviewerRole: { type: String, enum: ['CLIENT', 'FREELANCER'],         required: true },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    comment:      { type: String, default: '' },
  },
  { timestamps: true }
);

// One review per project per reviewer
reviewSchema.index({ project: 1, reviewer: 1 }, { unique: true });

// Drop the old index if it exists to prevent E11000 duplicate key error
const Review = mongoose.model('Review', reviewSchema);
Review.collection.dropIndex('project_1_client_1').catch(() => {
  // Ignore if index doesn't exist
});

module.exports = Review;
