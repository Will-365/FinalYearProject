import api, { extractData } from './api.js';

export const profileService = {
  getProfile: () => api.get('/auth/me').then((r) => extractData(r)),

  updateProfile: (data) => api.put('/auth/profile', data).then((r) => r.data),

  changePassword: (data) => api.patch('/auth/password', data).then((r) => r.data),

  getAdminProfile: () => api.get('/admin/auth/me').then((r) => extractData(r)),

  updateAdminProfile: (data) => api.put('/admin/auth/profile', data).then((r) => r.data),
};
