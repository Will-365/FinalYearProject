import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { adminWasteIntakeService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { formatKg, wasteBadgeClass } from '@/utils/adminHelpers';
import { rwandaLocations } from '@/app/data/rwandaLocations';
import { Scale, Plus, Package, CheckCircle2, ArrowUpRight, TrendingUp, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: '365d', label: '1 year' },
];

const WASTE_TYPES = ['organic', 'inorganic', 'recyclable', 'hazardous', 'mixed'];
const STATUS_OPTIONS = ['received', 'sorting', 'curing', 'forming', 'packaging', 'product', 'disposed'];

export function WasteIntakeTab() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState('30d');
  const [district, setDistrict] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [logOpen, setLogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [convertModal, setConvertModal] = useState<any>({ open: false, item: null });
  const [convertData, setConvertData] = useState({ name: '', category: '', cashPrice: '', pointsCost: '', stock: '', description: '', imageUrl: '' });
  const [converting, setConverting] = useState(false);

  // Discrepancy resolution
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const [loadingDisc, setLoadingDisc] = useState(true);
  const [resolveModal, setResolveModal] = useState<any>({ open: false, item: null });
  const [resolveForm, setResolveForm] = useState({ resolution: 'award_full', pointsOverride: '', adminNote: '' });
  const [resolving, setResolving] = useState(false);
  const [form, setForm] = useState({
    wasteType: 'organic',
    weightKg: '',
    volumeLiters: '',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: '',
    intakeDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const districts = Object.keys(rwandaLocations['Kigali City'] || {});

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await adminWasteIntakeService.getAnalytics({ period, district: district || undefined });
      setAnalytics(res.success ? res.data : res);
    } catch {
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [period, district]);

  const loadRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const res = await adminWasteIntakeService.getAll({ page, limit: 10, district: district || undefined });
      const d = res.success ? res.data : res;
      setRecords(d?.records || d?.items || []);
      setTotalPages(d?.pagination?.totalPages || 1);
    } catch {
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, [page, district]);

  const loadDiscrepancies = async () => {
    setLoadingDisc(true);
    try {
      const res = await adminWasteIntakeService.getDiscrepancies({ resolved: 'false', limit: 50 });
      const d = res.success ? res.data : res;
      setDiscrepancies(d?.records || []);
    } catch {
      setDiscrepancies([]);
    } finally {
      setLoadingDisc(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => { loadRecords(); }, [loadRecords]);
  useEffect(() => { loadDiscrepancies(); }, []);

  const logIntake = async () => {
    if (!form.weightKg) return;
    setSubmitting(true);
    try {
      const res = await adminWasteIntakeService.create({
        wasteType: form.wasteType,
        weightKg: parseFloat(form.weightKg),
        volumeLiters: form.volumeLiters ? parseFloat(form.volumeLiters) : undefined,
        location: { province: form.province, district: form.district, sector: form.sector || undefined },
        intakeDate: form.intakeDate,
        notes: form.notes || undefined,
      });
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Logged', message: `✅ Intake recorded — ${form.weightKg}kg of ${form.wasteType} waste logged` });
        setLogOpen(false);
        loadAnalytics();
        loadRecords();
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const convertToProduct = (record: any) => {
    setConvertModal({ open: true, item: record });
    setConvertData({ name: '', category: '', cashPrice: '', pointsCost: '', stock: '', description: '', imageUrl: '' });
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertModal.item) return;
    setConverting(true);
    try {
      const res = await adminWasteIntakeService.convertToProduct(convertModal.item._id || convertModal.item.id, {
        name: convertData.name,
        category: convertData.category,
        cashPrice: Number(convertData.cashPrice),
        pointsCost: Number(convertData.pointsCost),
        stock: Number(convertData.stock),
        description: convertData.description,
        imageUrl: convertData.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80'
      });
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Product created', message: res.message || `✅ Product is now in the Eco Shop` });
        setConvertModal({ open: false, item: null });
        loadRecords();
        loadAnalytics();
      } else throw new Error(res.message);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setConverting(false);
    }
  };
  const updateStatus = async (id: string, processingStatus: string) => {
    try {
      await adminWasteIntakeService.advanceStage(id, { stage: processingStatus });
      showToast({ type: 'success', title: 'Updated', message: `✅ Status changed to ${processingStatus}` });
      loadRecords();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModal.item) return;
    setResolving(true);
    try {
      const res = await adminWasteIntakeService.resolveDiscrepancy(resolveModal.item._id, {
        resolution: resolveForm.resolution,
        pointsOverride: resolveForm.pointsOverride ? Number(resolveForm.pointsOverride) : undefined,
        adminNote: resolveForm.adminNote || undefined,
      });
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Resolved', message: res.message || 'Discrepancy resolved successfully' });
        setResolveModal({ open: false, item: null });
        loadDiscrepancies();
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setResolving(false);
    }
  };

  const totals = analytics?.totals || {};
  const byCategory = analytics?.byCategory || [];
  const trend = analytics?.trend || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0d1f13]">Waste Intake</h2>
          <p className="text-sm text-gray-500">Track waste received and processing status</p>
        </div>
        <Button onClick={() => setLogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" /> Log Intake
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {PERIODS.map((p) => (
          <button key={p.id} type="button" onClick={() => setPeriod(p.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${period === p.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{p.label}</button>
        ))}
        <Select value={district || 'all'} onValueChange={(v) => setDistrict(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All districts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All districts</SelectItem>
            {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingAnalytics ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-[20px]" />) : (
          <>
            <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-emerald-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-4 flex flex-row items-start justify-between">
                  <div className="space-y-1 z-10">
                    <CardTitle className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Total Weight</CardTitle>
                    <p className="text-[36px] font-bold text-gray-900 tracking-tight leading-none mt-2">{formatKg(totals.totalWeightKg)}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/80 rounded-[14px] z-10">
                    <Scale className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
              </Card>
            </div>

            <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-blue-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-4 flex flex-row items-start justify-between">
                  <div className="space-y-1 z-10">
                    <CardTitle className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Records</CardTitle>
                    <p className="text-[36px] font-bold text-gray-900 tracking-tight leading-none mt-2">{totals.totalRecords ?? 0}</p>
                  </div>
                  <div className="p-3 bg-blue-50/80 rounded-[14px] z-10">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
              </Card>
            </div>

            <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-amber-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-4 flex flex-row items-start justify-between">
                  <div className="space-y-1 z-10">
                    <CardTitle className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Top Category</CardTitle>
                    <p className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight mt-2 capitalize truncate">{byCategory[0]?._id || '—'}</p>
                  </div>
                  <div className="p-3 bg-amber-50/80 rounded-[14px] z-10">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                </CardHeader>
              </Card>
            </div>

            <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-purple-500/20 hover:to-transparent transition-all duration-300">
              <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                <CardHeader className="pb-4 flex flex-row items-start justify-between">
                  <div className="space-y-1 z-10">
                    <CardTitle className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Avg Weight</CardTitle>
                    <p className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight mt-2">{byCategory[0]?.avgWeight ? formatKg(byCategory[0].avgWeight) : '—'}</p>
                  </div>
                  <div className="p-3 bg-purple-50/80 rounded-[14px] z-10">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
              </Card>
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-[20px] border border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="text-base font-semibold">By Category</CardTitle></CardHeader>
          <CardContent className="h-72">
            {loadingAnalytics ? <Skeleton className="h-full w-full rounded-[14px]" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory.map((c: any) => ({ name: c._id, weight: c.totalWeightKg }))} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="name" width={90} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} className="capitalize" />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="weight" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-[20px] border border-gray-200 shadow-sm">
          <CardHeader><CardTitle className="text-base font-semibold">Daily Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            {loadingAnalytics ? <Skeleton className="h-full w-full rounded-[14px]" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend.map((t: any) => ({ date: t._id?.slice(5), weight: t.totalWeightKg }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Discrepancy Review Section ─────────────────────────── */}
      <Card className="rounded-[20px] border border-red-200 shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Discrepancy Review</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Collector-reported quantity mismatches requiring resolution before approval</p>
            </div>
          </div>
          {!loadingDisc && discrepancies.length > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">{discrepancies.length} pending</span>
          )}
        </CardHeader>
        <CardContent>
          {loadingDisc ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl" />)}</div>
          ) : discrepancies.length === 0 ? (
            <div className="py-10 text-center">
              <ShieldCheck className="h-10 w-10 mx-auto text-green-400 mb-2" />
              <p className="font-medium text-gray-500">No pending discrepancies</p>
              <p className="text-sm text-gray-400 mt-1">All collector reports have been resolved</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pt-2">Date</th>
                    <th className="pb-3 pt-2">Resident</th>
                    <th className="pb-3 pt-2">Waste Type</th>
                    <th className="pb-3 pt-2">Weight</th>
                    <th className="pb-3 pt-2">Collector Note</th>
                    <th className="pb-3 pt-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discrepancies.map((d) => (
                    <tr key={d._id} className="group hover:bg-red-50/30 transition-colors">
                      <td className="py-3 font-medium text-gray-900">{d.intakeDate?.slice(0,10) || '—'}</td>
                      <td className="py-3 text-gray-700">{d.collectionRequest?.resident?.fullName || '—'}</td>
                      <td className="py-3"><span className="capitalize">{d.wasteType}</span></td>
                      <td className="py-3">{d.weightKg} kg{d.actualWeightKg ? ` (actual: ${d.actualWeightKg} kg)` : ''}</td>
                      <td className="py-3 max-w-[200px]">
                        <span className="text-xs italic text-gray-600 line-clamp-2">
                          {d.discrepancyNote || <span className="text-gray-400">No note provided</span>}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                          onClick={() => { setResolveModal({ open: true, item: d }); setResolveForm({ resolution: 'award_full', pointsOverride: '', adminNote: '' }); }}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Resolve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[20px] border border-gray-200 shadow-sm">
        <CardHeader><CardTitle className="text-base font-semibold">Intake Log</CardTitle></CardHeader>
        <CardContent>
          {loadingRecords ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-[14px]" />)}</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center"><Scale className="h-10 w-10 mx-auto text-gray-300 mb-2" /><p className="font-medium text-gray-500">No waste intake logged for this period</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[15px]">
                <thead><tr className="border-b border-gray-200 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider"><th className="pb-3 pt-2">Date</th><th className="pb-3 pt-2">Type</th><th className="pb-3 pt-2">Weight</th><th className="pb-3 pt-2">District</th><th className="pb-3 pt-2">Status</th><th className="pb-3 pt-2 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((r) => (
                    <tr key={r._id || r.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-medium text-gray-900">{r.intakeDate?.slice(0, 10) || '—'}</td>
                      <td><Badge className={wasteBadgeClass(r.wasteType)}>{r.wasteType}</Badge></td>
                      <td>{formatKg(r.weightKg)}</td>
                      <td>{r.location?.district || '—'}</td>
                      <td className="py-3">
                        <Select value={r.processingStatus} onValueChange={(v) => updateStatus(r._id || r.id, v)} disabled={r.convertedToProduct === true}>
                          <SelectTrigger className="h-9 w-36 bg-white shadow-sm rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 text-right">
                        {!r.convertedToProduct && r.processingStatus === 'packaging' && (
                          <Button size="sm" variant="outline" className="text-xs border-emerald-500 text-emerald-700 hover:bg-emerald-50" onClick={() => convertToProduct(r)}>
                            → Create Product
                          </Button>
                        )}
                        {r.convertedToProduct && <Badge className="bg-green-100 text-green-800">✅ In Shop</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-sm font-medium disabled:opacity-40">Previous</button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="text-sm font-medium disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Log Waste Intake</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Waste type</Label>
              <Select value={form.wasteType} onValueChange={(v) => setForm((f) => ({ ...f, wasteType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{WASTE_TYPES.map((w) => <SelectItem key={w} value={w} className="capitalize">{w}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Weight (kg) *</Label><Input type="number" step="0.1" value={form.weightKg} onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))} className="mt-1" /></div>
            <div><Label>Volume (L)</Label><Input type="number" value={form.volumeLiters} onChange={(e) => setForm((f) => ({ ...f, volumeLiters: e.target.value }))} className="mt-1" /></div>
            <div><Label>Date</Label><Input type="date" value={form.intakeDate} onChange={(e) => setForm((f) => ({ ...f, intakeDate: e.target.value }))} className="mt-1" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1" /></div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setLogOpen(false)} className="flex-1">Cancel</Button>
            <Button disabled={submitting} onClick={logIntake} className="flex-1 bg-green-600">{submitting ? 'Saving…' : 'Log Intake'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert to Product Modal */}
      <Dialog open={convertModal.open} onOpenChange={o => !o && setConvertModal({ open: false, item: null })}>
        <DialogContent aria-describedby={undefined} className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Convert to Catalog Product
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConvert} className="space-y-4 py-4">
            <div className="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-800 mb-4 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <p>You are converting <strong>{convertModal.item?.weightKg}kg</strong> of {convertModal.item?.wasteType} waste into a new product.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input required value={convertData.name} onChange={e => setConvertData({...convertData, name: e.target.value})} placeholder="E.g. Recycled Paver Block" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input value={convertData.imageUrl} onChange={e => setConvertData({...convertData, imageUrl: e.target.value})} placeholder="Optional: https://..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select required value={convertData.category} onChange={e => setConvertData({...convertData, category: e.target.value})} className="w-full h-10 rounded-md border border-input px-3">
                  <option value="">Select...</option>
                  <option value="compost">Compost</option>
                  <option value="pavers">Pavers</option>
                  <option value="recycled_goods">Recycled Goods</option>
                  <option value="upcycled">Upcycled</option>
                  <option value="eco_product">Eco Product</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Stock</label>
                <Input required type="number" min="1" value={convertData.stock} onChange={e => setConvertData({...convertData, stock: e.target.value})} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cash Price (RWF)</label>
                <Input required type="number" min="0" value={convertData.cashPrice} onChange={e => setConvertData({...convertData, cashPrice: e.target.value})} placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Points Cost</label>
                <Input required type="number" min="0" value={convertData.pointsCost} onChange={e => setConvertData({...convertData, pointsCost: e.target.value})} placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={convertData.description} onChange={e => setConvertData({...convertData, description: e.target.value})} placeholder="Product details..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConvertModal({ open: false, item: null })}>Cancel</Button>
              <Button type="submit" disabled={converting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {converting ? 'Converting...' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* ─── Resolve Discrepancy Modal ───────────────────────────── */}
      <Dialog open={resolveModal.open} onOpenChange={o => !o && setResolveModal({ open: false, item: null })}>
        <DialogContent aria-describedby={undefined} className="max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-600" />
              Resolve Discrepancy
            </DialogTitle>
          </DialogHeader>
          {resolveModal.item && (
            <form onSubmit={handleResolve} className="space-y-4 py-2">
              {/* Collector note context */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-1">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Collector's Report</p>
                <p className="text-sm text-gray-700 italic">"{resolveModal.item.discrepancyNote || 'No note provided'}"
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-600">
                  <span>Logged: <strong>{resolveModal.item.weightKg} kg</strong></span>
                  {resolveModal.item.actualWeightKg && <span>Actual: <strong>{resolveModal.item.actualWeightKg} kg</strong></span>}
                  <span>Resident: <strong>{resolveModal.item.collectionRequest?.resident?.fullName || '—'}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Resolution Decision *</Label>
                <Select value={resolveForm.resolution} onValueChange={v => setResolveForm(f => ({ ...f, resolution: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="award_full">Award Full Points — amount is correct</SelectItem>
                    <SelectItem value="award_less">Award Reduced Points — amount was less</SelectItem>
                    <SelectItem value="award_more">Award Bonus Points — amount was more</SelectItem>
                    <SelectItem value="no_change">No Points — reject / no award</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {resolveForm.resolution !== 'no_change' && (
                <div className="space-y-2">
                  <Label className="text-sm">Points Override <span className="text-gray-400 font-normal">(optional — leave blank to use default)</span></Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    value={resolveForm.pointsOverride}
                    onChange={e => setResolveForm(f => ({ ...f, pointsOverride: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm">Admin Note <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea
                  placeholder="Internal note about this resolution..."
                  value={resolveForm.adminNote}
                  onChange={e => setResolveForm(f => ({ ...f, adminNote: e.target.value }))}
                  className="rounded-xl resize-none"
                  rows={2}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setResolveModal({ open: false, item: null })}>Cancel</Button>
                <Button type="submit" disabled={resolving} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  {resolving ? 'Resolving…' : 'Confirm Resolution'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
