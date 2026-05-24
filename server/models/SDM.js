const mongoose = require('mongoose');

const sdmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nik: { type: String, required: true, unique: true },
  teamName: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SDM', sdmSchema);
