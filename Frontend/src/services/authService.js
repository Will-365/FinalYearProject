import api, { extractData } from './api';

export const authService = {
  register: (data) =>
    api.post('/auth/register', data).then((r) => r.data),

  verifyOTP: (data) =>
    api.post('/auth/verify-otp', data).then((r) => r.data),

  resendOTP: (data) =>
    api.post('/auth/resend-otp', data).then((r) => r.data),

  login: (data) =>
    api.post('/auth/login', data).then((r) => r.data),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),

  verifyResetOTP: (data) =>
    api.post('/auth/verify-reset-otp', data).then((r) => r.data),

  resetPassword: (data) =>
    api.post('/auth/reset-password', data).then((r) => r.data),
};
