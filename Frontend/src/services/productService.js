import api, { extractData } from './api.js';

export const productService = {
  getProducts: () => api.get('/products').then((r) => extractData(r)),

  buyProduct: (id, payload) => api.post(`/products/${id}/buy`, payload).then((r) => r.data),

  getMyOrders: () => api.get('/products/orders/mine').then((r) => extractData(r)),
};
