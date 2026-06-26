import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function formatAdminDate(dateStr, timeSlot) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const formatted = d.toLocaleDateString('en-RW', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  if (!timeSlot) return formatted;
  const slot =
    timeSlot === 'morning'
      ? 'Morning'
      : timeSlot === 'afternoon'
        ? 'Afternoon'
        : timeSlot === 'evening'
          ? 'Evening'
          : timeSlot;
  return `${formatted} • ${slot}`;
}

export function formatKg(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return `${Number(n).toLocaleString('en-RW', { maximumFractionDigits: 1 })} kg`;
}

export const statusBadgeClass = (status) => {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-600',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
};

export const priorityBadgeClass = (priority) => {
  const map = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-green-50 text-green-700',
  };
  return map[priority] || 'bg-slate-100 text-slate-700';
};

export const wasteBadgeClass = (type) => {
  const map = {
    organic: 'bg-amber-100 text-amber-800',
    inorganic: 'bg-blue-100 text-blue-800',
    recyclable: 'bg-yellow-100 text-yellow-800',
    hazardous: 'bg-red-100 text-red-800',
    mixed: 'bg-purple-100 text-purple-800',
  };
  return map[type] || 'bg-slate-100 text-slate-700';
};

export const collectorStatusDot = (status) => {
  const map = {
    available: 'bg-green-500',
    on_route: 'bg-amber-500',
    offline: 'bg-slate-400',
  };
  return map[status] || 'bg-slate-400';
};

export const vehicleEmoji = (type) => {
  const map = {
    truck: '🚛',
    van: '🚐',
    motorcycle: '🛵',
    bicycle: '🚴',
    on_foot: '🚶',
  };
  return map[type] || '🚛';
};

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function normalizeCollectionRequest(r) {
  if (!r) return r;
  const resident = r.residentInfo || (typeof r.resident === 'object' && r.resident?.fullName ? r.resident : null);
  const collector = r.collectorInfo || (typeof r.collector === 'object' && r.collector?.fullName ? r.collector : null);
  return {
    ...r,
    resident: resident || r.resident,
    collector: collector || r.collector,
  };
}

export function getTotalPages(pagination) {
  if (!pagination) return 1;
  return pagination.pages || pagination.totalPages || 1;
}
