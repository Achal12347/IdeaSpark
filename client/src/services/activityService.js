import api from './api';

export const fetchUserActivity = async () => {
  try {
    const response = await api.get('/activity');
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};
