import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

export const TOKEN_KEY = 'greencare_token';
export const USER_KEY = 'greencare_user';
const LEGACY_TOKEN_KEY = 'gc_token';
const LEGACY_USER_KEY = 'gc_user';

export const getStoredToken = () =>
  localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);

export const getStoredUser = () => {
  const raw =
    localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const persistAuth = (token, user) => {
  localStorage.setItem('gc_token', token);
  localStorage.setItem('gc_user', JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
};

export const storage = {
  getToken: getStoredToken,
  getUser: getStoredUser,
  setToken: (token) => {
    localStorage.setItem('gc_token', token);
    localStorage.setItem(TOKEN_KEY, token);
  },
  setUser: (user) => {
    const json = JSON.stringify(user);
    localStorage.setItem('gc_user', json);
    localStorage.setItem(USER_KEY, json);
  },
  clear: clearAuthStorage,
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    if (status === 401) {
      clearAuthStorage();
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/';
      }
    }

    return Promise.reject({
      status,
      message,
      data: error.response?.data,
    });
  }
);

export const extractData = (response) => {
  const body = response.data;
  if (body?.success === false) {
    throw {
      message: body.message || 'Request failed',
      data: body,
    };
  }
  return body?.data !== undefined ? body.data : body;
};

export default api;
export { api };
