const mongoose = require('mongoose');

const InterviewExperienceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  verdict: {
    type: String,
    enum: ['Selected', 'Rejected', 'No Offer'],
    required: true
  },
  rounds: [{
    title: { type: String, required: true }, // e.g. "OA", "Technical Round 1"
    description: { type: String, default: '' }
  }],
  questionsAsked: {
    type: [String],
    default: []
  },
  topics: {
    type: [String], // e.g., ["Graphs", "OOP", "SQL"]
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InterviewExperience', InterviewExperienceSchema);
