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

export const fetchUserStats = async () => {
  return await apiRequest('/api/users/stats');
};

export const fetchMembers = async () => {
  return await apiRequest('/api/users/members');
};

export const fetchAdmins = async () => {
  return await apiRequest('/api/users/admins');
};

export const fetchSuggestedCollaborators = async () => {
  return await apiRequest('/api/users/suggested-collaborators');
};
