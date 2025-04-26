const express = require('express');
const router = express.Router();
const CallBooking = require('../model/CallBooking');
const User = require('../model/user.model'); //  Ensure this is correctly pointing to your User model

// Middleware for admin authentication using user.role (no tokens)
const authAdminMiddleware = async (req, res, next) => {
  try {
    //  Important:  This middleware now relies on the user object being attached to the request
    //  by a *previous* authentication middleware (e.g., during login).
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    //  Check the user's role.  Adjust 'admin' to match your actual role name in the database.
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    //  If the user is an admin, proceed
    next();
  } catch (error) {
    console.error('Error checking user role:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit a new call booking
router.post('/bookings', async (req, res) => {
  try {
    console.log('Received call booking:', req.body);
    const { name, email, phone, dateTime, message } = req.body;

    // Basic validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name is required and must be at least 2 characters' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }
    if (!dateTime || isNaN(new Date(dateTime).getTime())) {
      return res.status(400).json({ message: 'Valid date and time are required' });
    }

    const booking = new CallBooking({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      dateTime: new Date(dateTime),
      message: message?.trim() || '',
    });

    await booking.save();
    console.log('Saved call booking:', booking);
    res.status(201).json({ message: 'Call booking submitted successfully' });
  } catch (error) {
    console.error('Error saving call booking:', error);
    res.status(500).json({ message: error.message || 'Server error when submitting booking' });
  }
});

// Get all call bookings (admin only)
router.get('/bookings', authAdminMiddleware, async (req, res) => {
  try {
    console.log('Fetching all call bookings');
    const bookings = await CallBooking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: error.message || 'Server error when fetching bookings' });
  }
});

module.exports = router;
