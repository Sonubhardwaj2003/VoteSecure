import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach voter/admin token automatically if present
api.interceptors.request.use((config) => {
  const voterToken = localStorage.getItem("voterToken");
  const adminToken = localStorage.getItem("adminToken");

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (voterToken) {
    config.headers.Authorization = `Bearer ${voterToken}`;
  }

  return config;
});

// If the backend says our token is missing/expired/invalid (401), the token
// in localStorage is stale — clear it so the app falls back to a proper
// login screen instead of repeatedly retrying a dead session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("voterToken");
    }
    return Promise.reject(error);
  }
);

export default api;
