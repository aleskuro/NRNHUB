// Src/routes/event.routes.js
const express = require('express');
const router = express.Router();
const Event = require('../model/event.model');

/* -------------------------------------------------------------
   CREATE EVENT
------------------------------------------------------------- */
router.post('/create', async (req, res) => {
  try {
    console.log('CREATE → body:', req.body);

    const { title, date, timeZone, location, description, isInHouse, organizerLink, image } = req.body;

    if (!title || !date || !location || !description) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!isInHouse && !organizerLink) {
      return res.status(400).json({ message: 'Organizer link is required for outhouse events' });
    }

    const tz = timeZone || 'Asia/Kathmandu';

    const eventDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const eventData = {
      title,
      date: eventDate,
      location,
      description,
      timeZone: tz,
      isInHouse: isInHouse === 'true' || isInHouse === true,
      organizerLink: isInHouse ? null : organizerLink,
      image: image || null,
    };

    const event = new Event(eventData);
    const saved = await event.save();

    console.log('Event created →', saved._id);
    res.status(201).json({ message: 'Event created successfully', event: saved });
  } catch (err) {
    console.error('CREATE error:', err);
    res.status(500).json({
      message: 'Failed to create event',
      error: err.message,
      details: err.errors
        ? Object.keys(err.errors).map(k => ({ field: k, message: err.errors[k].message }))
        : null,
    });
  }
});

/* -------------------------------------------------------------
   UPDATE EVENT
------------------------------------------------------------- */
router.put('/:id', async (req, res) => {
  try {
    console.log('UPDATE → id:', req.params.id, 'body:', req.body);

    const { title, date, timeZone, location, description, isInHouse, organizerLink, image } = req.body;

    if (!title || !date || !location || !description) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (!isInHouse && !organizerLink) {
      return res.status(400).json({ message: 'Organizer link is required for external events' });
    }

    const tz = timeZone || 'Asia/Kathmandu';
    const eventDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const updateData = {
      title,
      date: eventDate,
      location,
      description,
      timeZone: tz,
      isInHouse: isInHouse === 'true' || isInHouse === true,
      organizerLink: isInHouse ? null : organizerLink,
      image: image || null,
    };

    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: 'Event not found' });

    console.log('Event updated →', updated._id);
    res.json({ message: 'Event updated successfully', event: updated });
  } catch (err) {
    console.error('UPDATE error:', err);
    res.status(500).json({
      message: 'Failed to update event',
      error: err.message,
      details: err.errors
        ? Object.keys(err.errors).map(k => ({ field: k, message: err.errors[k].message }))
        : null,
    });
  }
});

/* -------------------------------------------------------------
   DELETE EVENT
------------------------------------------------------------- */
router.delete('/:id', async (req, res) => {
  try {
    console.log('DELETE → id:', req.params.id);
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Event not found' });

    console.log('Event deleted →', deleted._id);
    res.json({ message: 'Event deleted successfully', event: deleted });
  } catch (err) {
    console.error('DELETE error:', err);
    res.status(500).json({ message: 'Failed to delete event', error: err.message });
  }
});

/* -------------------------------------------------------------
   GET ALL EVENTS
------------------------------------------------------------- */
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ message: 'Events retrieved successfully', events });
  } catch (err) {
    console.error('GET ALL error:', err);
    res.status(500).json({ message: 'Failed to fetch events', error: err.message });
  }
});

/* -------------------------------------------------------------
   GET EVENT BY ID
------------------------------------------------------------- */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event retrieved successfully', event });
  } catch (err) {
    console.error('GET BY ID error:', err);
    res.status(500).json({ message: 'Failed to fetch event', error: err.message });
  }
});

/* -------------------------------------------------------------
   REGISTER FOR EVENT  (THIS IS THE FIXED ONE)
------------------------------------------------------------- */
router.post('/:id/register', async (req, res) => {
  console.log('\n=== REGISTRATION START ===');
  console.log('Event ID :', req.params.id);
  console.log('Payload  :', req.body);

  try {
    const { name, email, gender, age } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }

    // ---------- VALIDATIONS ----------
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    if (!email?.trim()) return res.status(400).json({ message: 'Email is required' });
    if (!gender) return res.status(400).json({ message: 'Gender is required' });
    if (!age) return res.status(400).json({ message: 'Age is required' });

    const emailLC = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLC)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ message: 'Gender must be Male, Female, or Other' });
    }

    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return res.status(400).json({ message: 'Age must be between 1 and 120' });
    }

    // ---------- DUPLICATE CHECK ----------
    const already = event.registeredUsers.some(u => u.email.toLowerCase() === emailLC);
    if (already) {
      console.log('Duplicate email →', emailLC);
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // ---------- UNIQUE referenceId ----------
    let referenceId;
    const maxTries = 10;
    let tries = 0;
    do {
      referenceId = `REF-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`;
      tries++;
    } while (
      event.registeredUsers.some(u => u.referenceId === referenceId) &&
      tries < maxTries
    );

    // ---------- PUSH REGISTRATION ----------
    const reg = {
      name: name.trim(),
      email: emailLC,
      gender,
      age: ageNum,
      registeredAt: new Date(),
      referenceId,
    };

    event.registeredUsers.push(reg);
    console.log('Pushing →', reg);

    await event.save();
    console.log('Saved! Total users →', event.registeredUsers.length);

    // ---------- RESPONSE ----------
    if (!event.isInHouse) {
      const redirect = `${event.organizerLink}?ref=${referenceId}`;
      console.log('Redirect →', redirect);
      return res.json({ message: 'Redirecting to organizer...', organizerLink: redirect });
    }

    console.log('In-house success');
    return res.json({
      message: 'Successfully registered for the event',
      registration: {
        name: reg.name,
        email: reg.email,
        referenceId,
        registeredAt: reg.registeredAt,
      },
    });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    return res
      .status(500)
      .json({ message: 'Failed to register for event', error: err.message });
  }
});

/* -------------------------------------------------------------
   GET EVENT DETAILS (registrations list)
------------------------------------------------------------- */
router.get('/:id/details', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('title registeredUsers');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const details = {
      title: event.title,
      registeredUsers: event.registeredUsers.map(r => ({
        name: r.name,
        email: r.email,
        gender: r.gender,
        age: r.age,
        registeredAt: r.registeredAt,
        referenceId: r.referenceId,
      })),
    };

    res.json({ message: 'Registration details retrieved successfully', registrationDetails: details });
  } catch (err) {
    console.error('DETAILS error:', err);
    res.status(500).json({ message: 'Failed to fetch event details', error: err.message });
  }
});

module.exports = router;