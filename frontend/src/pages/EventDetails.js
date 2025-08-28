import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaClock, 
  FaUser,
  FaArrowLeft,
  FaEdit,
  FaCog
} from 'react-icons/fa';
import { format, isAfter, isBefore } from 'date-fns';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { joinEventRoom, leaveEventRoom, onRegistrationUpdate } = useSocket();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');

  useEffect(() => {
    fetchEvent();
    
    // Join event room for real-time updates
    joinEventRoom(id);

    return () => {
      leaveEventRoom(id);
    };
  }, [id, joinEventRoom, leaveEventRoom]);

  useEffect(() => {
    const handleRegistrationUpdate = (data) => {
      if (data.eventId === id) {
        // Update attendee count
        setEvent(prev => ({
          ...prev,
          currentAttendees: data.attendeeCount
        }));

        // If it's a user's registration update
        if (data.registration && data.registration.user._id === user?.id) {
          setUserRegistration(data.registration);
        }
      }
    };

    onRegistrationUpdate(handleRegistrationUpdate);

    return () => {
      // Cleanup will be handled by the context
    };
  }, [id, user, onRegistrationUpdate]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const eventData = await eventService.getEvent(id);
      setEvent(eventData);

      // Check if user has already registered
      if (isAuthenticated && user.role === 'student') {
        try {
          const registrations = await registrationService.getMyRegistrations();
          const existingRegistration = registrations.registrations.find(
            reg => reg.event._id === id
          );
          setUserRegistration(existingRegistration);
        } catch (error) {
          // User might not have any registrations yet
        }
      }
    } catch (error) {
      toast.error('Failed to fetch event details');
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for events');
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      toast.error('Only students can register for events');
      return;
    }

    try {
      setRegistering(true);
      const result = await registrationService.registerForEvent(id, additionalInfo);
      setUserRegistration(result.registration);
      toast.success('Registration successful! Waiting for organizer approval.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!userRegistration) return;

    try {
      await registrationService.cancelRegistration(userRegistration._id);
      setUserRegistration(null);
      toast.success('Registration cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const getEventStatus = () => {
    if (!event) return { status: 'loading', color: 'secondary' };
    
    const now = new Date();
    const eventDate = new Date(event.date);
    const registrationDeadline = new Date(event.registrationDeadline);

    if (!event.isActive) return { status: 'Cancelled', color: 'danger' };
    if (event.status === 'completed') return { status: 'Completed', color: 'secondary' };
    if (event.status === 'cancelled') return { status: 'Cancelled', color: 'danger' };
    if (isAfter(now, eventDate)) return { status: 'Completed', color: 'secondary' };
    if (isBefore(now, registrationDeadline)) return { status: 'Registration Open', color: 'success' };
    if (isAfter(now, registrationDeadline) && isBefore(now, eventDate)) {
      return { status: 'Registration Closed', color: 'warning' };
    }
    return { status: event.status, color: 'primary' };
  };

  const canRegister = () => {
    if (!event || !isAuthenticated || user.role !== 'student') return false;
    if (userRegistration) return false;
    if (!event.isActive) return false;
    if (event.isFull) return false;
    
    const now = new Date();
    const registrationDeadline = new Date(event.registrationDeadline);
    return isBefore(now, registrationDeadline);
  };

  const canManageEvent = () => {
    if (!event || !isAuthenticated) return false;
    return event.organizer._id === user.id || user.role === 'admin';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="text-center">
          <h2>Event not found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <button className="btn btn-primary" onClick={() => navigate('/events')}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus();

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <div className="mb-4">
          <button 
            className="btn btn-secondary d-flex align-items-center gap-2"
            onClick={() => navigate('/events')}
          >
            <FaArrowLeft />
            Back to Events
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Content */}
          <div>
            <div className="card">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {event.title}
                  </h1>
                  <div className="d-flex align-items-center gap-3">
                    <span className={`badge badge-${eventStatus.color}`}>
                      {eventStatus.status}
                    </span>
                    <span className="badge badge-primary">
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>
                  </div>
                </div>
                
                {canManageEvent() && (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-secondary btn-sm d-flex align-items-center gap-2"
                      onClick={() => navigate(`/organizer/events/${id}/edit`)}
                    >
                      <FaEdit />
                      Edit
                    </button>
                    <button 
                      className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                      onClick={() => navigate(`/organizer/events/${id}/registrations`)}
                    >
                      <FaCog />
                      Manage
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Event Description</h3>
                <p style={{ lineHeight: '1.6', color: '#555' }}>
                  {event.description}
                </p>
              </div>

              {event.requirements && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Requirements</h3>
                  <p style={{ lineHeight: '1.6', color: '#555' }}>
                    {event.requirements}
                  </p>
                </div>
              )}

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                <div className="d-flex align-items-center gap-3">
                  <FaCalendarAlt style={{ color: '#007bff', fontSize: '1.2rem' }} />
                  <div>
                    <div style={{ fontWeight: '500' }}>Date</div>
                    <div style={{ color: '#666' }}>
                      {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <FaClock style={{ color: '#28a745', fontSize: '1.2rem' }} />
                  <div>
                    <div style={{ fontWeight: '500' }}>Time</div>
                    <div style={{ color: '#666' }}>{event.time}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <FaMapMarkerAlt style={{ color: '#dc3545', fontSize: '1.2rem' }} />
                  <div>
                    <div style={{ fontWeight: '500' }}>Location</div>
                    <div style={{ color: '#666' }}>{event.location}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <FaUsers style={{ color: '#ffc107', fontSize: '1.2rem' }} />
                  <div>
                    <div style={{ fontWeight: '500' }}>Capacity</div>
                    <div style={{ color: '#666' }}>
                      {event.currentAttendees} / {event.maxAttendees} attendees
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Event Organizer</h3>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#007bff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  <FaUser />
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{event.organizer.name}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {event.organizer.email}
                  </div>
                </div>
              </div>

              {isAuthenticated && user.role === 'student' && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  {userRegistration ? (
                    <div>
                      <h4 style={{ marginBottom: '1rem' }}>Your Registration</h4>
                      <div className="mb-3">
                        <span className={`badge badge-${
                          userRegistration.status === 'approved' ? 'success' :
                          userRegistration.status === 'rejected' ? 'danger' :
                          'warning'
                        }`}>
                          {userRegistration.status.charAt(0).toUpperCase() + userRegistration.status.slice(1)}
                        </span>
                      </div>
                      
                      {userRegistration.status === 'rejected' && userRegistration.rejectionReason && (
                        <div className="alert alert-danger">
                          <strong>Reason:</strong> {userRegistration.rejectionReason}
                        </div>
                      )}
                      
                      {userRegistration.status === 'pending' && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={handleCancelRegistration}
                        >
                          Cancel Registration
                        </button>
                      )}
                    </div>
                  ) : canRegister() ? (
                    <div>
                      <h4 style={{ marginBottom: '1rem' }}>Register for Event</h4>
                      <div className="form-group">
                        <label className="form-label">Additional Information (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                          placeholder="Any additional information you'd like to share..."
                        />
                      </div>
                      <button 
                        className="btn btn-success"
                        onClick={handleRegister}
                        disabled={registering}
                        style={{ width: '100%' }}
                      >
                        {registering ? 'Registering...' : 'Register Now'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ marginBottom: '1rem' }}>Registration</h4>
                      {!isAuthenticated ? (
                        <div className="alert alert-info">
                          Please login to register for this event.
                        </div>
                      ) : event.isFull ? (
                        <div className="alert alert-warning">
                          This event is full.
                        </div>
                      ) : !event.isActive ? (
                        <div className="alert alert-danger">
                          This event has been cancelled.
                        </div>
                      ) : (
                        <div className="alert alert-warning">
                          Registration deadline has passed.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <div className="alert alert-info">
                    <strong>Login Required</strong><br />
                    Please login to register for this event.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
