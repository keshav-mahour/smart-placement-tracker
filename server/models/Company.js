const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Please add a role/job title'],
    trim: true
  },
  package: {
    type: Number, // package in LPA
    required: [true, 'Please add the package in LPA']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add an application deadline']
  },
  status: {
    type: String,
    enum: ['Applied', 'Online Assessment', 'Technical Interview', 'HR Interview', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  category: {
    type: String,
    enum: ['Product', 'Service', 'Startup', 'MNC'],
    required: [true, 'Please specify the company category']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  testDate: {
    type: Date,
    default: null
  },
  interviewDate: {
    type: Date,
    default: null
  },
  reminders: {
    oaSent: {
      type: Boolean,
      default: false
    },
    interviewSent: {
      type: Boolean,
      default: false
    },
    deadlineSent: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', CompanySchema);
