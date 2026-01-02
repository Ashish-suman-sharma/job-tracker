const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const statusHistorySchema = new mongoose.Schema({
  status: String,
  changedAt: { type: Date, default: Date.now },
  note: String
});

const jobSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    default: '',
    trim: true
  },
  jobLink: {
    type: String,
    default: ''
  },
  contactEmail: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    enum: ['LinkedIn', 'Company Site', 'Referral', 'Indeed', 'Glassdoor', 'AngelList', 'Other', 'Unknown'],
    default: 'Unknown'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Shortlisted', 'Rejected', 'Offer', 'Ghosted'],
    default: 'Applied'
  },
  notes: {
    type: String,
    default: ''
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['Telegram', 'Web'],
    default: 'Web'
  },
  followUpDate: {
    type: Date,
    default: null
  },
  interviewDate: {
    type: Date,
    default: null
  },
  statusHistory: [statusHistorySchema]
}, {
  timestamps: true
});

// Index for faster queries
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, companyName: 1 });
jobSchema.index({ userId: 1, appliedDate: -1 });

// Pre-save middleware to track status changes
jobSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Job', jobSchema);
