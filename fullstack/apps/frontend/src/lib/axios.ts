import axios from "axios";

// Default to localhost:3001/api/v1 if no env variable is provided
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for receiving cookies (like JWT token)
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
