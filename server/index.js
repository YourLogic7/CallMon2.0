const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Finding = require('./models/Finding');
const User = require('./models/User');
const TeamLeader = require('./models/TeamLeader');
const SDM = require('./models/SDM');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// --- API Users (Account Management) ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- API Team Leaders ---
app.get('/api/team-leaders', async (req, res) => {
  try {
    const tls = await TeamLeader.find().sort({ name: 1 });
    res.json(tls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/team-leaders', async (req, res) => {
  try {
    const newTL = new TeamLeader(req.body);
    const savedTL = await newTL.save();
    res.status(201).json(savedTL);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/team-leaders/:id', async (req, res) => {
  try {
    await TeamLeader.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team Leader deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- API SDM ---
app.get('/api/sdm', async (req, res) => {
  try {
    const sdms = await SDM.find().sort({ name: 1 });
    res.json(sdms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/sdm', async (req, res) => {
  try {
    const newSDM = new SDM(req.body);
    const savedSDM = await newSDM.save();
    res.status(201).json(savedSDM);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/sdm/:id', async (req, res) => {
  try {
    await SDM.findByIdAndDelete(req.params.id);
    res.json({ message: 'SDM deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- API Findings ---

// POST: Create a new finding
app.post('/api/findings', async (req, res) => {
  try {
    const newFinding = new Finding(req.body);
    const savedFinding = await newFinding.save();
    res.status(201).json(savedFinding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET: Get all findings
app.get('/api/findings', async (req, res) => {
  try {
    const findings = await Finding.find().sort({ createdAt: -1 });
    res.json(findings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;
