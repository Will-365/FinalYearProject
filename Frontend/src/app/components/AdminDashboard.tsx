import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { adminCollectionService, adminWasteIntakeService, adminCollectorService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { formatAdminDate, priorityBadgeClass, statusBadgeClass, wasteBadgeClass, normalizeCollectionRequest, getTotalPages } from '@/utils/adminHelpers';
import { AssignPickupModal } from '@/app/components/admin/AssignPickupModal';
import { TrendingUp, Truck, ClipboardList, Scale, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

const PIE_COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

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
  const dailyTrend = (summary?.dailyTrend || []).slice(-7).map((d: any) => ({ day: d._id?.slice(5) || d._id, count: d.count }));
  const wasteChart = Object.entries(byWasteType).map(([name, value]) => ({ name, value }));
  const categoryChart = (intake?.byCategory || []).map((c: any) => ({ name: c._id, weight: c.totalWeightKg }));

  const totalRequests = Object.values(byStatus).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
  const pending = (byStatus.pending || 0) + (byStatus.assigned || 0);
  const activeCollectors = collectors.filter((c) => c.collectorStatus !== 'offline').length;
  const totalKg = intake?.totals?.totalWeightKg || 0;

  const goCollection = (priority?: string) => {
    if (priority) sessionStorage.setItem('adminCollectionFilters', JSON.stringify({ priority }));
    onNavigate?.('collection');
  };

  const KpiSkeleton = () => <Skeleton className="h-[88px] rounded-xl" />;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[#0d1f13]">Admin Dashboard</h2>
        <p className="text-gray-500 text-sm">Live operations overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loadingSummary ? [1, 2, 3, 4].map((i) => <KpiSkeleton key={i} />) : (
          <>
            {/* KPI 1 */}
            <div className="relative group rounded-xl p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-blue-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between">
                  <div className="space-y-0.5 z-10 min-w-0">
                    <CardTitle className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Total Requests</CardTitle>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none mt-1">{totalRequests}</p>
                  </div>
                  <div className="p-2 bg-blue-50/80 rounded-lg z-10 shrink-0">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3 px-4 z-10">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="h-3 w-3" /> All time
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* KPI 2 */}
            <div className="relative group rounded-xl p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-amber-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between">
                  <div className="space-y-0.5 z-10 min-w-0">
                    <CardTitle className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Pending / Assigned</CardTitle>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none mt-1">{pending}</p>
                  </div>
                  <div className="p-2 bg-amber-50/80 rounded-lg z-10 shrink-0">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3 px-4 z-10">
                  <Button variant="link" className="p-0 h-auto text-xs text-amber-700 font-medium hover:text-amber-800" onClick={() => goCollection()}>
                    Review pending →
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* KPI 3 */}
            <div className="relative group rounded-xl p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-emerald-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between">
                  <div className="space-y-0.5 z-10 min-w-0">
                    <CardTitle className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Active Collectors</CardTitle>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none mt-1">{activeCollectors}</p>
                  </div>
                  <div className="p-2 bg-emerald-50/80 rounded-lg z-10 shrink-0">
                    <Truck className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3 px-4 z-10">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* KPI 4 */}
            <div className="relative group rounded-xl p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-indigo-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between">
                  <div className="space-y-0.5 z-10 min-w-0">
                    <CardTitle className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Waste Collected</CardTitle>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{Number(totalKg).toLocaleString()}</p>
                      <span className="text-xs text-gray-500 font-medium">kg</span>
                    </div>
                  </div>
                  <div className="p-2 bg-indigo-50/80 rounded-lg z-10 shrink-0">
                    <Scale className="h-4 w-4 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent className="pb-3 px-4 z-10">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    30d metrics
                  </span>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {(['high', 'medium', 'low'] as const).map((p) => (
          <button key={p} type="button" onClick={() => goCollection(p)} className={`rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 shadow-sm ${p === 'high' ? 'border-red-200 bg-red-50' : p === 'medium' ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
            <p className="text-[10px] font-semibold uppercase capitalize text-gray-500">{p} priority</p>
            <p className="text-xl font-bold mt-0.5">{byPriority[p] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="rounded-xl border border-gray-200 shadow-sm lg:col-span-1">
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm font-semibold">Daily Requests (7d)</CardTitle></CardHeader>
          <CardContent className="h-44 px-2 pb-3">
            {loadingSummary ? <Skeleton className="h-full rounded-[14px]" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 shadow-sm lg:col-span-1">
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm font-semibold">By Waste Type</CardTitle></CardHeader>
          <CardContent className="h-44 px-2 pb-3">
            {loadingSummary ? <Skeleton className="h-full rounded-[14px]" /> : wasteChart.length === 0 ? <p className="text-sm text-gray-400 text-center pt-20">No data</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={wasteChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={58} paddingAngle={3}>
                    {wasteChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-gray-200 shadow-sm lg:col-span-1">
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm font-semibold">Intake by Category</CardTitle></CardHeader>
          <CardContent className="h-44 px-2 pb-3">
            {loadingIntake ? <Skeleton className="h-full rounded-[14px]" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="weight" fill="#059669" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[20px] border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-xl">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-gray-900">Recent Requests</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Latest collection requests from residents</p>
            </div>
          </div>
          {!loadingSummary && (
            <Button variant="outline" size="sm" onClick={loadSummary} className="text-xs h-8 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-none font-medium">
              Refresh
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loadingRecent ? (
            <div className="p-5 space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
          ) : recent.length === 0 ? (
            <div className="py-16 text-center">
              <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                <ClipboardList className="h-6 w-6 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-900">No recent requests</p>
              <p className="text-sm text-gray-500 mt-1">When residents request pickups, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-visible w-full custom-scrollbar" style={{overflowX: 'auto'}}>
              <table className="w-full text-sm hidden md:table">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-5 font-semibold">Resident</th>
                    <th className="py-3 px-5 font-semibold">Type</th>
                    <th className="py-3 px-5 font-semibold">Priority</th>
                    <th className="py-3 px-5 font-semibold">Status</th>
                    <th className="py-3 px-5 font-semibold">Date</th>
                    <th className="py-3 px-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent.map((r) => (
                    <tr key={r._id || r.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-bold text-gray-900">{r.resident?.fullName || r.residentName || '—'}</span>
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant="outline" className={`${wasteBadgeClass(r.wasteType)} shadow-none font-bold capitalize`}>
                          {r.wasteType}
                        </Badge>
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant="outline" className={`${priorityBadgeClass(r.priority || 'medium')} shadow-none font-bold capitalize`}>
                          {r.priority || 'medium'}
                        </Badge>
                      </td>
                      <td className="py-4 px-5">
                        <Badge className={`${statusBadgeClass(r.status)} shadow-none font-bold capitalize border-0`}>
                          {r.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-gray-500 font-medium">
                        {formatAdminDate(r.preferredDate, r.preferredTimeSlot)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {['pending', 'assigned'].includes(r.status) ? (
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold shadow-none opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setAssignId(r._id || r.id)}>
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
              <div className="md:hidden divide-y divide-gray-50">
                {recent.map((r) => (
                  <div key={r._id || r.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-900">{r.resident?.fullName || 'Resident'}</p>
                      <Badge className={`${statusBadgeClass(r.status)} shadow-none font-bold capitalize border-0`}>{r.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className={`${wasteBadgeClass(r.wasteType)} shadow-none font-bold capitalize`}>{r.wasteType}</Badge>
                      <Badge variant="outline" className={`${priorityBadgeClass(r.priority || 'medium')} shadow-none font-bold capitalize`}>{r.priority || 'medium'}</Badge>
                    </div>
                    <div className="mt-3 text-sm text-gray-500 font-medium">
                      {formatAdminDate(r.preferredDate, r.preferredTimeSlot)}
                    </div>
                    {['pending', 'assigned'].includes(r.status) && (
                      <Button size="sm" variant="outline" className="mt-3 w-full text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold shadow-none" onClick={() => setAssignId(r._id || r.id)}>
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

      <AssignPickupModal open={Boolean(assignId)} onClose={() => setAssignId(null)} requestId={assignId} onSuccess={() => { loadRecent(); loadSummary(); }} />
    </div>
  );
}
