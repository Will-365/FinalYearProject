import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children, allowedRoles, fallback }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="font-semibold text-amber-900">This section is for {allowedRoles.join(' / ')} accounts only.</p>
      </div>
    );
  }

  return children;
}
