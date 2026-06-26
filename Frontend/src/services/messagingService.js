import api, { extractData } from './api.js';

export const messagingService = {
  getNotifications: (params) =>
    api.get('/messaging/notifications', { params }).then((r) => extractData(r)),

  markNotificationRead: (id) =>
    api.patch(`/messaging/notifications/${id}/read`).then((r) => r.data),

  markAllNotificationsRead: () =>
    api.patch('/messaging/notifications/read-all').then((r) => r.data),

  getMessages: (params) =>
    api.get('/messaging/messages', { params }).then((r) => extractData(r)),

  sendMessage: (payload) =>
    api.post('/messaging/messages', payload).then((r) => r.data),

  markMessageRead: (id) =>
    api.patch(`/messaging/messages/${id}/read`).then((r) => r.data),

  getContacts: () => api.get('/messaging/contacts').then((r) => extractData(r)),

  sendBroadcast: (payload) =>
    api.post('/admin/reports/broadcasts', payload).then((r) => r.data),

  getBroadcasts: () =>
    api.get('/admin/reports/broadcasts').then((r) => extractData(r)),
};
