import { auth } from '../firebase';
import { buildApiUrl } from "./apiBase";

const apiRequest = async (url, options = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(buildApiUrl(url), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

export default apiRequest;
