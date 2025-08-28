import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationService } from '../services/registrationService';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers,
  FaEye,
  FaTimes
} from 'react-icons/fa';
import { format } from 'date-fns';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: ''
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchRegistrations();
  }, [filters]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationService.getMyRegistrations(filters);
      setRegistrations(response.registrations);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch registrations');
      console.error('Error fetching registrations:', error);
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

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    try {
      await registrationService.cancelRegistration(registrationId);
      toast.success('Registration cancelled successfully');
      fetchRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel registration');
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
      case 'approved': return '✓';
      case 'rejected': return '✗';
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

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <div className="text-center mb-5">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>My Registrations</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Track your event registrations and their status
          </p>
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
            <p style={{ color: '#999', marginBottom: '2rem' }}>
              You haven't registered for any events yet.
            </p>
            <Link to="/events" className="btn btn-primary">
              Browse Events
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {registrations.map(registration => (
                <div key={registration._id} className="card">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                    <div>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <h3 style={{ fontSize: '1.3rem', margin: 0 }}>
                          {registration.event.title}
                        </h3>
                        <span className={`badge badge-${getStatusColor(registration.status)}`}>
                          {getStatusIcon(registration.status)} {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </span>
                      </div>

                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div className="d-flex align-items-center gap-2">
                          <FaCalendarAlt style={{ color: '#007bff' }} />
                          <span style={{ fontSize: '0.9rem' }}>
                            {format(new Date(registration.event.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                          <FaClock style={{ color: '#28a745' }} />
                          <span style={{ fontSize: '0.9rem' }}>{registration.event.time}</span>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                          <FaMapMarkerAlt style={{ color: '#dc3545' }} />
                          <span style={{ fontSize: '0.9rem' }}>{registration.event.location}</span>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                          <FaUsers style={{ color: '#ffc107' }} />
                          <span style={{ fontSize: '0.9rem' }}>
                            {registration.event.currentAttendees} / {registration.event.maxAttendees} attendees
                          </span>
                        </div>
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
                            <strong>Reason:</strong> {registration.rejectionReason}
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
                      <Link 
                        to={`/events/${registration.event._id}`}
                        className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                      >
                        <FaEye />
                        View Event
                      </Link>
                      
                      {registration.status === 'pending' && (
                        <button 
                          className="btn btn-danger btn-sm d-flex align-items-center gap-2"
                          onClick={() => handleCancelRegistration(registration._id)}
                        >
                          <FaTimes />
                          Cancel
                        </button>
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

export default MyRegistrations;
