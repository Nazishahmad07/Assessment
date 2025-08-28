const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  additionalInfo: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure one registration per user per event
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Pre-save middleware to update event attendee count
registrationSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('status')) {
    const Event = mongoose.model('Event');
    const event = await Event.findById(this.event);
    
    if (event) {
      // Count approved registrations
      const approvedCount = await mongoose.model('Registration').countDocuments({
        event: this.event,
        status: 'approved'
      });
      
      event.currentAttendees = approvedCount;
      await event.save();
    }
  }
  next();
});

// Pre-remove middleware to update event attendee count
registrationSchema.pre('remove', async function(next) {
  const Event = mongoose.model('Event');
  const event = await Event.findById(this.event);
  
  if (event) {
    // Count approved registrations
    const approvedCount = await mongoose.model('Registration').countDocuments({
      event: this.event,
      status: 'approved'
    });
    
    event.currentAttendees = approvedCount;
    await event.save();
  }
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
