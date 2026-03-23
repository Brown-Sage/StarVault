import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Automatically attach the token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Automatically handle expired/invalid tokens globally
axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            window.dispatchEvent(new Event("auth-change"));
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default axiosInstance;
