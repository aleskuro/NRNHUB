const express = require('express');
const router = express.Router();
const Event = require('../model/event.model');

router.post('/create', async (req, res) => {
  try {
    const { title, date, timeZone, location, description, isInHouse, organizerLink, image } = req.body;

    if (!title || !date || !location || !description) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!isInHouse && !organizerLink) {
      return res.status(400).json({ message: 'Organizer link is required for outhouse events' });
    }

    const tz = timeZone || 'Asia/Kathmandu';
    const localDate = new Date(date);
    const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: tz }));

    const eventData = {
      title,
      date: utcDate,
      location,
      description,
      isInHouse: isInHouse === 'true' || isInHouse === true,
      organizerLink: isInHouse ? null : organizerLink,
      image: image || null,
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({ message: 'Events retrieved successfully', events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event retrieved successfully', event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
});

router.post('/:id/register', async (req, res) => {
    try {
      const { name, email, gender, age } = req.body;
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      if (!name || !email || !gender || !age) {
        return res.status(400).json({ message: 'Name, email, gender, and age are required' });
      }
  
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
      }
  
      if (!['Male', 'Female', 'Other'].includes(gender)) {
        return res.status(400).json({ message: 'Gender must be Male, Female, or Other' });
      }
  
      if (isNaN(age) || age < 1 || age > 120) {
        return res.status(400).json({ message: 'Age must be between 1 and 120' });
      }
  
      const alreadyRegistered = event.registeredUsers.some((reg) => reg.email === email);
      if (alreadyRegistered) {
        return res.status(400).json({ message: 'This email is already registered for the event' });
      }
  
      const registration = { name, email, gender, age };
      event.registeredUsers.push(registration);
      await event.save();
  
      if (!event.isInHouse) {
        const referenceId = registration.referenceId;
        return res.status(200).json({
          message: 'Redirecting to organizer registration',
          organizerLink: `${event.organizerLink}?ref=${referenceId}`,
          referenceId,
        });
      }
  
      res.status(200).json({
        message: 'Successfully registered for the event',
        referenceId: registration.referenceId,
      });
    } catch (error) {
      console.error('Error registering for event:', error);
      res.status(500).json({ message: 'Failed to register for event', error: error.message });
    }
  });

  router.get('/:id/details', async (req, res) => {
    try {
      const event = await Event.findById(req.params.id).select('title registeredUsers');
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      const registrationDetails = {
        title: event.title,
        registeredUsers: event.registeredUsers.map((reg) => ({
          name: reg.name,
          email: reg.email,
          gender: reg.gender,
          age: reg.age,
          registeredAt: reg.registeredAt,
          referenceId: reg.referenceId,
        })),
      };
      res.status(200).json({ message: 'Registration details retrieved successfully', registrationDetails });
    } catch (error) {
      console.error('Error fetching event details:', error);
      res.status(500).json({ message: 'Failed to fetch event details', error: error.message });
    }
  });

module.exports = router;