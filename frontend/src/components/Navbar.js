import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar" style={{
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Campus Events
          </Link>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/events" className="btn btn-secondary">
                  Events
                </Link>
                
                {user.role === 'student' && (
                  <Link to="/my-registrations" className="btn btn-secondary">
                    My Registrations
                  </Link>
                )}
                
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <Link to="/organizer/dashboard" className="btn btn-secondary">
                    Dashboard
                  </Link>
                )}

                <div className="dropdown" style={{ position: 'relative' }}>
                  <button 
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={toggleMenu}
                    style={{ background: 'none', border: 'none', color: '#007bff' }}
                  >
                    <FaUser />
                    {user.name}
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                  </button>
                  
                  {isMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      minWidth: '200px',
                      zIndex: 1001
                    }}>
                      <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{user.email}</div>
                        <div style={{ fontSize: '0.8rem', color: '#007bff' }}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          border: 'none',
                          background: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <FaSignOutAlt />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
