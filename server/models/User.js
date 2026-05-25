const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'QC', 'TL', 'Agent'], default: 'Agent' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', function(next) {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // Generate a salt
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    // Hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // Override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// Method to compare password for login
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
