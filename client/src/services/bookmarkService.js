import apiRequest from "./api";

export const fetchBookmarks = async () => {
  return await apiRequest("/api/users/bookmarks");
};

export const addBookmark = async (ideaId) => {
  return await apiRequest("/api/users/bookmarks", {
    method: "POST",
    body: JSON.stringify({ ideaId }),
  });
};

export const removeBookmark = async (ideaId) => {
  return await apiRequest(`/api/users/bookmarks/${ideaId}`, {
    method: "DELETE",
  });
};
