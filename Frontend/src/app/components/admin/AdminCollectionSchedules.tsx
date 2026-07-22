import { useCallback, useEffect, useState } from 'react';
import { adminScheduleService, adminCollectorService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { useDebounce, formatAdminDate, getTotalPages } from '@/utils/adminHelpers';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { CalendarDays, Plus, Pencil, Trash2, Loader2, Clock } from 'lucide-react';

const DISTRICTS = [
  'Gasabo', 'Kicukiro', 'Nyarugenge',
  'Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo',
  'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango',
  'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana',
  'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro',
];

const WASTE_TYPES = ['organic', 'inorganic', 'recyclable', 'hazardous', 'mixed'];

const EMPTY_FORM = {
  title: '',
  district: '',
  province: '',
  sector: '',
  scheduledDate: '',
  startTime: '08:00',
  endTime: '12:00',
  timeSlot: 'morning',
  wasteTypes: ['mixed'],
  collectorId: '',
  notes: '',
  status: 'upcoming',
};

const statusClass = {
  upcoming: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-slate-100 text-slate-600',
};

function formatTimeRange(s) {
  if (s.startTime && s.endTime) return `${s.startTime} – ${s.endTime}`;
  if (s.startTime) return s.startTime;
  return s.timeSlot ? s.timeSlot.replace('_', ' ') : '—';
}

export function AdminCollectionSchedules() {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminScheduleService.getAll({
        page,
        limit: 20,
        district: district || undefined,
        status: status || undefined,
      });
      const d = res.data || res;
      let list = d.schedules || [];
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        list = list.filter(
          (s) =>
            s.title?.toLowerCase().includes(q) ||
            s.zone?.district?.toLowerCase().includes(q) ||
            s.zone?.sector?.toLowerCase().includes(q) ||
            s.collector?.fullName?.toLowerCase().includes(q)
        );
      }
      setSchedules(list);
      setTotalPages(getTotalPages(d.pagination) || 1);
      setTotal(d.pagination?.total || list.length);
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [page, district, status, debouncedSearch, showToast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    adminCollectorService.getAll({ limit: 100 }).then((res) => {
      setCollectors(res.success ? res.data?.collectors || [] : res.collectors || []);
    }).catch(() => {});
  }, []);

  useEffect(() => { setPage(1); }, [district, status, debouncedSearch]);

  const openCreate = () => {
    setEditId(null);
    setForm({
      ...EMPTY_FORM,
      scheduledDate: new Date().toISOString().slice(0, 10),
    });
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setEditId(s._id);
    setForm({
      title: s.title || '',
      district: s.zone?.district || '',
      province: s.zone?.province || '',
      sector: s.zone?.sector || '',
      scheduledDate: s.scheduledDate ? new Date(s.scheduledDate).toISOString().slice(0, 10) : '',
      startTime: s.startTime || '08:00',
      endTime: s.endTime || '12:00',
      timeSlot: s.timeSlot || 'morning',
      wasteTypes: s.wasteTypes?.length ? s.wasteTypes : ['mixed'],
      collectorId: s.collector?._id || s.collector || '',
      notes: s.notes || '',
      status: s.status || 'upcoming',
    });
    setDialogOpen(true);
  };

  const toggleWaste = (type) => {
    setForm((f) => {
      const has = f.wasteTypes.includes(type);
      const next = has ? f.wasteTypes.filter((t) => t !== type) : [...f.wasteTypes, type];
      return { ...f, wasteTypes: next.length ? next : ['mixed'] };
    });
  };

  const save = async () => {
    if (!form.district || !form.scheduledDate) {
      showToast({ type: 'error', title: 'Missing fields', message: 'District and date are required' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title || `Collection — ${form.district}`,
        district: form.district,
        province: form.province,
        sector: form.sector,
        scheduledDate: form.scheduledDate,
        startTime: form.startTime,
        endTime: form.endTime,
        timeSlot: form.timeSlot,
        wasteTypes: form.wasteTypes,
        collectorId: form.collectorId || null,
        notes: form.notes,
        status: form.status,
      };
      const res = editId
        ? await adminScheduleService.update(editId, payload)
        : await adminScheduleService.create(payload);
      if (res.success === false) throw new Error(res.message);
      showToast({
        type: 'success',
        title: editId ? 'Updated' : 'Created',
        message: editId ? 'Schedule updated' : 'Schedule published for residents',
      });
      setDialogOpen(false);
      load();
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      const res = await adminScheduleService.remove(deleteTarget._id);
      if (res.success === false) throw new Error(res.message);
      showToast({ type: 'success', title: 'Removed', message: res.message || 'Schedule removed' });
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">District collection schedules</h3>
          <p className="text-sm text-slate-500">Set dates and times residents will see under Schedules</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add schedule
        </Button>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, district, collector…"
            className="flex-1"
          />
          <Select value={district || 'all'} onValueChange={(v) => setDistrict(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="District" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">District</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Waste</th>
                <th className="px-4 py-3 font-semibold">Collector</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t"><td colSpan={8} className="px-4 py-3"><Skeleton className="h-9 w-full" /></td></tr>
                ))
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <CalendarDays className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                    <p className="font-medium text-slate-800">No schedules yet</p>
                    <p className="text-xs text-slate-500">Add a district collection date and time for residents</p>
                  </td>
                </tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s._id} className="border-t border-gray-50 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{formatAdminDate(s.scheduledDate)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-green-600" />
                        {formatTimeRange(s)}
                      </span>
                      <p className="text-[11px] capitalize text-slate-400">{s.timeSlot}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{s.zone?.district || '—'}</p>
                      <p className="text-xs text-slate-400">{s.zone?.sector || s.zone?.province || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">{s.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(s.wasteTypes || []).map((w) => (
                          <Badge key={w} variant="outline" className="text-[10px] capitalize">{w}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.collector?.fullName || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusClass[s.status] || statusClass.upcoming}>
                        {(s.status || 'upcoming').replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
          <p className="text-slate-500">{total} schedules</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="flex items-center px-2 text-slate-600">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit schedule' : 'Add collection schedule'}</DialogTitle>
            <DialogDescription>Residents in this district will see it under Schedules</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Gasabo weekly organic pickup"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>District *</Label>
                <Select value={form.district} onValueChange={(v) => setForm((f) => ({ ...f, district: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sector (optional)</Label>
                <Input className="mt-1" value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} placeholder="e.g. Kacyiru" />
              </div>
            </div>
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                className="mt-1"
                value={form.scheduledDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start time</Label>
                <Input type="time" className="mt-1" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div>
                <Label>End time</Label>
                <Input type="time" className="mt-1" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Time slot</Label>
              <Select value={form.timeSlot} onValueChange={(v) => setForm((f) => ({ ...f, timeSlot: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Waste types</Label>
              <div className="flex flex-wrap gap-2">
                {WASTE_TYPES.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => toggleWaste(w)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize border ${
                      form.wasteTypes.includes(w)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Collector (optional)</Label>
              <Select
                value={form.collectorId || 'none'}
                onValueChange={(v) => setForm((f) => ({ ...f, collectorId: v === 'none' ? '' : v }))}
              >
                <SelectTrigger className="mt-1"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {collectors.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editId && (
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea className="mt-1" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editId ? 'Save changes' : 'Publish schedule')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Remove schedule?</DialogTitle>
            <DialogDescription>
              Cancel <span className="font-semibold">{deleteTarget?.title}</span> for{' '}
              {deleteTarget?.zone?.district}. Residents will no longer see it as upcoming.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" disabled={deleting} onClick={() => setDeleteTarget(null)}>Keep</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={deleting} onClick={remove}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
