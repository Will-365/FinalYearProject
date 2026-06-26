import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { adminCollectionService, adminCollectorService, adminWasteIntakeService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { formatKg } from '@/utils/adminHelpers';
import { Gift, Trophy, TrendingUp, Users, Truck, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminIncentiveManagement() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [intake, setIntake] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCollectors, setLoadingCollectors] = useState(true);
  const [loadingIntake, setLoadingIntake] = useState(true);

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

  const loadCollectors = useCallback(async () => {
    setLoadingCollectors(true);
    try {
      const res = await adminCollectorService.getAll({ limit: 10, sortBy: 'totalPickups' });
      if (res.success) {
        const list = res.data?.collectors || [];
        setCollectors([...list].sort((a, b) => (b.totalPickups || 0) - (a.totalPickups || 0)));
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoadingCollectors(false);
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

  useEffect(() => {
    loadSummary();
    loadCollectors();
    loadIntake();
  }, [loadSummary, loadCollectors, loadIntake]);

  const byStatus = summary?.byStatus || {};
  const completed = byStatus.completed || 0;
  const totalRequests = Object.values(byStatus).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
  const completionRate = totalRequests ? Math.round((completed / totalRequests) * 100) : 0;
  const pointsIssuedEstimate = completed * 15;
  const categoryChart = (intake?.byCategory || []).map((c: any) => ({
    name: c._id,
    weight: c.totalWeightKg,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0d1f13]">Incentives & Rewards</h2>
        <p className="text-sm text-gray-500">Platform engagement metrics and reward impact</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingSummary ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : (
          <>
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:-translate-y-0.5 transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-gray-500">Completed Pickups</CardTitle>
                <Truck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{completed}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" /> {completionRate}% completion</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:-translate-y-0.5 transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-gray-500">Est. Points Issued</CardTitle>
                <Gift className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{pointsIssuedEstimate.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Based on completed collections</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:-translate-y-0.5 transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-gray-500">Active Collectors</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{collectors.filter((c) => c.collectorStatus !== 'offline').length}</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:-translate-y-0.5 transition-all">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-gray-500">Waste Collected</CardTitle>
                <Scale className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatKg(intake?.totals?.totalWeightKg || 0)}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="collectors" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="collectors">Top Collectors</TabsTrigger>
          <TabsTrigger value="impact">Reward Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="collectors">
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Collector Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCollectors ? (
                <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
              ) : collectors.length === 0 ? (
                <div className="py-12 text-center">
                  <Truck className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="font-medium">No collectors yet</p>
                  <p className="text-sm text-gray-500">Add collectors to start tracking performance</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {collectors.slice(0, 10).map((c, i) => (
                    <div key={c._id || c.id} className="flex items-center gap-4 rounded-xl border border-gray-50 px-4 py-3 hover:bg-gray-50/50">
                      <span className={`w-8 text-center font-bold ${i < 3 ? 'text-amber-600' : 'text-gray-400'}`}>#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{c.fullName}</p>
                        <p className="text-xs text-gray-500">{c.collectorZone?.district || '—'}</p>
                      </div>
                      <Badge variant="outline">{c.totalPickups ?? 0} pickups</Badge>
                      <Badge className="capitalize">{c.collectorStatus?.replace('_', ' ') || 'offline'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact">
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardHeader><CardTitle className="text-base">Waste Collected by Category (30d)</CardTitle></CardHeader>
            <CardContent className="h-72">
              {loadingIntake ? <Skeleton className="h-full w-full" /> : categoryChart.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">No intake data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => [`${v} kg`, 'Weight']} />
                    <Bar dataKey="weight" fill="#16a34a" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-gray-100 shadow-sm mt-4">
            <CardHeader><CardTitle className="text-base">Points System Reference</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                {[
                  { action: 'Waste scan', pts: '+5 pts' },
                  { action: 'Confirm small collection', pts: '+10 pts' },
                  { action: 'Confirm medium collection', pts: '+20 pts' },
                  { action: 'Confirm large collection', pts: '+30 pts' },
                  { action: 'Claim coupon', pts: 'Deducts coupon cost' },
                ].map((row) => (
                  <div key={row.action} className="flex justify-between rounded-xl bg-green-50 px-4 py-2">
                    <dt className="text-gray-700">{row.action}</dt>
                    <dd className="font-bold text-green-700">{row.pts}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-gray-400 mt-4">Resident coupon catalog is managed via database seeds. Residents redeem via the Coupons page.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
