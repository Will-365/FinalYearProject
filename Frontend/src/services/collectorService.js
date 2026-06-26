import api, { extractData } from './api.js';

export const collectorService = {
  getStats: () => api.get('/collector/stats').then((r) => extractData(r)),

  getPickups: ({ scope = 'assigned', page = 1, limit = 20 } = {}) =>
    api.get('/collector/pickups', { params: { scope, page, limit } }).then((r) => extractData(r)),

  getPickup: (id) => api.get(`/collector/pickups/${id}`).then((r) => extractData(r)),

  updatePickupStatus: (id, payload) =>
    api.patch(`/collector/pickups/${id}/status`, payload).then((r) => r.data),

  getNotifications: ({ page = 1, limit = 20, unreadOnly } = {}) =>
    api.get('/collector/notifications', { params: { page, limit, unreadOnly } }).then((r) => extractData(r)),

  markNotificationRead: (id) =>
    api.patch(`/collector/notifications/${id}/read`).then((r) => r.data),

  markAllNotificationsRead: () =>
    api.patch('/collector/notifications/read-all').then((r) => r.data),

  getMessages: ({ box = 'inbox', page = 1, limit = 20 } = {}) =>
    api.get('/collector/messages', { params: { box, page, limit } }).then((r) => extractData(r)),

  sendMessage: (payload) => api.post('/collector/messages', payload).then((r) => r.data),

  markMessageRead: (id) => api.patch(`/collector/messages/${id}/read`).then((r) => r.data),

  getContacts: () => api.get('/collector/contacts').then((r) => extractData(r)),

  getReport: (period = '30d') =>
    api.get('/collector/reports', { params: { period } }).then((r) => extractData(r)),
};
