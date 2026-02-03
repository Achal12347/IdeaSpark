import apiRequest from "./api";

export const fetchCollaborationRequests = async (type = "incoming") => {
  return await apiRequest(`/api/collaboration/requests?type=${type}`);
};

export const createCollaborationRequest = async (payload) => {
  return await apiRequest("/api/collaboration/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const respondToCollaborationRequest = async (id, action) => {
  return await apiRequest(`/api/collaboration/requests/${id}/respond`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
};
