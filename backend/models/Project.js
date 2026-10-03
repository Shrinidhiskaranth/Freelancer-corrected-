const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    category: {
      type: String,
      required: [true, 'Project category is required'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert'],
      default: 'Intermediate',
    },
    attachments: {
      type: [String],
      default: [],
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open',
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Escrow', 'Paid'],
      default: 'Unpaid',
    },
    progressUpdates: [{
      text: String,
      fileLink: String,
      date: { type: Date, default: Date.now },
      freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', ProjectSchema);
