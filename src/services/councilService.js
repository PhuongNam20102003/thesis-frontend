import api from './api';

export const getOverview = () =>
  api.get('/council/overview');

export const getCouncilList = () =>
  api.get('/council/list');

// Gửi cả 3 vai trò cùng lúc
export const assignAllRoles = (topic_id, { reviewer_id, chairman_id, secretary_id }) =>   
  api.post('/council/assign', { topic_id, reviewer_id, chairman_id, secretary_id });