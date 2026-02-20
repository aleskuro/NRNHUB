const express = require('express');
const router = express.Router();

console.log('ContactRoutes module loaded');

// Try to load the Contact model
let Contact;
try {
  Contact = require('../model/Contact');
  console.log('Contact model loaded successfully from ../model/Contact');
} catch (error) {
  console.error('Failed to load Contact model from ../model/Contact:', error.message);
  
  const possiblePaths = [
    '../../model/Contact',
    '../models/Contact',
    '../../models/Contact',
    './model/Contact',
    './models/Contact'
  ];
    
  for (const path of possiblePaths) {
    try {
      Contact = require(path);
      console.log(`Contact model loaded successfully from ${path}`);
      break;
    } catch (altError) {
      console.error(`Failed to load from ${path}:`, altError.message);
    }
  }
  
  if (!Contact) {
    console.error('Could not load Contact model from any path');
  }
}

// Debug middleware
router.use((req, res, next) => {
  console.log(`Contact route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// POST: Create contact
router.post('/', async (req, res) => {
  console.log('POST /api/contacts endpoint hit');
  console.log('Request body:', req.body);
  
  try {
    if (!Contact) {
      return res.status(500).json({ 
        message: 'Contact model not available. Check server logs.' 
      });
    }

    const { name, email, phone, message } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name is required and must be at least 2 characters' });
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      message: message?.trim() || '',
    });

    const savedContact = await contact.save();
    console.log('Saved contact:', savedContact);
    
    res.status(201).json({ 
      message: 'Contact submission successful',
      contact: savedContact
    });
    
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ 
      message: 'Server error when submitting contact',
      error: error.message 
    });
  }
});

// GET: Fetch all contacts
router.get('/', async (req, res) => {
  console.log('GET /api/contacts endpoint hit');
  
  try {
    if (!Contact) {
      return res.status(500).json({ 
        message: 'Contact model not available. Check server logs.' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments();

    console.log(`Found ${contacts.length} contacts (page ${page})`);
    
    res.status(200).json({
      contacts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalContacts: total,
      },
    });
    
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      message: 'Server error when fetching contacts',
      error: error.message 
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  console.log('Contact test route hit');
  res.json({ 
    message: 'Contact routes are working!', 
    timestamp: new Date().toISOString(),
    modelLoaded: !!Contact
  });
});

console.log('ContactRoutes setup complete');
module.exports = router;