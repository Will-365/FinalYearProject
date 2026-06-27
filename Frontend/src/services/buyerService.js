import api, { extractData } from './api.js';

export const buyerService = {
  register: (data) => api.post('/buyers/register', data).then((r) => r.data),
  login: (data) => api.post('/buyers/login', data).then((r) => r.data),
  getMe: () => api.get('/buyers/me').then((r) => extractData(r)),
  updateMe: (data) => api.put('/buyers/me', data).then((r) => extractData(r)),
  forgotPassword: (data) => api.post('/buyers/forgot-password', data).then((r) => r.data),
  resetPassword: (data) => api.post('/buyers/reset-password', data).then((r) => r.data),
};
