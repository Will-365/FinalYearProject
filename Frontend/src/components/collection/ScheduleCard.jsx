import { formatDateWithSlot } from '@/utils/formatters';
import { StatusBadge } from '@/components/ui/Badge';
import { Calendar, User, Phone } from 'lucide-react';

export function ScheduleCard({ schedule }) {
  const wasteTypes = schedule.wasteTypesAccepted || schedule.wasteTypes || [];

  return (
    <div className="relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="absolute left-0 top-6 h-12 w-1 rounded-r-full bg-green-600" />
      <div className="pl-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <p className="font-bold text-slate-900">
              {formatDateWithSlot(schedule.date || schedule.scheduledDate, schedule.timeSlot)}
            </p>
          </div>
          <StatusBadge status={schedule.status || 'pending'} />
        </div>

        {wasteTypes.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {wasteTypes.map((t) => (
              <span key={t} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium capitalize text-green-800">
                {t}
              </span>
            ))}
          </div>
        )}

        {schedule.collector && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {schedule.collector.fullName || schedule.collector.name}
            </span>
            {schedule.collector.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {schedule.collector.phone}
              </span>
            )}
          </div>
        )}

        {(schedule.district || schedule.sector) && (
          <p className="mt-2 text-xs text-slate-400">
            {[schedule.district, schedule.sector].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}
