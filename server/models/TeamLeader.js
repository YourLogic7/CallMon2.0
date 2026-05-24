const mongoose = require('mongoose');

const teamLeaderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nik: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('TeamLeader', teamLeaderSchema);
