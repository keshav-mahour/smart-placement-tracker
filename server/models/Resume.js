const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  versionLabel: {
    type: String,
    required: true,
    default: 'Resume V1'
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  skills: {
    type: [String],
    default: []
  },
  analysis: {
    missingSkills: {
      type: [String],
      default: []
    },
    improvementTips: {
      type: [String],
      default: []
    },
    weakAreas: {
      type: [String],
      default: []
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', ResumeSchema);
