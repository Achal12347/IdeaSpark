import api from './api';

export const fetchBookmarks = async () => {
  try {
    const response = await api.get('/bookmarks');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }
};

export const addBookmark = async (ideaId) => {
  try {
    const response = await api.post('/bookmarks', { ideaId });
    return response.data;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw error;
  }
};

export const removeBookmark = async (ideaId) => {
  try {
    const response = await api.delete(`/bookmarks/${ideaId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};
