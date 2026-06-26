import api, { extractData } from './api';

export const couponService = {
  getCoupons: ({ category = '', page = 1, limit = 10 } = {}) =>
    api
      .get('/coupons', {
        params: { category: category || undefined, page, limit },
      })
      .then((r) => extractData(r)),

  claimCoupon: (id) =>
    api.post(`/coupons/${id}/claim`).then((r) => r.data),

  getMyCoupons: ({ status = 'active', page = 1, limit = 10 } = {}) =>
    api
      .get('/coupons/my-coupons', { params: { status, page, limit } })
      .then((r) => extractData(r)),
};
