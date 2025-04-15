const express = require('express');
const router = express.Router();
const User = require('../model/user.model');
const generateToken = require('../middleware/generateToken');

// Register new user
router.post('/register', async (req, res) => {
    try {
      const { email, password, username, birthdate, gender } = req.body;
  
      // Validate required fields
      if (!email || !password || !username || !birthdate || !gender) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Create new user (password hashing handled by schema)
      const user = new User({
        username,
        email,
        password,
        birthdate,
        gender,
      });
  
      await user.save();
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: 'Email or username already exists' });
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
        console.log('Generated Token:', token); // Debug
        console.log('NODE_ENV:', process.env.NODE_ENV); // Debug environment
        console.log('Cookie Options:', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        }); // Debug options

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        console.log('Cookie set in response'); // Debug

        res.status(200).send({
            message: 'Logged in successfully',
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send({ message: 'Login failed' });
    }
});

// Logout user
router.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
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

module.exports = router;