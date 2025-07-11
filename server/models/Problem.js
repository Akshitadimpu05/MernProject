const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  constraints: {
    type: String,
    required: true
  },
  testCases: [{
    input: {
      type: String,
      required: true
    },
    output: {
      type: String,
      required: true
    }
  }],
  solution: {
    type: String,
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ProblemSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Problem', ProblemSchema);
