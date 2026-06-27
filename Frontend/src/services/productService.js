import api, { extractData } from './api.js';

const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

export const productService = {
  // Public — no auth required
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/products${query ? '?' + query : ''}`);
    return res.json();
  },
  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    return res.json();
  },
  // Protected
  buy: (id, data) => api.post(`/products/${id}/buy`, data).then((r) => r.data),
  getMyOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/products/orders/mine${query ? '?' + query : ''}`).then((r) => extractData(r));
  },
  cancelOrder: (id, data = {}) => api.patch(`/products/orders/${id}/cancel`, data).then((r) => r.data),
  // Admin (legacy compatibility if used anywhere else)
  getProducts: () => api.get('/products').then((r) => extractData(r)),
  buyProduct: (id, payload) => api.post(`/products/${id}/buy`, payload).then((r) => r.data),
};
