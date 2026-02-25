import LocalStorageKeys from "../types/localstorage";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const bbunToken = localStorage.getItem(LocalStorageKeys.BbunAccessToken);
  if (!bbunToken) return config;

  config.headers["Authorization"] = `Bearer ${bbunToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname === "/auth") {
        return Promise.reject(error);
      }

      localStorage.removeItem(LocalStorageKeys.AccessToken);
      localStorage.removeItem(LocalStorageKeys.IdToken);
      localStorage.removeItem(LocalStorageKeys.BbunAccessToken);

      window.location.href = "/onboarding";
    }
    return Promise.reject(error);
  },
);

export default api;
