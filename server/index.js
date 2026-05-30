require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Finding = require('./models/Finding');
const TeamLeader = require('./models/TeamLeader');
const SDM = require('./models/SDM');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Database Connection
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  console.log('Connecting to MongoDB...');
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    cachedDb = db;
    console.log('Connected to MongoDB');
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// --- API Routes ---

// GET All Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('name username role createdAt');
    res.json(users);
  } catch (error) {
    console.error('[GET USERS ERROR]', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Signup (This also generates a token, let's update it too for consistency)
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

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '5h' }); // <-- CHANGED TO 5h

    // Signup now also returns a token and user object, just like login
    res.status(201).json({ 
      token,
      user: { id: user._id, name: user.name, username: user.username, role: user.role }
    });

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

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '5h' }); // <-- CHANGED TO 5h

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, username: user.username, role: user.role }
    });

  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ message: error.message });
  }
});

// FINDINGS ENDPOINTS
app.get('/api/findings', async (req, res) => {
  try {
    const findings = await Finding.find({}).sort({ createdAt: -1 });
    const formatted = findings.map(f => {
      const obj = f.toObject();
      obj.id = f._id.toString();
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    console.error('[GET FINDINGS ERROR]', error);
    res.status(500).json({ message: 'Failed to fetch findings' });
  }
});

app.post('/api/findings', async (req, res) => {
  try {
    const findingData = req.body;
    
    // Auto-populate teamName and agentUsername from SDM record
    if (findingData.agentName) {
      const sdm = await SDM.findOne({ name: findingData.agentName });
      if (sdm) {
        if (!findingData.teamName) findingData.teamName = sdm.teamName;
        if (!findingData.agentUsername) {
          // Find user by name to get username
          const user = await User.findOne({ name: findingData.agentName, role: 'Agent' });
          if (user) {
            findingData.agentUsername = user.username;
          } else {
            // Fallback or handle case where user doesn't exist
            findingData.agentUsername = sdm.nik; // Or some other identifier
          }
        }
      }
    }

    const finding = new Finding(findingData);
    await finding.save();
    const obj = finding.toObject();
    obj.id = finding._id.toString();
    res.status(201).json(obj);
  } catch (error) {
    console.error('[POST FINDING ERROR]', error);
    res.status(500).json({ message: error.message || 'Failed to save finding' });
  }
});

app.put('/api/findings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedFinding = await Finding.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedFinding) {
      return res.status(404).json({ message: 'Finding not found' });
    }
    
    const obj = updatedFinding.toObject();
    obj.id = updatedFinding._id.toString();
    res.json(obj);
  } catch (error) {
    console.error('[PUT FINDING ERROR]', error);
    res.status(500).json({ message: 'Failed to update finding' });
  }
});

// TEAM LEADERS ENDPOINTS
app.get('/api/team-leaders', async (req, res) => {
  try {
    const tls = await TeamLeader.find({});
    res.json(tls);
  } catch (error) {
    console.error('[GET TL ERROR]', error);
    res.status(500).json({ message: 'Failed to fetch team leaders' });
  }
});

app.post('/api/team-leaders', async (req, res) => {
  try {
    const { name, nik } = req.body;
    if (!name || !nik) {
      return res.status(400).json({ message: 'Name and NIK are required' });
    }
    const tl = new TeamLeader({ name, nik });
    await tl.save();
    res.status(201).json(tl);
  } catch (error) {
    console.error('[POST TL ERROR]', error);
    res.status(500).json({ message: error.message || 'Failed to create team leader' });
  }
});

app.delete('/api/team-leaders/:id', async (req, res) => {
  try {
    await TeamLeader.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Team leader deleted' });
  } catch (error) {
    console.error('[DELETE TL ERROR]', error);
    res.status(500).json({ message: 'Failed to delete team leader' });
  }
});

// SDM (AGENT) ENDPOINTS
app.get('/api/sdm', async (req, res) => {
  try {
    const sdmList = await SDM.find({});
    res.json(sdmList);
  } catch (error) {
    console.error('[GET SDM ERROR]', error);
    res.status(500).json({ message: 'Failed to fetch SDMs' });
  }
});

app.post('/api/sdm', async (req, res) => {
  try {
    const { name, nik, teamName } = req.body;
    if (!name || !nik || !teamName) {
      return res.status(400).json({ message: 'Name, NIK and Team Name are required' });
    }
    const sdm = new SDM({ name, nik, teamName });
    await sdm.save();
    res.status(201).json(sdm);
  } catch (error) {
    console.error('[POST SDM ERROR]', error);
    res.status(500).json({ message: error.message || 'Failed to create SDM' });
  }
});

app.delete('/api/sdm/:id', async (req, res) => {
  try {
    await SDM.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'SDM deleted' });
  } catch (error) {
    console.error('[DELETE SDM ERROR]', error);
    res.status(500).json({ message: 'Failed to delete SDM' });
  }
});

// DELETE USER ENDPOINT
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('[DELETE USER ERROR]', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = app;

// Local Development Server Listener
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

