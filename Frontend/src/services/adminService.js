import api, { storage } from './api.js';

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

const unwrap = (response) => response.data;

export const adminAuthService = {
  login: async (data) => {
    const res = await fetch(`${BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getMe: () => api.get('/admin/auth/me').then(unwrap),
};

export const adminCollectorService = {
  getAll: (params = {}) => api.get('/admin/collectors', { params }).then(unwrap),
  getById: (id) => api.get(`/admin/collectors/${id}`).then(unwrap),
  create: (data) => api.post('/admin/collectors', data).then(unwrap),
  update: (id, data) => api.put(`/admin/collectors/${id}`, data).then(unwrap),
  remove: (id) => api.delete(`/admin/collectors/${id}`).then(unwrap),
  setStatus: (id, collectorStatus) =>
    api.patch(`/admin/collectors/${id}/status`, { collectorStatus }).then(unwrap),
};

export const adminCollectionService = {
  getAll: (params = {}) => api.get('/admin/collections', { params }).then(unwrap),
  getSummary: () => api.get('/admin/collections/summary').then(unwrap),
  getById: (id) => api.get(`/admin/collections/${id}`).then(unwrap),
  assign: (id, data) => api.post(`/admin/collections/${id}/assign`, data).then(unwrap),
  unassign: (id) => api.patch(`/admin/collections/${id}/unassign`).then(unwrap),
  setPriority: (id, data) => api.patch(`/admin/collections/${id}/priority`, data).then(unwrap),
  setStatus: (id, data) => api.patch(`/admin/collections/${id}/status`, data).then(unwrap),
  approve: (id) => api.post(`/admin/collections/${id}/approve`, {}).then(unwrap),
};

export const adminCouponService = {
  getAll: () => api.get('/admin/coupons').then(unwrap),
  create: (data) => api.post('/admin/coupons', data).then(unwrap),
  grant: (couponId, data) => api.post(`/admin/coupons/${couponId}/grant`, data).then(unwrap),
  getRecentGrants: () => api.get('/admin/coupons/grants').then(unwrap),
};

export const adminWasteIntakeService = {
  getAnalytics: (params = {}) => api.get('/admin/waste-intake/analytics', { params }).then(unwrap),
  getAll: (params = {}) => api.get('/admin/waste-intake', { params }).then(unwrap),
  getDiscrepancies: (params = {}) => api.get('/admin/waste-intake/discrepancies', { params }).then(unwrap),
  create: (data) => api.post('/admin/waste-intake', data).then(unwrap),
  advanceStage: (id, data) => api.patch(`/admin/waste-intake/${id}/stage`, data).then(unwrap),
  convertToProduct: (id, data) => api.post(`/admin/waste-intake/${id}/convert-to-product`, data).then(unwrap),
  resolveDiscrepancy: (id, data) => api.patch(`/admin/waste-intake/${id}/resolve-discrepancy`, data).then(unwrap),
};

export const adminAddressService = {
  getTree: (province) => api.get('/admin/address/tree', { params: { province } }).then(unwrap),
  getAll: (params = {}) => api.get('/admin/address', { params }).then(unwrap),
  create: (data) => api.post('/admin/address', data).then(unwrap),
  update: (id, data) => api.put(`/admin/address/${id}`, data).then(unwrap),
  remove: (id) => api.delete(`/admin/address/${id}`).then(unwrap),
  assignCollector: (id, collectorId) =>
    api.patch(`/admin/address/${id}/assign-collector`, { collectorId }).then(unwrap),
};

export const adminCatalogService = {
  // Products
  getProducts: (params = {}) => api.get('/admin/catalog/products', { params }).then(unwrap),
  getProduct: (id) => api.get(`/admin/catalog/products/${id}`).then(unwrap),
  createProduct: (data) => api.post('/admin/catalog/products', data).then(unwrap),
  updateProduct: (id, data) => api.put(`/admin/catalog/products/${id}`, data).then(unwrap),
  adjustStock: (id, data) => api.patch(`/admin/catalog/products/${id}/stock`, data).then(unwrap),
  deleteProduct: (id) => api.delete(`/admin/catalog/products/${id}`).then(unwrap),
  // Orders
  getOrders: (params = {}) => api.get('/admin/catalog/orders', { params }).then(unwrap),
  updateOrderStatus: (id, data) => api.patch(`/admin/catalog/orders/${id}/status`, data).then(unwrap),
  // Buyers
  getBuyers: (params = {}) => api.get('/admin/catalog/buyers', { params }).then(unwrap),
  toggleBuyer: (id) => api.patch(`/admin/catalog/buyers/${id}/toggle`).then(unwrap),
};

export { storage };
