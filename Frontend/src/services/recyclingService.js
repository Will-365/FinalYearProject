import api, { extractData } from './api.js';

export const recyclingService = {
  getNearestCenters: (params = {}) =>
    api.get('/recycling/centers/nearest', { params }).then((r) => extractData(r)),

  getCenter: (id) => api.get(`/recycling/centers/${id}`).then((r) => extractData(r)),

  scheduleDropOff: (payload) =>
    api.post('/recycling/drop-offs', payload).then((r) => r.data),

  getMyDropOffs: () => api.get('/recycling/drop-offs').then((r) => extractData(r)),

  cancelDropOff: (id) =>
    api.patch(`/recycling/drop-offs/${id}/cancel`).then((r) => r.data),
};
