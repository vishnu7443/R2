import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:5000/api";
  }
  return "https://inventra-erp.onrender.com/api";
};

const API = axios.create({
  baseURL: getBaseUrl(),
});

API.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");

    if (!token) {
      token = "demo-token-inventra-sre";
      try {
        localStorage.setItem("token", token);
        if (!localStorage.getItem("userName")) localStorage.setItem("userName", "Administrator");
        if (!localStorage.getItem("role")) localStorage.setItem("role", "ADMIN");
      } catch (e) {}
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        localStorage.setItem("token", "demo-token-inventra-sre");
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export default API;
