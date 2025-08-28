import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaSearch } from 'react-icons/fa';
import { format, isAfter, isBefore } from 'date-fns';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: '',
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({});
  const { onEventUpdate } = useSocket();

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  useEffect(() => {
    const handleEventUpdate = (updatedEvent) => {
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === updatedEvent._id ? updatedEvent : event
        )
      );
    };

    onEventUpdate(handleEventUpdate);

    return () => {
      // Cleanup will be handled by the context
    };
  }, [onEventUpdate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents(filters);
      setEvents(response.events);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const registrationDeadline = new Date(event.registrationDeadline);

    if (!event.isActive) return { status: 'cancelled', color: 'danger' };
    if (event.status === 'completed') return { status: 'completed', color: 'secondary' };
    if (event.status === 'cancelled') return { status: 'cancelled', color: 'danger' };
    if (isAfter(now, eventDate)) return { status: 'completed', color: 'secondary' };
    if (isBefore(now, registrationDeadline)) return { status: 'upcoming', color: 'success' };
    if (isAfter(now, registrationDeadline) && isBefore(now, eventDate)) {
      return { status: 'registration closed', color: 'warning' };
    }
    return { status: event.status, color: 'primary' };
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'primary',
      sports: 'success',
      cultural: 'warning',
      technical: 'info',
      social: 'secondary',
      other: 'dark'
    };
    return colors[category] || 'secondary';
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
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Campus Events</h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Discover and register for exciting campus events
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Search Events</label>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{ 
                  position: 'absolute', 
                  left: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#666' 
                }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  style={{ paddingLeft: '35px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="technical">Technical</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 0' }}>
            <h3 style={{ color: '#666', marginBottom: '1rem' }}>No events found</h3>
            <p style={{ color: '#999' }}>Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {events.map(event => {
                const eventStatus = getEventStatus(event);
                const categoryColor = getCategoryColor(event.category);
                
                return (
                  <div key={event._id} className="card" style={{ height: '100%' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className={`badge badge-${categoryColor}`}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>
                      <span className={`badge badge-${eventStatus.color}`}>
                        {eventStatus.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', lineHeight: '1.3' }}>
                      {event.title}
                    </h3>

                    <p style={{ 
                      color: '#666', 
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {event.description}
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaCalendarAlt style={{ color: '#007bff' }} />
                        <span style={{ fontSize: '0.9rem' }}>
                          {format(new Date(event.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaClock style={{ color: '#28a745' }} />
                        <span style={{ fontSize: '0.9rem' }}>{event.time}</span>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaMapMarkerAlt style={{ color: '#dc3545' }} />
                        <span style={{ fontSize: '0.9rem' }}>{event.location}</span>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2">
                        <FaUsers style={{ color: '#ffc107' }} />
                        <span style={{ fontSize: '0.9rem' }}>
                          {event.currentAttendees} / {event.maxAttendees} attendees
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small style={{ color: '#666' }}>
                          Organizer: {event.organizer.name}
                        </small>
                      </div>
                      <Link 
                        to={`/events/${event._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </button>
                
                <span className="d-flex align-items-center px-3">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
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

export default Events;
