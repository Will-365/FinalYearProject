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

  const KpiSkeleton = () => <Skeleton className="h-28 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0d1f13]">Admin Dashboard</h2>
        <p className="text-gray-500 text-sm">Live operations overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingSummary ? [1, 2, 3, 4].map((i) => <KpiSkeleton key={i} />) : (
          <>
            {/* KPI 1 */}
            <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-blue-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-4 flex flex-row items-start justify-between">
                  <div className="space-y-1 z-10">
                    <CardTitle className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Total Requests</CardTitle>
                    <p className="text-[36px] font-bold text-gray-900 tracking-tight leading-none mt-2">{totalRequests}</p>
                  </div>
                  <div className="p-3 bg-blue-50/80 rounded-[14px] z-10">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="pb-5 z-10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[13px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ArrowUpRight className="h-3 w-3" /> All time
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPI 2 */}
            <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-amber-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-4 flex flex-row items-start justify-between">
                  <div className="space-y-1 z-10">
                    <CardTitle className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Pending / Assigned</CardTitle>
                    <p className="text-[36px] font-bold text-gray-900 tracking-tight leading-none mt-2">{pending}</p>
                  </div>
                  <div className="p-3 bg-amber-50/80 rounded-[14px] z-10">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent className="pb-5 z-10">
                  <Button variant="link" className="p-0 h-auto text-[13px] text-amber-700 font-medium hover:text-amber-800" onClick={() => goCollection()}>
                    Review pending requests →
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* KPI 3 */}
            <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-emerald-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-4 flex flex-row items-start justify-between">
                  <div className="space-y-1 z-10">
                    <CardTitle className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Active Collectors</CardTitle>
                    <p className="text-[36px] font-bold text-gray-900 tracking-tight leading-none mt-2">{activeCollectors}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/80 rounded-[14px] z-10">
                    <Truck className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="pb-5 z-10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[13px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" /> Online now
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPI 4 */}
            <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-indigo-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-4 flex flex-row items-start justify-between">
                  <div className="space-y-1 z-10">
                    <CardTitle className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Total Waste Collected</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <p className="text-[36px] font-bold text-gray-900 tracking-tight leading-none">{Number(totalKg).toLocaleString()}</p>
                      <span className="text-gray-500 font-medium">kg</span>
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50/80 rounded-[14px] z-10">
                    <Scale className="h-5 w-5 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent className="pb-5 z-10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[13px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      30d metrics
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {(['high', 'medium', 'low'] as const).map((p) => (
          <button key={p} type="button" onClick={() => goCollection(p)} className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 shadow-sm ${p === 'high' ? 'border-red-200 bg-red-50' : p === 'medium' ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
            <p className="text-xs font-semibold uppercase capitalize text-gray-500">{p} priority</p>
            <p className="text-2xl font-bold mt-1">{byPriority[p] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="rounded-[20px] border border-gray-200 shadow-sm lg:col-span-1">
          <CardHeader><CardTitle className="text-base font-semibold">Daily Requests (7d)</CardTitle></CardHeader>
          <CardContent className="h-64">
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
        <Card className="rounded-[20px] border border-gray-200 shadow-sm lg:col-span-1">
          <CardHeader><CardTitle className="text-base font-semibold">By Waste Type</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loadingSummary ? <Skeleton className="h-full rounded-[14px]" /> : wasteChart.length === 0 ? <p className="text-sm text-gray-400 text-center pt-20">No data</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={wasteChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4}>
                    {wasteChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-[20px] border border-gray-200 shadow-sm lg:col-span-1">
          <CardHeader><CardTitle className="text-base font-semibold">Intake by Category</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loadingIntake ? <Skeleton className="h-full rounded-[14px]" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="weight" fill="#059669" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Requests</CardTitle>
          {!loadingSummary && (
            <button type="button" onClick={loadSummary} className="text-xs text-gray-500 hover:text-green-600">Retry summary</button>
          )}
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
          ) : recent.length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm">No recent requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[15px] hidden md:table">
                <thead><tr className="border-b border-gray-200 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider"><th className="pb-3 pt-2">Resident</th><th className="pb-3 pt-2">Type</th><th className="pb-3 pt-2">Priority</th><th className="pb-3 pt-2">Status</th><th className="pb-3 pt-2">Date</th><th className="pb-3 pt-2 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {recent.map((r) => (
                    <tr key={r._id || r.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-medium text-gray-900">{r.resident?.fullName || r.residentName || '—'}</td>
                      <td><Badge className={wasteBadgeClass(r.wasteType)}>{r.wasteType}</Badge></td>
                      <td><Badge className={priorityBadgeClass(r.priority || 'medium')}>{r.priority || 'medium'}</Badge></td>
                      <td><Badge className={statusBadgeClass(r.status)}>{r.status?.replace('_', ' ')}</Badge></td>
                      <td className="text-gray-500">{formatAdminDate(r.preferredDate, r.preferredTimeSlot)}</td>
                      <td className="py-3 text-right">
                        {['pending', 'assigned'].includes(r.status) && (
                          <Button size="sm" variant="outline" className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setAssignId(r._id || r.id)}>Assign</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="md:hidden space-y-3">
                {recent.map((r) => (
                  <div key={r._id || r.id} className="rounded-xl border border-gray-100 p-3">
                    <p className="font-semibold">{r.resident?.fullName || 'Resident'}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge className={wasteBadgeClass(r.wasteType)}>{r.wasteType}</Badge>
                      <Badge className={statusBadgeClass(r.status)}>{r.status}</Badge>
                    </div>
                    {['pending', 'assigned'].includes(r.status) && (
                      <Button size="sm" className="mt-2 w-full bg-green-600" onClick={() => setAssignId(r._id || r.id)}>Assign</Button>
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
