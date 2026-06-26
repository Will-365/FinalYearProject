import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { collectionService } from '@/services/collectionService';
import { ScheduleCard } from '@/components/collection/ScheduleCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { CalendarDays } from 'lucide-react';

export function SchedulesPage({ onNavigate }) {
  const { user } = useAuth();
  const { error } = useAppToast();
  const [district, setDistrict] = useState(user?.location?.district || '');
  const [sector, setSector] = useState(user?.location?.sector || '');
  const [schedules, setSchedules] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.location?.district && !district) {
      setDistrict(user.location.district);
    }
    if (user?.location?.sector && !sector) {
      setSector(user.location.sector);
    }
  }, [user, district, sector]);

  const loadSchedules = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await collectionService.getSchedules({
        district,
        sector,
        page: p,
        limit: 10,
      });
      setSchedules(data.schedules || data.items || []);
      setTotalPages(data.pagination?.totalPages || 1);
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
    return d ? [d, 'Gasabo', 'Kicukiro', 'Nyarugenge'].filter((v, i, a) => a.indexOf(v) === i) : ['Gasabo', 'Kicukiro', 'Nyarugenge'];
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Collection Schedules</h1>
        <p className="text-slate-500">Upcoming pickups in your area</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none"
        >
          <option value="">All districts</option>
          {districtOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input
          type="text"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          placeholder="Filter by sector…"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none"
        />
      </div>

      {loading ? (
        <CardSkeleton count={3} />
      ) : schedules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No scheduled collections in your area yet</p>
          <p className="mb-4 text-sm text-slate-500">Request a pickup instead and we&apos;ll assign a collector</p>
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
          <div className="space-y-4">
            {schedules.map((s) => (
              <ScheduleCard key={s._id || s.id} schedule={s} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={loadSchedules} loading={loading} />
        </>
      )}
    </div>
  );
}
