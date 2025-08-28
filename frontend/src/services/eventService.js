import api from './api';

export const eventService = {
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  updateEventStatus: async (id, status) => {
    const response = await api.put(`/events/${id}/status`, { status });
    return response.data;
  },

  getMyEvents: async (params = {}) => {
    const response = await api.get('/events/organizer/my-events', { params });
    return response.data;
  }
};
