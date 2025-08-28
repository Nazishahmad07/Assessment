import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registrationService } from '../services/registrationService';
import { eventService } from '../services/eventService';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaCheck, 
  FaTimes, 
  FaUser, 
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaBuilding
} from 'react-icons/fa';
import { format } from 'date-fns';

const EventRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onRegistrationUpdate } = useSocket();
  
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: ''
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchData();
    
    // Listen for real-time updates
    const handleRegistrationUpdate = (data) => {
      if (data.eventId === id) {
        // Update attendee count
        setEvent(prev => ({
          ...prev,
          currentAttendees: data.attendeeCount
        }));

        // Update specific registration if provided
        if (data.registration) {
          setRegistrations(prev => 
            prev.map(reg => 
              reg._id === data.registration._id ? data.registration : reg
            )
          );
        }
      }
    };

    onRegistrationUpdate(handleRegistrationUpdate);

    return () => {
      // Cleanup will be handled by the context
    };
  }, [id, onRegistrationUpdate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch event details
      const eventData = await eventService.getEvent(id);
      setEvent(eventData);

      // Fetch registrations
      const registrationsResponse = await registrationService.getEventRegistrations(id, filters);
      setRegistrations(registrationsResponse.registrations);
      setPagination(registrationsResponse.pagination);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleApprove = async (registrationId) => {
    try {
      setProcessing(registrationId);
      await registrationService.approveRegistration(registrationId);
      toast.success('Registration approved successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve registration');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (registrationId) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    try {
      setProcessing(registrationId);
      await registrationService.rejectRegistration(registrationId, reason);
      toast.success('Registration rejected successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject registration');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheck />;
      case 'rejected': return <FaTimes />;
      case 'pending': return '⏳';
      case 'cancelled': return '⊘';
      default: return '?';
    }
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
          <button className="btn btn-primary" onClick={() => navigate('/organizer/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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

        {/* Event Info */}
        <div className="card mb-4">
          <h2 style={{ marginBottom: '1rem' }}>{event.title}</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            <div className="d-flex align-items-center gap-2">
              <FaCalendarAlt style={{ color: '#007bff' }} />
              <span>{format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <FaUser style={{ color: '#28a745' }} />
              <span>{event.currentAttendees} / {event.maxAttendees} attendees</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Registrations List */}
        {registrations.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 0' }}>
            <h3 style={{ color: '#666', marginBottom: '1rem' }}>No registrations found</h3>
            <p style={{ color: '#999' }}>No one has registered for this event yet.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {registrations.map(registration => (
                <div key={registration._id} className="card">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                    <div>
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
                          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                            {registration.user.name}
                          </h3>
                          <span className={`badge badge-${getStatusColor(registration.status)}`}>
                            {getStatusIcon(registration.status)} {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div className="d-flex align-items-center gap-2">
                          <FaEnvelope style={{ color: '#007bff' }} />
                          <span style={{ fontSize: '0.9rem' }}>{registration.user.email}</span>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                          <FaPhone style={{ color: '#28a745' }} />
                          <span style={{ fontSize: '0.9rem' }}>{registration.user.phone}</span>
                        </div>
                        
                        {registration.user.studentId && (
                          <div className="d-flex align-items-center gap-2">
                            <FaIdCard style={{ color: '#ffc107' }} />
                            <span style={{ fontSize: '0.9rem' }}>{registration.user.studentId}</span>
                          </div>
                        )}
                        
                        {registration.user.department && (
                          <div className="d-flex align-items-center gap-2">
                            <FaBuilding style={{ color: '#dc3545' }} />
                            <span style={{ fontSize: '0.9rem' }}>{registration.user.department}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        <div>Registered: {format(new Date(registration.registrationDate), 'MMM dd, yyyy HH:mm')}</div>
                        {registration.approvedBy && (
                          <div>
                            {registration.status === 'approved' ? 'Approved' : 'Rejected'} by: {registration.approvedBy.name}
                          </div>
                        )}
                        {registration.approvedDate && (
                          <div>
                            {registration.status === 'approved' ? 'Approved' : 'Rejected'} on: {format(new Date(registration.approvedDate), 'MMM dd, yyyy HH:mm')}
                          </div>
                        )}
                        {registration.rejectionReason && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <strong>Rejection Reason:</strong> {registration.rejectionReason}
                          </div>
                        )}
                        {registration.additionalInfo && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <strong>Additional Info:</strong> {registration.additionalInfo}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {registration.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm d-flex align-items-center gap-2"
                            onClick={() => handleApprove(registration._id)}
                            disabled={processing === registration._id}
                          >
                            <FaCheck />
                            {processing === registration._id ? 'Processing...' : 'Approve'}
                          </button>
                          
                          <button 
                            className="btn btn-danger btn-sm d-flex align-items-center gap-2"
                            onClick={() => handleReject(registration._id)}
                            disabled={processing === registration._id}
                          >
                            <FaTimes />
                            {processing === registration._id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </button>
                
                <span className="d-flex align-items-center px-3">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  className="btn btn-secondary"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNext}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventRegistrations;
