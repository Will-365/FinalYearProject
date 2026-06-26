import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { adminWasteIntakeService, adminCatalogService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { formatKg, wasteBadgeClass } from '@/utils/adminHelpers';
import { rwandaLocations } from '@/app/data/rwandaLocations';
import { Scale, Plus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: '365d', label: '1 year' },
];

const WASTE_TYPES = ['organic', 'inorganic', 'recyclable', 'hazardous', 'mixed'];
const STATUS_OPTIONS = ['received', 'processing', 'processed', 'converted', 'disposed'];

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

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

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

  const convertToProduct = async (record: any) => {
    const id = record._id || record.id;
    try {
      const res = await adminCatalogService.createFromWaste(id, {});
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Product created', message: res.message || `✅ ${res.data?.product?.name} is now in the Eco Shop` });
        loadRecords();
        loadAnalytics();
      } else throw new Error(res.message);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };
  const updateStatus = async (id: string, processingStatus: string) => {
    try {
      await adminWasteIntakeService.setStatus(id, processingStatus);
      showToast({ type: 'success', title: 'Updated', message: `✅ Status changed to ${processingStatus}` });
      loadRecords();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
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
        {loadingAnalytics ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : (
          <>
            <Card className="rounded-2xl border-gray-100 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Weight</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatKg(totals.totalWeightKg)}</p></CardContent></Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Records</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totals.totalRecords ?? 0}</p></CardContent></Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Top Category</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold capitalize">{byCategory[0]?._id || '—'}</p></CardContent></Card>
            <Card className="rounded-2xl border-gray-100 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Avg Weight</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{byCategory[0]?.avgWeight ? formatKg(byCategory[0].avgWeight) : '—'}</p></CardContent></Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="text-base">By Category</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loadingAnalytics ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory.map((c: any) => ({ name: c._id, weight: c.totalWeightKg }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={80} /><Tooltip /><Bar dataKey="weight" fill="#16a34a" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="text-base">Daily Trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loadingAnalytics ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.map((t: any) => ({ date: t._id?.slice(5), weight: t.totalWeightKg }))}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader><CardTitle className="text-base">Intake Log</CardTitle></CardHeader>
        <CardContent>
          {loadingRecords ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center"><Scale className="h-10 w-10 mx-auto text-gray-300 mb-2" /><p className="font-medium">No waste intake logged for this period</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="py-2">Date</th><th>Type</th><th>Weight</th><th>District</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id || r.id} className="border-b border-gray-50">
                      <td className="py-2">{r.intakeDate?.slice(0, 10) || '—'}</td>
                      <td><Badge className={wasteBadgeClass(r.wasteType)}>{r.wasteType}</Badge></td>
                      <td>{formatKg(r.weightKg)}</td>
                      <td>{r.location?.district || '—'}</td>
                      <td>
                        <Select value={r.processingStatus} onValueChange={(v) => updateStatus(r._id || r.id, v)} disabled={r.processingStatus === 'converted'}>
                          <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td>
                        {r.processingStatus !== 'converted' && !r.product && (
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => convertToProduct(r)}>
                            → Create Product
                          </Button>
                        )}
                        {r.processingStatus === 'converted' && <Badge className="bg-green-100 text-green-800">In Shop</Badge>}
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
    </div>
  );
}
