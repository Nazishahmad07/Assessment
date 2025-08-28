import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaUsers, 
  FaClock, 
  FaMapMarkerAlt,
  FaEdit,
  FaCog,
  FaEye,
  FaChartBar
} from 'react-icons/fa';
import { format } from 'date-fns';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: ''
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch events
      const eventsResponse = await eventService.getMyEvents(filters);
      setEvents(eventsResponse.events);
      setPagination(eventsResponse.pagination);

      // Fetch stats
      const statsResponse = await registrationService.getRegistrationStats();
      setStats(statsResponse);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', error);
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

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const registrationDeadline = new Date(event.registrationDeadline);

    if (!event.isActive) return { status: 'cancelled', color: 'danger' };
    if (event.status === 'completed') return { status: 'completed', color: 'secondary' };
    if (event.status === 'cancelled') return { status: 'cancelled', color: 'danger' };
    if (now > eventDate) return { status: 'completed', color: 'secondary' };
    if (now < registrationDeadline) return { status: 'upcoming', color: 'success' };
    if (now > registrationDeadline && now < eventDate) {
      return { status: 'registration closed', color: 'warning' };
    }
    return { status: event.status, color: 'primary' };
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
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Organizer Dashboard</h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Welcome back, {user.name}! Manage your events and registrations.
            </p>
          </div>
          <Link to="/organizer/events/create" className="btn btn-primary d-flex align-items-center gap-2">
            <FaPlus />
            Create Event
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div className="card text-center">
            <div style={{ fontSize: '2rem', color: '#007bff', marginBottom: '0.5rem' }}>
              <FaCalendarAlt />
            </div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.totalEvents}</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Events</p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '2rem', color: '#28a745', marginBottom: '0.5rem' }}>
              <FaUsers />
            </div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.totalRegistrations}</h3>
            <p style={{ color: '#666', margin: 0 }}>Total Registrations</p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '2rem', color: '#ffc107', marginBottom: '0.5rem' }}>
              <FaClock />
            </div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.pendingRegistrations}</h3>
            <p style={{ color: '#666', margin: 0 }}>Pending Approvals</p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '2rem', color: '#17a2b8', marginBottom: '0.5rem' }}>
              <FaChartBar />
            </div>
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stats.approvedRegistrations}</h3>
            <p style={{ color: '#666', margin: 0 }}>Approved Registrations</p>
          </div>
        </div>

        {/* Events Section */}
        <div className="card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ margin: 0 }}>My Events</h2>
            
            {/* Filters */}
            <div className="d-flex gap-2">
              <select
                className="form-select"
                style={{ width: 'auto' }}
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

          {events.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem 0' }}>
              <h3 style={{ color: '#666', marginBottom: '1rem' }}>No events found</h3>
              <p style={{ color: '#999', marginBottom: '2rem' }}>
                You haven't created any events yet.
              </p>
              <Link to="/organizer/events/create" className="btn btn-primary">
                Create Your First Event
              </Link>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {events.map(event => {
                  const eventStatus = getEventStatus(event);
                  
                  return (
                    <div key={event._id} className="card" style={{ background: '#f8f9fa' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                        <div>
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <h3 style={{ fontSize: '1.3rem', margin: 0 }}>
                              {event.title}
                            </h3>
                            <span className={`badge badge-${eventStatus.color}`}>
                              {eventStatus.status}
                            </span>
                            <span className="badge badge-primary">
                              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
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
                                {format(new Date(event.date), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            
                            <div className="d-flex align-items-center gap-2">
                              <FaClock style={{ color: '#28a745' }} />
                              <span style={{ fontSize: '0.9rem' }}>{event.time}</span>
                            </div>
                            
                            <div className="d-flex align-items-center gap-2">
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

                          <p style={{ 
                            color: '#666', 
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {event.description}
                          </p>
                        </div>

                        <div className="d-flex flex-column gap-2">
                          <Link 
                            to={`/events/${event._id}`}
                            className="btn btn-secondary btn-sm d-flex align-items-center gap-2"
                          >
                            <FaEye />
                            View
                          </Link>
                          
                          <Link 
                            to={`/organizer/events/${event._id}/edit`}
                            className="btn btn-warning btn-sm d-flex align-items-center gap-2"
                          >
                            <FaEdit />
                            Edit
                          </Link>
                          
                          <Link 
                            to={`/organizer/events/${event._id}/registrations`}
                            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                          >
                            <FaCog />
                            Manage
                          </Link>
                        </div>
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
    </div>
  );
};

export default OrganizerDashboard;
