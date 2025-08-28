const express = require('express');
const { body, validationResult } = require('express-validator');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { authenticateToken, requireOrganizerOrAdmin, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/registrations
// @desc    Register for an event
// @access  Private (Student)
router.post('/', authenticateToken, [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('additionalInfo').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, additionalInfo } = req.body;

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can register for events' });
    }

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isActive) {
      return res.status(400).json({ message: 'Event is not active' });
    }

    // Check if registration is still open
    if (!event.isRegistrationOpen) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if event is full
    if (event.isFull) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user already registered
    const existingRegistration = await Registration.findOne({
      event: eventId,
      user: req.user._id
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'You are already registered for this event',
        status: existingRegistration.status
      });
    }

    // Create registration
    const registration = new Registration({
      event: eventId,
      user: req.user._id,
      additionalInfo
    });

    await registration.save();
    await registration.populate([
      { path: 'event', select: 'title date location' },
      { path: 'user', select: 'name email studentId department' }
    ]);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`event-${eventId}`).emit('new-registration', {
      eventId,
      registration,
      attendeeCount: event.currentAttendees + 1
    });

    res.status(201).json({
      message: 'Registration successful',
      registration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/registrations/my-registrations
// @desc    Get current user's registrations
// @access  Private
router.get('/my-registrations', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const registrations = await Registration.find(filter)
      .populate({
        path: 'event',
        select: 'title description date time location category maxAttendees currentAttendees status'
      })
      .populate('approvedBy', 'name')
      .sort({ registrationDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Registration.countDocuments(filter);

    res.json({
      registrations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/registrations/:id
// @desc    Cancel registration
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user owns this registration or is admin
    if (registration.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this registration' });
    }

    // Check if registration can be cancelled
    if (registration.status === 'approved') {
      return res.status(400).json({ message: 'Cannot cancel approved registration. Contact organizer.' });
    }

    await Registration.findByIdAndDelete(req.params.id);

    // Get updated event info
    const event = await Event.findById(registration.event);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`event-${registration.event}`).emit('registration-cancelled', {
      eventId: registration.event,
      attendeeCount: event ? event.currentAttendees : 0
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/registrations/event/:eventId
// @desc    Get all registrations for an event (Organizer/Admin only)
// @access  Private (Organizer/Admin)
router.get('/event/:eventId', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view registrations for this event' });
    }

    const filter = { event: eventId };
    if (status) filter.status = status;

    const registrations = await Registration.find(filter)
      .populate('user', 'name email studentId department phone')
      .populate('approvedBy', 'name')
      .sort({ registrationDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Registration.countDocuments(filter);

    res.json({
      event: {
        id: event._id,
        title: event.title,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees
      },
      registrations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/registrations/:id/approve
// @desc    Approve registration
// @access  Private (Organizer/Admin)
router.put('/:id/approve', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email studentId department');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user is the organizer or admin
    if (registration.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to approve this registration' });
    }

    // Check if event is full
    if (registration.event.isFull) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if registration is already approved
    if (registration.status === 'approved') {
      return res.status(400).json({ message: 'Registration is already approved' });
    }

    // Update registration
    registration.status = 'approved';
    registration.approvedBy = req.user._id;
    registration.approvedDate = new Date();
    await registration.save();

    // Update event attendee count
    const event = await Event.findById(registration.event._id);
    event.currentAttendees = await Registration.countDocuments({
      event: registration.event._id,
      status: 'approved'
    });
    await event.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`event-${registration.event._id}`).emit('registration-approved', {
      eventId: registration.event._id,
      registration,
      attendeeCount: event.currentAttendees
    });

    res.json({
      message: 'Registration approved successfully',
      registration
    });
  } catch (error) {
    console.error('Approve registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/registrations/:id/reject
// @desc    Reject registration
// @access  Private (Organizer/Admin)
router.put('/:id/reject', authenticateToken, requireOrganizerOrAdmin, [
  body('rejectionReason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email studentId department');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user is the organizer or admin
    if (registration.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reject this registration' });
    }

    // Check if registration is already rejected
    if (registration.status === 'rejected') {
      return res.status(400).json({ message: 'Registration is already rejected' });
    }

    // Update registration
    registration.status = 'rejected';
    registration.approvedBy = req.user._id;
    registration.approvedDate = new Date();
    registration.rejectionReason = req.body.rejectionReason || '';
    await registration.save();

    // Update event attendee count
    const event = await Event.findById(registration.event._id);
    event.currentAttendees = await Registration.countDocuments({
      event: registration.event._id,
      status: 'approved'
    });
    await event.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`event-${registration.event._id}`).emit('registration-rejected', {
      eventId: registration.event._id,
      registration,
      attendeeCount: event.currentAttendees
    });

    res.json({
      message: 'Registration rejected successfully',
      registration
    });
  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/registrations/organizer/stats
// @desc    Get registration statistics for organizer's events
// @access  Private (Organizer/Admin)
router.get('/organizer/stats', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    // Get all events created by this organizer
    const organizerEvents = await Event.find({ organizer: req.user._id }).select('_id');
    const eventIds = organizerEvents.map(event => event._id);

    if (eventIds.length === 0) {
      return res.json({
        totalEvents: 0,
        totalRegistrations: 0,
        pendingRegistrations: 0,
        approvedRegistrations: 0,
        rejectedRegistrations: 0
      });
    }

    const totalRegistrations = await Registration.countDocuments({ event: { $in: eventIds } });
    const approvedRegistrations = await Registration.countDocuments({ 
      event: { $in: eventIds }, 
      status: 'approved' 
    });
    const pendingRegistrations = await Registration.countDocuments({ 
      event: { $in: eventIds }, 
      status: 'pending' 
    });
    const rejectedRegistrations = await Registration.countDocuments({ 
      event: { $in: eventIds }, 
      status: 'rejected' 
    });

    res.json({
      totalEvents: eventIds.length,
      totalRegistrations,
      approvedRegistrations,
      pendingRegistrations,
      rejectedRegistrations
    });
  } catch (error) {
    console.error('Get organizer registration stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/registrations/stats
// @desc    Get registration statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    const approvedRegistrations = await Registration.countDocuments({ status: 'approved' });
    const pendingRegistrations = await Registration.countDocuments({ status: 'pending' });
    const rejectedRegistrations = await Registration.countDocuments({ status: 'rejected' });

    const registrationsByCategory = await Registration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $group: {
          _id: '$event.category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalRegistrations,
      approvedRegistrations,
      pendingRegistrations,
      rejectedRegistrations,
      registrationsByCategory
    });
  } catch (error) {
    console.error('Get registration stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
