import apiRequest from './api';

export const fetchUserProfile = async () => {
  return await apiRequest('/api/users/me');
};

export const updateUserProfile = async (profileData) => {
  return await apiRequest('/api/users', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
};

export const fetchAllUsers = async () => {
  return await apiRequest('/api/users');
};
