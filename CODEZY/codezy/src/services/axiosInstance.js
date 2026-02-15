// src/services/axiosInstance.js
import axios from "axios";

// Create an axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or wherever you store JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
