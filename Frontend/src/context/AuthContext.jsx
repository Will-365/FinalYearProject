import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  persistAuth,
  setUnauthorizedHandler,
} from '@/services/api';
import { authService } from '@/services/authService';
import { adminAuthService } from '@/services/adminService';
import { buyerService } from '@/services/buyerService';

export const AuthContext = createContext(null);

export function AuthProvider({ children, onSessionExpired }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collectionPrefill, setCollectionPrefill] = useState(null);
  const pointsPollRef = useRef(null);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
    setCollectionPrefill(null);
    if (pointsPollRef.current) {
      clearInterval(pointsPollRef.current);
      pointsPollRef.current = null;
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      toast.error('Session expired. Please log in again.');
      onSessionExpired?.();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, onSessionExpired]);

  // Poll points balance every 60 seconds for residents
  useEffect(() => {
    if (!token || !user || user.role !== 'resident') {
      if (pointsPollRef.current) {
        clearInterval(pointsPollRef.current);
        pointsPollRef.current = null;
      }
      return;
    }
    const pollPoints = async () => {
      try {
        const res = await import('@/services/leaderboardService').then(m => m.leaderboardService.getMyStats());
        const pts = res?.points ?? res?.data?.points;
        if (pts != null) {
          setUser(prev => {
            if (!prev) return prev;
            const next = { ...prev, points: pts };
            if (token) persistAuth(token, next);
            return next;
          });
        }
      } catch { /* ignore poll errors */ }
    };
    pointsPollRef.current = setInterval(pollPoints, 60000);
    return () => {
      if (pointsPollRef.current) clearInterval(pointsPollRef.current);
    };
  }, [token, user?.role]);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    if (!res.success) {
      throw { message: res.message, needsVerification: res.needsVerification };
    }
    persistAuth(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    const res = await adminAuthService.login({ email, password });
    if (!res.success) {
      throw { message: res.message || 'Invalid admin credentials' };
    }
    persistAuth(res.token, { ...res.user, role: 'admin' });
    setToken(res.token);
    setUser({ ...res.user, role: 'admin' });
    return res.user;
  }, []);

  const buyerLogin = useCallback(async (phone, password) => {
    const res = await buyerService.login({ phone, password });
    if (!res.success) {
      throw { message: res.message || 'Invalid credentials' };
    }
    const buyerUser = { ...res.buyer, role: 'buyer' };
    persistAuth(res.token, buyerUser);
    setToken(res.token);
    setUser(buyerUser);
    return buyerUser;
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      if (token) persistAuth(token, next);
      return next;
    });
  }, [token]);

  const updatePoints = useCallback((points) => {
    updateUser({ points });
  }, [updateUser]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      adminLogin,
      buyerLogin,
      logout,
      updateUser,
      updatePoints,
      collectionPrefill,
      setCollectionPrefill,
      points: user?.points ?? 0,
    }),
    [user, token, isLoading, login, adminLogin, buyerLogin, logout, updateUser, updatePoints, collectionPrefill]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
