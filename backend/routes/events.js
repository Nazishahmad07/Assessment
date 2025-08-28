const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { authenticateToken, requireOrganizerOrAdmin, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const status = req.query.status;
    const search = req.query.search;

    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Organizer/Admin)
router.post('/', authenticateToken, requireOrganizerOrAdmin, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('maxAttendees').isInt({ min: 1 }).withMessage('Max attendees must be at least 1'),
  body('category').isIn(['academic', 'sports', 'cultural', 'technical', 'social', 'other']).withMessage('Invalid category'),
  body('registrationDeadline').isISO8601().withMessage('Please provide a valid registration deadline')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      date,
      time,
      location,
      maxAttendees,
      category,
      image,
      requirements,
      registrationDeadline
    } = req.body;

    // Check if registration deadline is before event date
    if (new Date(registrationDeadline) >= new Date(date)) {
      return res.status(400).json({ message: 'Registration deadline must be before event date' });
    }

    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      maxAttendees,
      category,
      image,
      requirements,
      registrationDeadline,
      organizer: req.user._id
    });

    await event.save();
    await event.populate('organizer', 'name email');

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-created', event);

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Organizer/Admin)
router.put('/:id', authenticateToken, requireOrganizerOrAdmin, [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date'),
  body('time').optional().notEmpty().withMessage('Time is required'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('maxAttendees').optional().isInt({ min: 1 }).withMessage('Max attendees must be at least 1'),
  body('category').optional().isIn(['academic', 'sports', 'cultural', 'technical', 'social', 'other']).withMessage('Invalid category'),
  body('registrationDeadline').optional().isISO8601().withMessage('Please provide a valid registration deadline')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updateData = req.body;

    // Validate registration deadline if provided
    if (updateData.registrationDeadline && updateData.date) {
      if (new Date(updateData.registrationDeadline) >= new Date(updateData.date)) {
        return res.status(400).json({ message: 'Registration deadline must be before event date' });
      }
    } else if (updateData.registrationDeadline) {
      if (new Date(updateData.registrationDeadline) >= new Date(event.date)) {
        return res.status(400).json({ message: 'Registration deadline must be before event date' });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-updated', updatedEvent);

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Organizer/Admin)
router.delete('/:id', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Check if there are any registrations
    const registrationsCount = await Registration.countDocuments({ event: req.params.id });
    if (registrationsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete event with existing registrations. Deactivate instead.' 
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-deleted', { eventId: req.params.id });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id/status
// @desc    Update event status
// @access  Private (Organizer/Admin)
router.put('/:id/status', authenticateToken, requireOrganizerOrAdmin, [
  body('status').isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('organizer', 'name email');

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-status-updated', updatedEvent);

    res.json({
      message: 'Event status updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/organizer/my-events
// @desc    Get events created by current organizer
// @access  Private (Organizer/Admin)
router.get('/organizer/my-events', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const filter = { organizer: req.user._id };
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
