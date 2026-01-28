import apiRequest from './api';

export const fetchIdeas = async () => {
  return await apiRequest('/api/ideas');
};

export const createIdea = async (ideaData) => {
  return await apiRequest('/api/ideas', {
    method: 'POST',
    body: JSON.stringify(ideaData),
  });
};

export const fetchMyIdeas = async () => {
  return await apiRequest('/api/ideas/my');
};
