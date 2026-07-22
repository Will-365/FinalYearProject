import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { adminCollectionService, adminWasteIntakeService, adminCollectorService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { formatAdminDate, priorityBadgeClass, statusBadgeClass, wasteBadgeClass, normalizeCollectionRequest } from '@/utils/adminHelpers';
import { AssignPickupModal } from '@/app/components/admin/AssignPickupModal';
import {
  TrendingUp, Truck, ClipboardList, Scale, AlertTriangle, ArrowUpRight,
  CalendarDays, PieChart as PieIcon, BarChart3, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

const PIE_COLORS = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  assigned: '#3b82f6',
  in_progress: '#8b5cf6',
  completed: '#16a34a',
  cancelled: '#94a3b8',
};

function formatDayLabel(iso: string) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso.slice(5);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function fillDailySeries(raw: { _id?: string; count?: number }[], days = 7) {
  const map = new Map((raw || []).map((d) => [d._id, d.count || 0]));
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({
      date: key,
      label: formatDayLabel(key),
      count: map.get(key) || 0,
    });
  }
  return out;
}

function fillWeightTrend(raw: { _id?: string; totalWeightKg?: number; count?: number }[], days = 14) {
  const map = new Map(
    (raw || []).map((d) => [d._id, { weight: d.totalWeightKg || 0, count: d.count || 0 }])
  );
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hit = map.get(key) || { weight: 0, count: 0 };
    out.push({
      date: key,
      label: formatDayLabel(key),
      weightKg: Math.round(hit.weight * 10) / 10,
      records: hit.count,
    });
  }
  return out;
}

function ChartTooltipShell({ active, payload, label, valueLabel, unit }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900">
        {valueLabel}:{' '}
        <span className="text-emerald-700">
          {typeof row.value === 'number' ? row.value.toLocaleString() : row.value}
          {unit ? ` ${unit}` : ''}
        </span>
      </p>
    </div>
  );
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [intake, setIntake] = useState<any>(null);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingIntake, setLoadingIntake] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [assignId, setAssignId] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await adminCollectionService.getSummary();
      setSummary(res.success ? res.data : res);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message || 'Failed to load summary' });
    } finally {
      setLoadingSummary(false);
    }
  }, [showToast]);

  const loadIntake = useCallback(async () => {
    setLoadingIntake(true);
    try {
      const res = await adminWasteIntakeService.getAnalytics({ period: '30d' });
      setIntake(res.success ? res.data : res);
    } catch {
      setIntake(null);
    } finally {
      setLoadingIntake(false);
    }
  }, []);

  const loadCollectors = useCallback(async () => {
    try {
      const res = await adminCollectorService.getAll({ limit: 100 });
      if (res.success) setCollectors(res.data?.collectors || []);
    } catch { /* ignore */ }
  }, []);

  const loadRecent = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const res = await adminCollectionService.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
      if (res.success) setRecent((res.data?.requests || []).map(normalizeCollectionRequest));
    } catch {
      setRecent([]);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadIntake();
    loadCollectors();
    loadRecent();
  }, [loadSummary, loadIntake, loadCollectors, loadRecent]);

  const byStatus = summary?.byStatus || {};
  const byPriority = summary?.byPriority || {};
  const byWasteType = summary?.byWasteType || {};

  const dailyTrend = useMemo(
    () => fillDailySeries(summary?.dailyTrend || [], 7),
    [summary]
  );

  const intakeTrend = useMemo(
    () => fillWeightTrend(intake?.trend || [], 14),
    [intake]
  );

  const wasteChart = useMemo(
    () => Object.entries(byWasteType).map(([name, value]) => ({
      name: String(name).replace(/_/g, ' '),
      value: Number(value) || 0,
    })),
    [byWasteType]
  );

  const categoryChart = useMemo(
    () => (intake?.byCategory || []).map((c: any) => ({
      name: String(c._id || 'other').replace(/_/g, ' '),
      weightKg: Math.round((c.totalWeightKg || 0) * 10) / 10,
      count: c.count || 0,
    })),
    [intake]
  );

  const statusChart = useMemo(
    () => Object.entries(byStatus).map(([name, value]) => ({
      name: String(name).replace(/_/g, ' '),
      key: name,
      count: Number(value) || 0,
    })),
    [byStatus]
  );

  const totalRequests = Object.values(byStatus).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
  const pending = (byStatus.pending || 0) + (byStatus.assigned || 0);
  const activeCollectors = collectors.filter((c) => c.collectorStatus !== 'offline').length;
  const totalKg = intake?.totals?.totalWeightKg || 0;

  const peakDay = useMemo(() => {
    if (!dailyTrend.length) return null;
    return dailyTrend.reduce((best, d) => (d.count > best.count ? d : best), dailyTrend[0]);
  }, [dailyTrend]);

  const avgDailyRequests = useMemo(() => {
    if (!dailyTrend.length) return 0;
    const sum = dailyTrend.reduce((a, d) => a + d.count, 0);
    return Math.round((sum / dailyTrend.length) * 10) / 10;
  }, [dailyTrend]);

  const topWaste = useMemo(() => {
    if (!wasteChart.length) return null;
    return [...wasteChart].sort((a, b) => b.value - a.value)[0];
  }, [wasteChart]);

  const goCollection = (priority?: string) => {
    if (priority) sessionStorage.setItem('adminCollectionFilters', JSON.stringify({ priority }));
    onNavigate?.('collection');
  };

  const KpiSkeleton = () => <Skeleton className="h-[88px] rounded-xl" />;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#0d1f13]">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">Live operations overview — charts labelled for decision making</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loadingSummary ? [1, 2, 3, 4].map((i) => <KpiSkeleton key={i} />) : (
          <>
            <div className="relative group rounded-xl p-[1px]">
              <Card className="relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all group-hover:shadow-md">
                <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-blue-500/5 to-transparent" />
                <CardHeader className="flex flex-row items-start justify-between px-4 pb-2 pt-4">
                  <div className="z-10 min-w-0 space-y-0.5">
                    <CardTitle className="truncate text-[11px] font-semibold uppercase tracking-wider text-gray-500">Total Requests</CardTitle>
                    <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-gray-900">{totalRequests}</p>
                  </div>
                  <div className="z-10 shrink-0 rounded-lg bg-blue-50/80 p-2">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="z-10 px-4 pb-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    <ArrowUpRight className="h-3 w-3" /> All time
                  </span>
                </CardContent>
              </Card>
            </div>

            <div className="relative group rounded-xl p-[1px]">
              <Card className="relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all group-hover:shadow-md">
                <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-amber-500/5 to-transparent" />
                <CardHeader className="flex flex-row items-start justify-between px-4 pb-2 pt-4">
                  <div className="z-10 min-w-0 space-y-0.5">
                    <CardTitle className="truncate text-[11px] font-semibold uppercase tracking-wider text-gray-500">Pending / Assigned</CardTitle>
                    <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-gray-900">{pending}</p>
                  </div>
                  <div className="z-10 shrink-0 rounded-lg bg-amber-50/80 p-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent className="z-10 px-4 pb-3">
                  <Button variant="link" className="h-auto p-0 text-xs font-medium text-amber-700 hover:text-amber-800" onClick={() => goCollection()}>
                    Review pending →
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="relative group rounded-xl p-[1px]">
              <Card className="relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all group-hover:shadow-md">
                <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-emerald-500/5 to-transparent" />
                <CardHeader className="flex flex-row items-start justify-between px-4 pb-2 pt-4">
                  <div className="z-10 min-w-0 space-y-0.5">
                    <CardTitle className="truncate text-[11px] font-semibold uppercase tracking-wider text-gray-500">Active Collectors</CardTitle>
                    <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-gray-900">{activeCollectors}</p>
                  </div>
                  <div className="z-10 shrink-0 rounded-lg bg-emerald-50/80 p-2">
                    <Truck className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="z-10 px-4 pb-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Online
                  </span>
                </CardContent>
              </Card>
            </div>

            <div className="relative group rounded-xl p-[1px]">
              <Card className="relative h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all group-hover:shadow-md">
                <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-indigo-500/5 to-transparent" />
                <CardHeader className="flex flex-row items-start justify-between px-4 pb-2 pt-4">
                  <div className="z-10 min-w-0 space-y-0.5">
                    <CardTitle className="truncate text-[11px] font-semibold uppercase tracking-wider text-gray-500">Waste Collected</CardTitle>
                    <div className="mt-1 flex items-baseline gap-1">
                      <p className="text-2xl font-bold leading-none tracking-tight text-gray-900">{Number(totalKg).toLocaleString()}</p>
                      <span className="text-xs font-medium text-gray-500">kg</span>
                    </div>
                  </div>
                  <div className="z-10 shrink-0 rounded-lg bg-indigo-50/80 p-2">
                    <Scale className="h-4 w-4 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent className="z-10 px-4 pb-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                    Last 30 days
                  </span>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(['high', 'medium', 'low'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => goCollection(p)}
            className={`rounded-xl border p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 ${
              p === 'high' ? 'border-red-200 bg-red-50' : p === 'medium' ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'
            }`}
          >
            <p className="text-[10px] font-semibold uppercase capitalize text-gray-500">{p} priority</p>
            <p className="mt-0.5 text-xl font-bold">{byPriority[p] ?? 0}</p>
          </button>
        ))}
      </div>

      {/* ── Pickup demand over time ─────────────────────────────────────── */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-50 p-2">
              <CalendarDays className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Pickup demand over time
              </CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">
                X-axis: calendar day · Y-axis: number of collection requests
              </p>
            </div>
          </div>
          {!loadingSummary && (
            <div className="hidden shrink-0 gap-2 sm:flex">
              <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                Avg {avgDailyRequests}/day
              </span>
              {peakDay && (
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Peak {peakDay.count} on {peakDay.label}
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="h-72 px-2 pb-4 pt-3 sm:px-4">
          {loadingSummary ? (
            <Skeleton className="h-full w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 16, right: 18, left: 8, bottom: 28 }}>
                <defs>
                  <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={48}
                  label={{
                    value: 'Time (day)',
                    position: 'insideBottom',
                    offset: -4,
                    style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
                  }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  width={48}
                  label={{
                    value: 'Requests',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 8,
                    style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
                  }}
                />
                <Tooltip
                  content={<ChartTooltipShell valueLabel="Requests" unit="pickups" />}
                  cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Requests"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fill="url(#demandFill)"
                  dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Waste mix */}
        <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-2">
                <PieIcon className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Collection mix by waste type
                </CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">
                  Share of requests · use to plan bins, trucks & sorting capacity
                </p>
              </div>
            </div>
            {topWaste && !loadingSummary && (
              <p className="mt-2 text-xs font-medium text-slate-600">
                Leading type: <span className="capitalize text-emerald-700">{topWaste.name}</span>
                {' '}({topWaste.value} requests)
              </p>
            )}
          </CardHeader>
          <CardContent className="h-64 px-2 pb-4 pt-2">
            {loadingSummary ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : wasteChart.length === 0 ? (
              <p className="pt-20 text-center text-sm text-gray-400">No waste-type data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteChart}
                    dataKey="value"
                    nameKey="name"
                    cx="42%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {wasteChart.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} requests`, name]}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, paddingLeft: 8 }}
                    formatter={(value) => <span className="capitalize text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status pipeline */}
        <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-violet-50 p-2">
                <Activity className="h-5 w-5 text-violet-700" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Request status pipeline
                </CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">
                  X-axis: request count · Y-axis: workflow status
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64 px-2 pb-4 pt-3 sm:px-4">
            {loadingSummary ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : statusChart.length === 0 ? (
              <p className="pt-20 text-center text-sm text-gray-400">No status data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusChart}
                  layout="vertical"
                  margin={{ top: 8, right: 18, left: 12, bottom: 28 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    label={{
                      value: 'Number of requests',
                      position: 'insideBottom',
                      offset: -4,
                      style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    label={{
                      value: 'Status',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -2,
                      style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
                    }}
                  />
                  <Tooltip content={<ChartTooltipShell valueLabel="Count" unit="requests" />} />
                  <Bar dataKey="count" name="Requests" radius={[0, 6, 6, 0]} barSize={18}>
                    {statusChart.map((s) => (
                      <Cell key={s.key} fill={STATUS_COLORS[s.key] || '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Intake by category */}
        <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-50 p-2">
                <BarChart3 className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Intake weight by category
                </CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">
                  X-axis: waste category · Y-axis: total weight (kg) · last 30 days
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72 px-2 pb-4 pt-3 sm:px-4">
            {loadingIntake ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : categoryChart.length === 0 ? (
              <p className="pt-24 text-center text-sm text-gray-400">No intake logged in this period</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} margin={{ top: 12, right: 12, left: 8, bottom: 36 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={52}
                    label={{
                      value: 'Waste category',
                      position: 'insideBottom',
                      offset: -8,
                      style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    width={52}
                    label={{
                      value: 'Weight (kg)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 6,
                      style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
                    }}
                  />
                  <Tooltip
                    content={<ChartTooltipShell valueLabel="Weight" unit="kg" />}
                    cursor={{ fill: '#F8FAFC' }}
                  />
                  <Bar dataKey="weightKg" name="Weight (kg)" fill="#059669" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Intake over time */}
        <Card className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-teal-50 p-2">
                <TrendingUp className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Intake volume over time
                </CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">
                  X-axis: calendar day · Y-axis: intake weight (kg) · last 14 days
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72 px-2 pb-4 pt-3 sm:px-4">
            {loadingIntake ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={intakeTrend} margin={{ top: 12, right: 12, left: 8, bottom: 36 }}>
                  <defs>
                    <linearGradient id="intakeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    interval="preserveStartEnd"
                    angle={-25}
                    textAnchor="end"
                    height={52}
                    label={{
                      value: 'Time (day)',
                      position: 'insideBottom',
                      offset: -8,
                      style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    width={52}
                    label={{
                      value: 'Weight (kg)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 6,
                      style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600 },
                    }}
                  />
                  <Tooltip content={<ChartTooltipShell valueLabel="Intake" unit="kg" />} />
                  <Area
                    type="monotone"
                    dataKey="weightKg"
                    name="Weight (kg)"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fill="url(#intakeFill)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[20px] border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-50 p-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-gray-900">Recent Requests</CardTitle>
              <p className="mt-0.5 text-xs text-gray-500">Latest collection requests from residents</p>
            </div>
          </div>
          {!loadingSummary && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadSummary}
              className="h-8 border-gray-200 text-xs font-medium text-gray-600 shadow-none hover:bg-gray-50 hover:text-gray-900"
            >
              Refresh
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loadingRecent ? (
            <div className="space-y-3 p-5">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
          ) : recent.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-gray-50">
                <ClipboardList className="h-6 w-6 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-900">No recent requests</p>
              <p className="mt-1 text-sm text-gray-500">When residents request pickups, they will appear here.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="hidden w-full text-sm md:table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3 font-semibold">Resident</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Priority</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent.map((r) => (
                    <tr key={r._id || r.id} className="group transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-900">{r.resident?.fullName || r.residentName || '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={`${wasteBadgeClass(r.wasteType)} font-bold capitalize shadow-none`}>
                          {r.wasteType}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={`${priorityBadgeClass(r.priority || 'medium')} font-bold capitalize shadow-none`}>
                          {r.priority || 'medium'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={`${statusBadgeClass(r.status)} border-0 font-bold capitalize shadow-none`}>
                          {r.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-500">
                        {formatAdminDate(r.preferredDate, r.preferredTimeSlot)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {['pending', 'assigned'].includes(r.status) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-200 font-semibold text-blue-600 opacity-0 shadow-none transition-opacity hover:bg-blue-50 group-hover:opacity-100"
                            onClick={() => setAssignId(r._id || r.id)}
                          >
                            Assign
                          </Button>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="divide-y divide-gray-50 md:hidden">
                {recent.map((r) => (
                  <div key={r._id || r.id} className="p-4 transition-colors hover:bg-gray-50/50">
                    <div className="mb-2 flex items-start justify-between">
                      <p className="font-bold text-gray-900">{r.resident?.fullName || 'Resident'}</p>
                      <Badge className={`${statusBadgeClass(r.status)} border-0 font-bold capitalize shadow-none`}>{r.status}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className={`${wasteBadgeClass(r.wasteType)} font-bold capitalize shadow-none`}>{r.wasteType}</Badge>
                      <Badge variant="outline" className={`${priorityBadgeClass(r.priority || 'medium')} font-bold capitalize shadow-none`}>{r.priority || 'medium'}</Badge>
                    </div>
                    <div className="mt-3 text-sm font-medium text-gray-500">
                      {formatAdminDate(r.preferredDate, r.preferredTimeSlot)}
                    </div>
                    {['pending', 'assigned'].includes(r.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full border-blue-200 font-semibold text-blue-600 shadow-none hover:bg-blue-50"
                        onClick={() => setAssignId(r._id || r.id)}
                      >
                        Assign Collection
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AssignPickupModal
        open={Boolean(assignId)}
        onClose={() => setAssignId(null)}
        requestId={assignId}
        onSuccess={() => { loadRecent(); loadSummary(); }}
      />
    </div>
  );
}
