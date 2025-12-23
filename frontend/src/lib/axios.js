import axios from "axios";

// Create an instance of axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3030/api", // Vercel will provide VITE_API_URL
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Important for cookies/sessions if used, or just good practice
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
