import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { adminCollectionService } from '@/services/adminService';
import { useDebounce, formatAdminDate, priorityBadgeClass, statusBadgeClass, wasteBadgeClass, normalizeCollectionRequest, getTotalPages } from '@/utils/adminHelpers';
import { useToast } from '@/hooks/useToast';
import { AssignPickupModal } from '@/app/components/admin/AssignPickupModal';
import { SetPriorityModal } from '@/app/components/admin/SetPriorityModal';
import { RequestDetailSheet } from '@/app/components/admin/RequestDetailSheet';
import { ClipboardList, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';

export function AdminCollectionManagement() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [unassigned, setUnassigned] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [assignId, setAssignId] = useState<string | null>(null);
  const [priorityId, setPriorityId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [awaitingRewardCount, setAwaitingRewardCount] = useState(0);
  const [awaitingRewardOnly, setAwaitingRewardOnly] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const saved = sessionStorage.getItem('adminCollectionFilters');
    if (saved) {
      try {
        const f = JSON.parse(saved);
        if (f.priority) setPriority(f.priority);
        sessionStorage.removeItem('adminCollectionFilters');
      } catch { /* ignore */ }
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCollectionService.getAll({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        status: status || undefined,
        priority: priority || undefined,
        wasteType: wasteType || undefined,
        unassigned: unassigned ? 'true' : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        adminApproved: awaitingRewardOnly ? 'false' : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (res.success) {
        const d = res.data;
        setRequests((d?.requests || d?.items || []).map(normalizeCollectionRequest));
        setTotalPages(getTotalPages(d?.pagination));
        setTotal(d?.pagination?.total || 0);
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, priority, wasteType, unassigned, dateFrom, dateTo, awaitingRewardOnly, showToast]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    adminCollectionService.getSummary().then((res) => {
      if (res.success) setPendingCount(res.data?.byStatus?.pending || 0);
    }).catch(() => {});
    adminCollectionService.getAll({ status: 'completed', adminApproved: 'false', limit: 1 }).then((res) => {
      if (res.success) setAwaitingRewardCount(res.data?.pagination?.total || 0);
    }).catch(() => {});
  }, [requests]);

  const showAwaitingReward = () => {
    resetFilters();
    setStatus('completed');
    setAwaitingRewardOnly(true);
    setPage(1);
  };

  const showPendingOnly = () => {
    resetFilters();
    setStatus('pending');
    setPage(1);
  };

  const resetFilters = () => {
    setAwaitingRewardOnly(false);
    setSearch(''); setStatus(''); setPriority(''); setWasteType('');
    setUnassigned(false); setDateFrom(''); setDateTo(''); setPage(1);
  };

  const handleUnassign = async () => {
    if (!unassignTarget) return;
    const id = unassignTarget._id || unassignTarget.id;
    try {
      const res = await adminCollectionService.unassign(id);
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Unassigned', message: 'Request returned to pending' });
        setUnassignTarget(null);
        fetchRequests();
      } else showToast({ type: 'error', title: 'Error', message: res.message });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const prev = [...requests];
    setRequests((rs) => rs.map((r) => (r._id === id || r.id === id ? { ...r, status: newStatus } : r)));
    try {
      const res = await adminCollectionService.setStatus(id, { status: newStatus });
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Updated', message: `✅ Status changed to ${newStatus.replace('_', ' ')}` });
        fetchRequests();
      } else throw new Error(res.message);
    } catch (err: any) {
      setRequests(prev);
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const RowActions = ({ req }: { req: any }) => {
    const id = req._id || req.id;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDetailId(id)}>View Details</DropdownMenuItem>
          {['pending', 'assigned'].includes(req.status) && <DropdownMenuItem onClick={() => setAssignId(id)}>Assign Collector</DropdownMenuItem>}
          <DropdownMenuItem onClick={() => setPriorityId(id)}>Change Priority</DropdownMenuItem>
          {req.collector && <DropdownMenuItem onClick={() => setUnassignTarget(req)}>Unassign</DropdownMenuItem>}
          {req.status === 'assigned' && <DropdownMenuItem onClick={() => updateStatus(id, 'in_progress')}>Mark In Progress</DropdownMenuItem>}
          {req.status === 'completed' && !req.adminApproved && (
            <DropdownMenuItem onClick={() => setDetailId(id)}>Approve & reward coupon</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1f13]">Collection Management</h2>
          <p className="text-sm text-gray-500">Assign, prioritize, and track pickup requests</p>
        </div>
        {awaitingRewardCount > 0 && (
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={showAwaitingReward}>
            {awaitingRewardCount} Awaiting reward — Approve now
          </Button>
        )}
        {pendingCount > 0 && (
          <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={showPendingOnly}>
            {pendingCount} Pending — Review Now
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'pending', 'assigned', 'in_progress', 'completed'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${status === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s ? s.replace('_', ' ') : 'All'}
            {s === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
            <Input placeholder="Search resident…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="md:col-span-2" />
            <Select value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority || 'all'} onValueChange={(v) => { setPriority(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {['high', 'medium', 'low'].map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={wasteType || 'all'} onValueChange={(v) => { setWasteType(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Waste type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {['organic', 'inorganic', 'recyclable', 'hazardous', 'mixed'].map((w) => <SelectItem key={w} value={w} className="capitalize">{w}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2"><Switch checked={unassigned} onCheckedChange={(v) => { setUnassigned(v); setPage(1); }} id="unassigned" /><Label htmlFor="unassigned" className="text-sm">Unassigned only</Label></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            <Button variant="outline" size="sm" onClick={resetFilters}>Reset filters</Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">Showing page {page} · {total || requests.length} results</p>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="font-medium">No collection requests match your filters</p>
          <Button variant="link" onClick={resetFilters}>Clear filters</Button>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr className="text-left text-gray-500">
                <th className="p-3">Resident</th><th>Type</th><th>Qty</th><th>Priority</th><th>Status</th><th>Reward</th><th>Date</th><th>District</th><th>Collector</th><th></th>
              </tr></thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id || r.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="p-3 font-medium">{r.resident?.fullName || '—'}</td>
                    <td><Badge className={wasteBadgeClass(r.wasteType)}>{r.wasteType}</Badge></td>
                    <td className="capitalize">{r.quantity}</td>
                    <td><Badge className={priorityBadgeClass(r.priority || 'medium')}>{r.priority || 'medium'}</Badge></td>
                    <td><Badge className={statusBadgeClass(r.status)}>{r.status?.replace('_', ' ')}</Badge></td>
                    <td>{r.adminApproved ? <Badge className="bg-green-100 text-green-800">Rewarded</Badge> : r.status === 'completed' ? <Badge className="bg-amber-100 text-amber-800">Awaiting approval</Badge> : '—'}</td>
                    <td className="text-gray-500 whitespace-nowrap">{formatAdminDate(r.preferredDate, r.preferredTimeSlot)}</td>
                    <td>{r.location?.district || '—'}</td>
                    <td>{r.collector?.fullName || '—'}</td>
                    <td><RowActions req={r} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {requests.map((r) => (
              <Card key={r._id || r.id} className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2 flex flex-row justify-between">
                  <CardTitle className="text-base">{r.resident?.fullName}</CardTitle>
                  <RowActions req={r} />
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 text-sm">
                  <Badge className={wasteBadgeClass(r.wasteType)}>{r.wasteType}</Badge>
                  <Badge className={priorityBadgeClass(r.priority || 'medium')}>{r.priority || 'medium'}</Badge>
                  <Badge className={statusBadgeClass(r.status)}>{r.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </>
      )}

      <AssignPickupModal open={Boolean(assignId)} onClose={() => setAssignId(null)} requestId={assignId} onSuccess={fetchRequests} />
      <SetPriorityModal open={Boolean(priorityId)} onClose={() => setPriorityId(null)} requestId={priorityId} onSuccess={fetchRequests} />
      <RequestDetailSheet open={Boolean(detailId)} onClose={() => setDetailId(null)} requestId={detailId} onRefresh={fetchRequests} />
      <Dialog open={Boolean(unassignTarget)} onOpenChange={() => setUnassignTarget(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Unassign collector?</DialogTitle>
            <DialogDescription>
              Remove {unassignTarget?.collector?.fullName || 'collector'} from this request? The request will return to Pending status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setUnassignTarget(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleUnassign}>Unassign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
