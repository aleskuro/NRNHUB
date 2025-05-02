const express = require('express');
const router = express.Router();
const User = require('../model/user.model');
const generateToken = require('../middleware/generateToken');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, birthdate, gender } = req.body;
    if (!email || !password || !username || !birthdate || !gender) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = new User({ username, email, password, birthdate, gender });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }
    const token = await generateToken(user._id);
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const loginTime = new Date();
    await User.findByIdAndUpdate(user._id, {
      $set: { lastOnline: loginTime },
      $push: {
        loginHistory: { timestamp: loginTime, ipAddress, userAgent },
        sessions: { startTime: loginTime, duration: 0 } // Initialize session
      }
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).send({
      message: 'Logged in successfully',
      token,
      user: { _id: user._id, email: user.email, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({ message: 'Login failed' });
  }
});

// Update session duration on logout
router.post('/logout', async (req, res) => {
  try {
    const userId = req.user?._id; // Assuming middleware sets req.user
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.sessions?.length) {
        const lastSession = user.sessions[user.sessions.length - 1];
        if (lastSession && !lastSession.duration) {
          const duration = Math.round((new Date() - new Date(lastSession.startTime)) / 1000);
          await User.findByIdAndUpdate(userId, {
            $set: { 'sessions.$[session].duration': duration },
            $push: { lastOnline: new Date() }
          }, {
            arrayFilters: [{ 'session._id': lastSession._id }]
          });
        }
      }
    }
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.status(200).send({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Failed to log out:', error);
    res.status(500).json({ message: 'Logout failed!' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'id email role');
    res.status(200).send(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send({ message: 'Failed to fetch users' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ message: 'Failed to delete user' });
  }
});

// Update a user role
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).send({ message: 'Failed to update user role' });
  }
});

// Get user login tracking data
router.get('/login-tracking', async (req, res) => {
  try {
    const users = await User.find(
      {},
      'username email lastOnline loginHistory role createdAt birthdate gender sessions'
    ).lean();
    const trackingData = users.map((user) => {
      const lastOnline = user.lastOnline ? new Date(user.lastOnline) : null;
      const loginHistory = Array.isArray(user.loginHistory)
        ? user.loginHistory.map((entry) => ({
            timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : null,
            ipAddress: entry.ipAddress || 'Unknown',
            userAgent: entry.userAgent || 'Unknown'
          }))
        : [];
      const sessions = Array.isArray(user.sessions)
        ? user.sessions.map((session) => ({
            startTime: session.startTime ? new Date(session.startTime).toISOString() : null,
            duration: session.duration || 0
          }))
        : [];
      return {
        _id: user._id?.toString() || null,
        username: user.username || 'Unknown',
        email: user.email || 'Unknown',
        role: user.role || 'user',
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
        birthdate: user.birthdate ? new Date(user.birthdate).toISOString() : null,
        gender: user.gender || 'Unknown',
        lastOnline: lastOnline ? lastOnline.toISOString() : null,
        loginHistory,
        sessions,
        isOnline: lastOnline ? Date.now() - lastOnline.getTime() < 15 * 60 * 1000 : false,
        activity: {
          features: {
            profileViews: Math.floor(Math.random() * 50), // Simulated
            posts: Math.floor(Math.random() * 20),
            comments: Math.floor(Math.random() * 30),
            likes: Math.floor(Math.random() * 100),
            shares: Math.floor(Math.random() * 10)
          },
          social: Math.floor(Math.random() * 50),
          content: Math.floor(Math.random() * 10)
        }
      };
    });
    res.status(200).json({
      message: 'Login tracking data retrieved successfully',
      users: trackingData || []
    });
  } catch (error) {
    console.error('Error fetching login tracking data:', error);
    res.status(500).json({
      message: 'Failed to fetch login tracking data',
      error: error.message
    });
  }
});

module.exports = router;