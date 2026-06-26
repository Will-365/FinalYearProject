import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { adminCollectionService, adminWasteIntakeService, adminCollectorService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { formatAdminDate, priorityBadgeClass, statusBadgeClass, wasteBadgeClass, normalizeCollectionRequest, getTotalPages } from '@/utils/adminHelpers';
import { AssignPickupModal } from '@/app/components/admin/AssignPickupModal';
import { TrendingUp, Truck, ClipboardList, Scale, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:-translate-y-0.5 transition-all bg-blue-50/50">
              <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm text-gray-600">Total Requests</CardTitle><ClipboardList className="h-4 w-4 text-blue-600" /></CardHeader>
              <CardContent><p className="text-3xl font-bold">{totalRequests}</p><p className="text-xs text-green-600 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" /> All time</p></CardContent>
            </Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:-translate-y-0.5 transition-all bg-amber-50/50">
              <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm text-gray-600">Pending / Assigned</CardTitle><AlertTriangle className="h-4 w-4 text-amber-600" /></CardHeader>
              <CardContent><p className="text-3xl font-bold">{pending}</p><Button variant="link" className="p-0 h-auto text-xs text-green-600" onClick={() => goCollection()}>View requests →</Button></CardContent>
            </Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:-translate-y-0.5 transition-all bg-green-50/50">
              <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm text-gray-600">Active Collectors</CardTitle><Truck className="h-4 w-4 text-green-600" /></CardHeader>
              <CardContent><p className="text-3xl font-bold">{activeCollectors}</p></CardContent>
            </Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:-translate-y-0.5 transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm text-gray-600">Waste Collected</CardTitle><Scale className="h-4 w-4 text-emerald-600" /></CardHeader>
              <CardContent><p className="text-3xl font-bold">{Number(totalKg).toLocaleString()} <span className="text-lg font-normal">kg</span></p></CardContent>
            </Card>
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
        <Card className="rounded-2xl border-gray-100 shadow-sm lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Daily Requests (7d)</CardTitle></CardHeader>
          <CardContent className="h-56">
            {loadingSummary ? <Skeleton className="h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#16a34a" radius={4} /></BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-sm lg:col-span-1">
          <CardHeader><CardTitle className="text-base">By Waste Type</CardTitle></CardHeader>
          <CardContent className="h-56">
            {loadingSummary ? <Skeleton className="h-full" /> : wasteChart.length === 0 ? <p className="text-sm text-gray-400 text-center pt-16">No data</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={wasteChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>{wasteChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-sm lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Intake by Category</CardTitle></CardHeader>
          <CardContent className="h-56">
            {loadingIntake ? <Skeleton className="h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="weight" fill="#059669" radius={4} /></BarChart>
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
              <table className="w-full text-sm hidden md:table">
                <thead><tr className="border-b text-left text-gray-500"><th className="py-2">Resident</th><th>Type</th><th>Priority</th><th>Status</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r._id || r.id} className="border-b border-gray-50">
                      <td className="py-2 font-medium">{r.resident?.fullName || r.residentName || '—'}</td>
                      <td><Badge className={wasteBadgeClass(r.wasteType)}>{r.wasteType}</Badge></td>
                      <td><Badge className={priorityBadgeClass(r.priority || 'medium')}>{r.priority || 'medium'}</Badge></td>
                      <td><Badge className={statusBadgeClass(r.status)}>{r.status?.replace('_', ' ')}</Badge></td>
                      <td className="text-gray-500">{formatAdminDate(r.preferredDate, r.preferredTimeSlot)}</td>
                      <td>
                        {['pending', 'assigned'].includes(r.status) && (
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => setAssignId(r._id || r.id)}>Assign</Button>
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
