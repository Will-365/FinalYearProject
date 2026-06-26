import { cn } from '@/app/components/ui/utils';

export function StatusBadge({ status, className }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-600',
    active: 'bg-green-100 text-green-800',
    used: 'bg-slate-100 text-slate-600',
    expired: 'bg-red-100 text-red-800',
  };

  const labels = {
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    active: 'Active',
    used: 'Used',
    expired: 'Expired',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        colors[status] || 'bg-slate-100 text-slate-700',
        className
      )}
    >
      {labels[status] || status}
    </span>
  );
}

export function WasteTypeBadge({ type, className }) {
  const config = {
    organic: 'bg-amber-100 text-amber-800',
    inorganic: 'bg-blue-100 text-blue-800',
    hazardous: 'bg-red-100 text-red-800',
    recyclable: 'bg-yellow-100 text-yellow-800',
    unknown: 'bg-slate-100 text-slate-700',
    mixed: 'bg-purple-100 text-purple-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        config[type] || config.unknown,
        className
      )}
    >
      {type?.replace('_', ' ') || 'Unknown'}
    </span>
  );
}

export function PointsBadge({ points, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700 border border-green-200',
        className
      )}
    >
      💚 {points ?? 0} pts
    </span>
  );
}
