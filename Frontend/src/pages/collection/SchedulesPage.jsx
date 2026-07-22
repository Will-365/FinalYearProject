import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { collectionService } from '@/services/collectionService';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/app/components/ui/badge';
import { CalendarDays, Clock, MapPin, Truck } from 'lucide-react';

const DISTRICTS = [
  'Gasabo', 'Kicukiro', 'Nyarugenge',
  'Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo',
  'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango',
  'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana',
  'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro',
];

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-RW', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(s) {
  if (s.startTime && s.endTime) return `${s.startTime} – ${s.endTime}`;
  if (s.startTime) return s.startTime;
  return s.timeSlot ? String(s.timeSlot).replace('_', ' ') : '—';
}

const statusClass = {
  upcoming: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-900',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-slate-100 text-slate-600',
};

export function SchedulesPage({ onNavigate }) {
  const { user } = useAuth();
  const { error } = useAppToast();
  // Default to resident district only — sector is an optional refinement so
  // district-wide admin schedules are not hidden.
  const [district, setDistrict] = useState(user?.location?.district || '');
  const [sector, setSector] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.location?.district && !district) setDistrict(user.location.district);
  }, [user, district]);

  const loadSchedules = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await collectionService.getSchedules({
        district,
        sector: sector.trim(),
        page: p,
        limit: 12,
      });
      setSchedules(data.schedules || data.items || []);
      setTotalPages(data.pagination?.totalPages || data.pagination?.pages || 1);
      setPage(p);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [district, sector, error]);

  useEffect(() => {
    const timer = setTimeout(() => loadSchedules(1), 300);
    return () => clearTimeout(timer);
  }, [district, sector, loadSchedules]);

  const districtOptions = useMemo(() => {
    const d = user?.location?.district;
    const base = d ? [d, ...DISTRICTS] : DISTRICTS;
    return base.filter((v, i, a) => a.indexOf(v) === i);
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collection Schedules</h1>
          <p className="text-slate-500">Upcoming collection dates and times in your district</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.('collection-request')}
          className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Request a Pickup
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none"
          >
            <option value="">All districts</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Sector</label>
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Optional — leave blank for whole district"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={3} />
      ) : schedules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No scheduled collections yet</p>
          <p className="mb-4 text-sm text-slate-500">
            When admin publishes a district schedule, it will appear here
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.('collection-request')}
            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Request a Pickup
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Collection</th>
                    <th className="px-4 py-3 font-semibold">Waste types</th>
                    <th className="px-4 py-3 font-semibold">Collector</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => {
                    const districtName = s.zone?.district || s.district || '—';
                    const sectorName = s.zone?.sector || s.sector || '';
                    return (
                      <tr key={s._id || s.id} className="border-t border-slate-100 hover:bg-green-50/40">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 font-semibold text-slate-900">
                            <CalendarDays className="h-4 w-4 text-green-600" />
                            {formatDate(s.scheduledDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {formatTime(s)}
                          </div>
                          <p className="text-[11px] capitalize text-slate-400">{s.timeSlot}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                            <div>
                              <p className="font-semibold text-slate-800">{districtName}</p>
                              {sectorName && <p className="text-xs text-slate-500">{sectorName}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 max-w-[200px]">
                          <p className="font-medium truncate">{s.title || 'District collection'}</p>
                          {s.notes && <p className="text-xs text-slate-400 line-clamp-1">{s.notes}</p>}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(s.wasteTypes || ['mixed']).map((w) => (
                              <Badge key={w} variant="outline" className="text-[10px] capitalize">
                                {w}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Truck className="h-3.5 w-3.5 text-slate-400" />
                            {s.collector?.fullName || 'To be assigned'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={statusClass[s.status] || statusClass.upcoming}>
                            {(s.status || 'upcoming').replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={loadSchedules} loading={loading} />
        </>
      )}
    </div>
  );
}
