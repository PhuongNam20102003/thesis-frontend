import api from './api';

export const getAllTopics = (params) =>
  api.get('/topics', { params }); // params: { field, teacher_id, search }

export const getMyTopics = () =>
  api.get('/topics/my');

export const getTeachers = () =>
  api.get('/topics/teachers');

export const createTopic = (data) =>
  api.post('/topics', data);

export const deleteTopic = (id) =>
  api.delete(`/topics/${id}`);

export const updateTopic = (id, data) =>
  api.put(`/topics/${id}`, data);

export const getPendingTopics = () =>
  api.get('/topics/pending');

export const approveOrRejectTopic = (id, status) =>
  api.patch(`/topics/${id}/status`, { status });