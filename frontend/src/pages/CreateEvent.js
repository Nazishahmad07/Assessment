import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    category: 'academic',
    requirements: '',
    registrationDeadline: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert form data to proper types
      const eventData = {
        ...formData,
        maxAttendees: parseInt(formData.maxAttendees),
        date: new Date(formData.date).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString()
      };

      const result = await eventService.createEvent(eventData);
      toast.success('Event created successfully!');
      navigate('/organizer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    return today.toISOString().split('T')[0];
  };

  const getMinRegistrationDeadline = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <div className="mb-4">
          <button 
            className="btn btn-secondary d-flex align-items-center gap-2"
            onClick={() => navigate('/organizer/dashboard')}
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <div className="text-center mb-4">
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create New Event</h1>
              <p style={{ color: '#666' }}>Fill in the details to create your event</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">Event Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter event title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category *</label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="academic">Academic</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                    <option value="technical">Technical</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your event in detail"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="date" className="form-label">Event Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleChange}
                    min={getMinDate()}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time" className="form-label">Event Time *</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    className="form-control"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="location" className="form-label">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Enter event location"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxAttendees" className="form-label">Maximum Attendees *</label>
                  <input
                    type="number"
                    id="maxAttendees"
                    name="maxAttendees"
                    className="form-control"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    min="1"
                    required
                    placeholder="Enter maximum attendees"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="registrationDeadline" className="form-label">Registration Deadline *</label>
                <input
                  type="date"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  className="form-control"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  min={getMinRegistrationDeadline()}
                  max={formData.date || ''}
                  required
                />
                <small style={{ color: '#666' }}>
                  Registration deadline must be before the event date
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="requirements" className="form-label">Requirements (Optional)</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  className="form-control"
                  rows="3"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Any special requirements for participants"
                />
              </div>

              <div className="d-flex gap-3 justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/organizer/dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  <FaSave />
                  {loading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
