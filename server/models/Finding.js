const mongoose = require('mongoose');

const FindingSchema = new mongoose.Schema({
  agentName: {
    type: String,
    required: true
  },
  agentUsername: {
    type: String,
    required: true
  },
  auditorName: {
    type: String,
    required: true
  },
  auditorRole: {
    type: String,
    enum: ['superadmin', 'QC', 'TL'],
    default: 'QC'
  },
  date: {
    type: String,
    required: true
  },
  week: {
    type: String,
    enum: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    default: 'Week 1'
  },
  score: {
    type: Number,
    required: true
  },
  paramScores: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  failedSubParams: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isFatal: {
    type: Boolean,
    default: false
  },
  notes: String,
  msisdn: String,
  noTiket: String,
  noCWC: String,
  duration: String,
  callDate: String,
  callTime: String,
  
  // Follow-up fields
  teamName: String,
  hasilValidasiTL: String,
  improvement: String,
  pembinaan: String,
  followUpAt: {
    type: Date
  },
  
  // Backward compatibility fields
  evaluatorName: String,
  finalScore: Number,
  scores: {
    softSkills: { type: Number, default: 0 },
    productKnowledge: { type: Number, default: 0 },
    processCompliance: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Sync backward compatibility fields before saving
FindingSchema.pre('save', function() {
  if (this.auditorName && !this.evaluatorName) {
    this.evaluatorName = this.auditorName;
  }
  if (this.score !== undefined && this.finalScore === undefined) {
    this.finalScore = this.score;
  }
});

module.exports = mongoose.model('Finding', FindingSchema);
