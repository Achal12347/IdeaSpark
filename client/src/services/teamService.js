import apiRequest from './api';

export const fetchTeams = async () => {
  return await apiRequest('/api/teams');
};

export const createTeam = async (teamData) => {
  return await apiRequest('/api/teams', {
    method: 'POST',
    body: JSON.stringify(teamData),
  });
};
