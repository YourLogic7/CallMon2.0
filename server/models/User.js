const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'QC', 'TL', 'Agent'], default: 'Agent' }
}, { timestamps: true });

// CORRECTED ASYNC/AWAIT IMPLEMENTATION
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return; // Exit if password hasn't changed
  }
  // No try/catch needed, Mongoose handles promise rejections
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
