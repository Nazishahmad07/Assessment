import api from './api';

export const registrationService = {
  registerForEvent: async (eventId, additionalInfo = '') => {
    const response = await api.post('/registrations', { 
      eventId, 
      additionalInfo 
    });
    return response.data;
  },

  getMyRegistrations: async (params = {}) => {
    const response = await api.get('/registrations/my-registrations', { params });
    return response.data;
  },

  cancelRegistration: async (registrationId) => {
    const response = await api.delete(`/registrations/${registrationId}`);
    return response.data;
  },

  getEventRegistrations: async (eventId, params = {}) => {
    const response = await api.get(`/registrations/event/${eventId}`, { params });
    return response.data;
  },

  approveRegistration: async (registrationId) => {
    const response = await api.put(`/registrations/${registrationId}/approve`);
    return response.data;
  },

  rejectRegistration: async (registrationId, rejectionReason = '') => {
    const response = await api.put(`/registrations/${registrationId}/reject`, {
      rejectionReason
    });
    return response.data;
  },

  getRegistrationStats: async () => {
    const response = await api.get('/registrations/organizer/stats');
    return response.data;
  }
};
