const express = require('express');
const router = express.Router();
const CallBooking = require('../model/CallBooking');

router.post('/bookings', async (req, res) => {
 try {
 console.log('Received call booking:', req.body);
 const { name, email, phone, dateTime, message } = req.body;

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

router.get('/bookings', async (req, res) => {
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