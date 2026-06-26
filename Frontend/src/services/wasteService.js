import api, { extractData } from './api';

export const wasteService = {
  scan: (imageBase64, mimeType = 'image/jpeg') =>
    api
      .post('/waste/scan', { imageBase64, mimeType })
      .then((r) => extractData(r)),

  getHistory: (page = 1, limit = 10) =>
    api
      .get('/waste/history', { params: { page, limit } })
      .then((r) => extractData(r)),

  getScan: (id) =>
    api.get(`/waste/scan/${id}`).then((r) => extractData(r)),
};
