import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
        color: 'white',
        padding: '80px 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            Campus Event Platform
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Discover, register, and manage campus events in real-time
          </p>
          {isAuthenticated ? (
            <div className="d-flex gap-3 justify-content-center">
              <Link to="/events" className="btn btn-light btn-lg">
                Browse Events
              </Link>
              {user.role === 'student' && (
                <Link to="/my-registrations" className="btn btn-outline-light btn-lg">
                  My Registrations
                </Link>
              )}
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link to="/organizer/dashboard" className="btn btn-outline-light btn-lg">
                  Dashboard
                </Link>
              )}
            </div>
          ) : (
            <div className="d-flex gap-3 justify-content-center">
              <Link to="/register" className="btn btn-light btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              Why Choose Our Platform?
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
              Experience the future of campus event management with real-time updates and seamless registration
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: '#007bff', marginBottom: '1rem' }}>
                <FaCalendarAlt />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Easy Event Discovery</h3>
              <p style={{ color: '#666' }}>
                Browse through various campus events with detailed information, categories, and real-time availability.
              </p>
            </div>

            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: '#28a745', marginBottom: '1rem' }}>
                <FaUsers />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Real-time Updates</h3>
              <p style={{ color: '#666' }}>
                Get live attendee counts and instant notifications when new participants register for events.
              </p>
            </div>

            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: '#ffc107', marginBottom: '1rem' }}>
                <FaClock />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Quick Registration</h3>
              <p style={{ color: '#666' }}>
                Register for events with just a few clicks. Track your registration status in real-time.
              </p>
            </div>

            <div className="card text-center">
              <div style={{ fontSize: '3rem', color: '#dc3545', marginBottom: '1rem' }}>
                <FaMapMarkerAlt />
              </div>
              <h3 style={{ marginBottom: '1rem' }}>Organizer Dashboard</h3>
              <p style={{ color: '#666' }}>
                Event organizers can manage registrations, approve participants, and track event statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 0', background: '#f8f9fa' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              How It Works
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="text-center">
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#007bff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem'
              }}>
                1
              </div>
              <h4 style={{ marginBottom: '1rem' }}>Browse Events</h4>
              <p style={{ color: '#666' }}>
                Explore upcoming campus events by category, date, or location.
              </p>
            </div>

            <div className="text-center">
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#28a745',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem'
              }}>
                2
              </div>
              <h4 style={{ marginBottom: '1rem' }}>Register</h4>
              <p style={{ color: '#666' }}>
                Click register and provide any additional information required.
              </p>
            </div>

            <div className="text-center">
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#ffc107',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem'
              }}>
                3
              </div>
              <h4 style={{ marginBottom: '1rem' }}>Get Approved</h4>
              <p style={{ color: '#666' }}>
                Wait for organizer approval and receive real-time updates.
              </p>
            </div>

            <div className="text-center">
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#dc3545',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem'
              }}>
                4
              </div>
              <h4 style={{ marginBottom: '1rem' }}>Attend Event</h4>
              <p style={{ color: '#666' }}>
                Show up at the event location and enjoy the experience!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: '#007bff',
        color: 'white',
        padding: '60px 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousands of students already using our platform
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-light btn-lg">
              Create Account Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
