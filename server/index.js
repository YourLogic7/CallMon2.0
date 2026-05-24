const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Finding = require('./models/Finding');

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
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
