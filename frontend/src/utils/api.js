import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach voter/admin token automatically if present
api.interceptors.request.use((config) => {
  const voterToken = localStorage.getItem("voterToken");
  const adminToken = localStorage.getItem("adminToken");
  if (config.url.startsWith("/admin") && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (voterToken) {
    config.headers.Authorization = `Bearer ${voterToken}`;
  }
  return config;
});

export default api;
