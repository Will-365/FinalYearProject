import api, { extractData } from './api.js';

export const reportsService = {
  getEnvironmentalImpact: () =>
    api.get('/reports/environmental-impact').then((r) => extractData(r)),

  getResidentReport: (period = '30d') =>
    api.get('/reports/resident', { params: { period } }).then((r) => extractData(r)),

  getAdminReport: (period = '30d') =>
    api.get('/admin/reports', { params: { period } }).then((r) => extractData(r)),
};
