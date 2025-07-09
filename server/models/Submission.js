const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['cpp', 'java', 'python'],
    default: 'cpp'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong_answer', 'error'],
    default: 'pending'
  },
  output: {
    type: String,
    default: ''
  },
  testCases: [{
    id: String,
    input: String,
    expected: String,
    output: String,
    passed: Boolean
  }],
  executionTime: {
    type: Number,
    default: 0
  },
  memoryUsed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
SubmissionSchema.index({ userId: 1, problemId: 1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Submission', SubmissionSchema);