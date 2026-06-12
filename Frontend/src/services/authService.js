const BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  register: (data) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  verifyOTP: (data) => fetch(`${BASE}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  resendOTP: (data) => fetch(`${BASE}/auth/resend-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
  login: (data) => fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
};
