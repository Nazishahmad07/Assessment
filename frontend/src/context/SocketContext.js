import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          userId: user.id,
          userRole: user.role
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const joinEventRoom = (eventId) => {
    if (socket && connected) {
      socket.emit('join-event', eventId);
    }
  };

  const leaveEventRoom = (eventId) => {
    if (socket && connected) {
      socket.emit('leave-event', eventId);
    }
  };

  const onEventUpdate = (callback) => {
    if (socket) {
      socket.on('event-updated', callback);
      socket.on('event-created', callback);
      socket.on('event-deleted', callback);
      socket.on('event-status-updated', callback);
    }
  };

  const onRegistrationUpdate = (callback) => {
    if (socket) {
      socket.on('new-registration', callback);
      socket.on('registration-approved', callback);
      socket.on('registration-rejected', callback);
      socket.on('registration-cancelled', callback);
    }
  };

  const offEventUpdate = () => {
    if (socket) {
      socket.off('event-updated');
      socket.off('event-created');
      socket.off('event-deleted');
      socket.off('event-status-updated');
    }
  };

  const offRegistrationUpdate = () => {
    if (socket) {
      socket.off('new-registration');
      socket.off('registration-approved');
      socket.off('registration-rejected');
      socket.off('registration-cancelled');
    }
  };

  const value = {
    socket,
    connected,
    joinEventRoom,
    leaveEventRoom,
    onEventUpdate,
    onRegistrationUpdate,
    offEventUpdate,
    offRegistrationUpdate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
