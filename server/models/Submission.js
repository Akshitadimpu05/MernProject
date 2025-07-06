const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  id: String,
  input: String,
  expected: String,
  output: String,
  passed: Boolean
});

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,  // Changed from ObjectId to String
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
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong_answer', 'runtime_error', 'compilation_error'],
    default: 'pending'
  },
  testCases: [testCaseSchema],
  output: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
