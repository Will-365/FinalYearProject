import api, { extractData } from './api';

export const collectionService = {
  requestPickup: (payload) =>
    api.post('/collection/request', payload).then((r) => extractData(r)),

  getMyRequests: ({ status = '', page = 1, limit = 10 } = {}) =>
    api
      .get('/collection/my-requests', {
        params: { status: status || undefined, page, limit },
      })
      .then((r) => extractData(r)),

  getRequest: (id) =>
    api.get(`/collection/request/${id}`).then((r) => extractData(r)),

  cancelRequest: (id) =>
    api.patch(`/collection/request/${id}/cancel`).then((r) => extractData(r)),

  confirmCollection: (id) =>
    api.post(`/collection/request/${id}/confirm`).then((r) => r.data),

  getSchedules: ({ district = '', sector = '', page = 1, limit = 10 } = {}) =>
    api
      .get('/collection/schedules', {
        params: {
          district: district || undefined,
          sector: sector || undefined,
          page,
          limit,
        },
      })
      .then((r) => extractData(r)),

  getSchedule: (id) =>
    api.get(`/collection/schedule/${id}`).then((r) => extractData(r)),
};
