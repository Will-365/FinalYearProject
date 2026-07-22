import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { adminBinService } from '@/services/adminService';
import { useDebounce, formatAdminDate, getTotalPages } from '@/utils/adminHelpers';
import { useToast } from '@/hooks/useToast';
import {
  Trash2, AlertTriangle, CheckCircle2, Gauge, Search, RefreshCw, Clock3, MapPin,
} from 'lucide-react';

const STATUS_META = {
  empty: { label: 'Empty', className: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  partial: { label: 'Partial', className: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500', dot: 'bg-amber-500' },
  full: { label: 'Full', className: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500', dot: 'bg-orange-500' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800', bar: 'bg-red-600', dot: 'bg-red-600' },
};

const CRIT_META = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-800' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-800' },
};

const CRIT_OPTIONS_FILTER = [
  { id: 'critical', label: 'Critical', className: 'bg-red-50 text-red-700 border border-red-100', activeClass: 'bg-red-600 text-white' },
  { id: 'high', label: 'High', className: 'bg-orange-50 text-orange-800 border border-orange-100', activeClass: 'bg-orange-500 text-white' },
  { id: 'medium', label: 'Medium', className: 'bg-blue-50 text-blue-800 border border-blue-100', activeClass: 'bg-blue-600 text-white' },
  { id: 'low', label: 'Low', className: 'bg-slate-50 text-slate-700 border border-slate-200', activeClass: 'bg-slate-700 text-white' },
];

function FillBar({ percent, status }) {
  const meta = STATUS_META[status] || STATUS_META.partial;
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="min-w-[120px]">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">{pct}%</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${meta.className}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${meta.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AdminBinStatusManagement() {
  const { showToast } = useToast();
  const [bins, setBins] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [criticalness, setCriticalness] = useState('');
  const [district, setDistrict] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await adminBinService.getSummary({
        criticalness: criticalness || undefined,
      });
      if (res.success !== false) setSummary(res.data || res);
    } catch {
      /* ignore */
    }
  }, [criticalness]);

  const fetchBins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBinService.getAll({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        status: status || undefined,
        criticalness: criticalness || undefined,
        district: district || undefined,
        sortBy: 'reportedAt',
        sortOrder: 'desc',
      });
      if (res.success !== false) {
        const d = res.data || res;
        setBins(d.bins || d.items || []);
        setTotalPages(getTotalPages(d.pagination) || 1);
        setTotal(d.pagination?.total || 0);
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, criticalness, district, showToast]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchBins();
  }, [fetchBins]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, criticalness, district]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await adminBinService.getById(id);
      setDetail(res.data || res);
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setDetailLoading(false);
    }
  };

  const districtOptions = useMemo(() => {
    const fromSummary = summary?.districts || [];
    const fromHotspots = (summary?.byLocation || []).map((l) => l.district).filter(Boolean);
    const fromRows = bins
      .map((b) => b.location?.district || b.resident?.location?.district)
      .filter(Boolean);
    return Array.from(new Set([...fromSummary, ...fromHotspots, ...fromRows]))
      .filter((d) => d && d !== 'Unknown')
      .sort((a, b) => a.localeCompare(b));
  }, [summary, bins]);

  const summaryCards = [
    { key: 'full', label: 'Full bins', value: summary?.full ?? 0, icon: Gauge, color: 'from-orange-500 to-amber-500' },
    { key: 'overdue', label: 'Overdue', value: summary?.overdue ?? 0, icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
    { key: 'partial', label: 'Partial', value: summary?.partial ?? 0, icon: Clock3, color: 'from-amber-400 to-yellow-500' },
    { key: 'empty', label: 'Empty', value: summary?.empty ?? 0, icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1f13]">Bin Status</h2>
          <p className="text-sm text-gray-500">
            Live fill levels and criticalness reported by residents
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            fetchSummary();
            fetchBins();
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((c) => {
          const Icon = c.icon;
          const active = status === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setStatus(active ? '' : c.key)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                active ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{c.label}</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">{c.value}</p>
                </div>
                <div className={`rounded-xl bg-gradient-to-br p-2.5 text-white ${c.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {summary && (
        <p className="text-xs text-slate-500">
          {summary.totalReported} residents reported · {summary.notReported ?? 0} not yet reported ·{' '}
          <span className="font-semibold text-red-600">{summary.critical ?? 0} critical</span>
          {' · '}
          <span className="font-semibold text-orange-600">{summary.high ?? 0} high urgency</span>
        </p>
      )}

      {/* Location filter by criticalness */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">Locations by criticalness</p>
                <p className="text-xs text-slate-500">
                  {criticalness
                    ? `Districts with ${criticalness} bin reports — click to filter`
                    : 'Select criticalness below, or click a district hotspot'}
                </p>
              </div>
            </div>
            {(criticalness || district) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCriticalness('');
                  setDistrict('');
                }}
              >
                Clear location filters
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {CRIT_OPTIONS_FILTER.map((c) => {
              const active = criticalness === c.id;
              const count = summary?.[c.id] ?? 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCriticalness(active ? '' : c.id);
                    // keep district if still relevant; reset page via effect
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? `${c.activeClass} ring-2 ring-offset-1`
                      : `${c.className} hover:opacity-90`
                  }`}
                >
                  {c.label}
                  <span className="ml-1.5 opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {(summary?.byLocation || []).length === 0 ? (
              <p className="text-xs text-slate-400">No location data yet for this criticalness</p>
            ) : (
              (summary.byLocation || []).slice(0, 12).map((loc) => {
                const active = district.toLowerCase() === String(loc.district || '').toLowerCase();
                const matchCount = criticalness
                  ? loc.matchingCount ?? loc[criticalness] ?? 0
                  : loc.critical || loc.high || loc.total;
                return (
                  <button
                    key={loc.district}
                    type="button"
                    onClick={() =>
                      setDistrict(active ? '' : loc.district)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                      active
                        ? 'border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-green-200'
                    }`}
                  >
                    <MapPin className="h-3 w-3 shrink-0 text-green-600" />
                    <span className="font-semibold">{loc.district}</span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">
                      {criticalness ? `${matchCount} ${criticalness}` : `${loc.total} bins`}
                    </span>
                    {!criticalness && (loc.critical > 0 || loc.high > 0) && (
                      <span className="font-semibold text-red-600">
                        {loc.critical > 0 ? `${loc.critical} crit` : `${loc.high} high`}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resident, phone…"
              className="pl-9"
            />
          </div>
          <Select value={district || 'all'} onValueChange={(v) => setDistrict(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="District" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {districtOptions.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="empty">Empty</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={criticalness || 'all'} onValueChange={(v) => setCriticalness(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Criticalness" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All criticalness</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch('');
              setStatus('');
              setCriticalness('');
              setDistrict('');
            }}
          >
            Reset
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Resident</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Fill level</th>
                <th className="px-4 py-3 font-semibold">Criticalness</th>
                <th className="px-4 py-3 font-semibold">Waste</th>
                <th className="px-4 py-3 font-semibold">Last pickup</th>
                <th className="px-4 py-3 font-semibold">Reported</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={8} className="px-4 py-3"><Skeleton className="h-10 w-full" /></td>
                  </tr>
                ))
              ) : bins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <Trash2 className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                    <p className="font-medium text-slate-800">No bin reports yet</p>
                    <p className="text-xs text-slate-500">Residents will appear here after they report their bin fill level</p>
                  </td>
                </tr>
              ) : (
                bins.map((row) => {
                  const crit = CRIT_META[row.criticalness] || CRIT_META.medium;
                  return (
                    <tr key={row._id} className="border-t border-gray-50 hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{row.resident?.fullName || '—'}</p>
                        <p className="text-xs text-slate-500">{row.resident?.phone || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <p>{row.location?.district || row.resident?.location?.district || '—'}</p>
                        <p className="text-xs text-slate-400">{row.location?.sector || row.resident?.location?.sector || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <FillBar percent={row.fillPercent} status={row.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={crit.className}>{crit.label}</Badge>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600">{row.wasteType || 'mixed'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.daysSinceLastPickup != null ? (
                          <span className={row.daysSinceLastPickup >= 14 ? 'font-semibold text-red-600' : ''}>
                            {row.daysSinceLastPickup}d ago
                          </span>
                        ) : (
                          <span className="text-slate-400">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatAdminDate(row.reportedAt)}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => openDetail(row._id)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm">
          <p className="text-slate-500">{total} reports</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="flex items-center px-2 text-slate-600">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(detail) || detailLoading} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Bin report detail</DialogTitle>
            <DialogDescription>Resident-reported fill level and recent history</DialogDescription>
          </DialogHeader>
          {detailLoading || !detail ? (
            <div className="space-y-2 py-6"><Skeleton className="h-8 w-full" /><Skeleton className="h-24 w-full" /></div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-bold text-slate-900">{detail.report?.resident?.fullName}</p>
                <p className="text-sm text-slate-500">{detail.report?.resident?.phone}</p>
              </div>
              <FillBar percent={detail.report?.fillPercent} status={detail.report?.status} />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Criticalness</p>
                  <p className="font-semibold capitalize">{detail.report?.criticalness}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Days since pickup</p>
                  <p className="font-semibold">
                    {detail.daysSinceLastPickup != null ? `${detail.daysSinceLastPickup} days` : 'No pickup yet'}
                  </p>
                </div>
              </div>
              {detail.report?.note && (
                <div className="rounded-xl border border-slate-100 bg-white p-3 text-sm text-slate-600">
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Resident note</p>
                  {detail.report.note}
                </div>
              )}
              {Array.isArray(detail.history) && detail.history.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Recent reports</p>
                  <ul className="max-h-40 space-y-1.5 overflow-y-auto text-sm">
                    {detail.history.map((h) => (
                      <li key={h._id} className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                        <span className="capitalize">{h.status} · {h.fillPercent}%</span>
                        <span className="text-xs text-slate-400">{formatAdminDate(h.reportedAt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
