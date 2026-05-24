const mongoose = require('mongoose');

const FindingSchema = new mongoose.Schema({
  agentName: {
    type: String,
    required: true
  },
  evaluatorName: {
    type: String,
    required: true
  },
  scores: {
    softSkills: { type: Number, default: 0 },
    productKnowledge: { type: Number, default: 0 },
    processCompliance: { type: Number, default: 0 }
  },
  isFatal: {
    type: Boolean,
    default: false
  },
  finalScore: {
    type: Number,
    required: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Finding', FindingSchema);
