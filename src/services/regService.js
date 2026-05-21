import api from './api';

export const registerTopic = (topic_id) =>
  api.post('/registrations', { topic_id });

export const getMyRegistration = () =>
  api.get('/registrations/my');

export const cancelRegistration = () =>
  api.delete('/registrations/my');

export const getPendingRegs = () =>
  api.get('/registrations/pending');

export const getTopicRegistrations = () =>
  api.get('/registrations/pending');

export const updateRegStatus = (id, status) =>
  api.patch(`/registrations/${id}/status`, { status });