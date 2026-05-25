require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
  });

// --- API Routes ---

// GET All Users
app.get('/api/users', async (req, res) => {
  try {
    // We select only the fields we need, excluding the password hash
    const users = await User.find({}).select('name username role createdAt');
    res.json(users);
  } catch (error) {
    console.error('[GET USERS ERROR]', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Name, username, and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const user = new User({ name, username, password, role });
    await user.save();

    // Return the newly created user (excluding password) to be added to the list instantly
    const createdUser = {
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json(createdUser);

  } catch (error) {
    console.error('[SIGNUP ERROR]', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, username: user.username, role: user.role }
    });

  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = app;
