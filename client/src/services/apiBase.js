const DEFAULT_API_ORIGIN = "http://localhost:5000";

const rawConfiguredOrigin = (process.env.REACT_APP_API_URL || DEFAULT_API_ORIGIN).trim();

export const API_ORIGIN =
  rawConfiguredOrigin.replace(/\/api\/?$/i, "").replace(/\/+$/, "") || DEFAULT_API_ORIGIN;

export const buildApiUrl = (path = "") => {
  if (!path) return API_ORIGIN;
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

