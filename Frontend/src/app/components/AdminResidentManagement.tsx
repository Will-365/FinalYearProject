import { useCallback, useEffect, useState } from 'react';
import { adminResidentService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { useDebounce, getInitials, getTotalPages, formatAdminDate } from '@/utils/adminHelpers';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Users, Search, Trash2, MapPin, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

const DISTRICTS = [
  'Gasabo', 'Kicukiro', 'Nyarugenge',
  'Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo',
  'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango',
  'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana',
  'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro',
];

export function AdminResidentManagement() {
  const { showToast } = useToast();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [verified, setVerified] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminResidentService.getAll({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        district: district || undefined,
        isVerified: verified || undefined,
      });
      const data = res.success ? res.data : res;
      setResidents(data?.residents || []);
      setTotalPages(getTotalPages(data?.pagination) || 1);
      setTotal(data?.pagination?.total || 0);
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message || 'Failed to load residents' });
      setResidents([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, district, verified, showToast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, district, verified]);

  const handleDelete = async () => {
    if (!deleteTarget?._id && !deleteTarget?.id) return;
    setDeleting(true);
    try {
      const id = deleteTarget._id || deleteTarget.id;
      const res = await adminResidentService.remove(id);
      if (res.success === false) throw new Error(res.message);
      showToast({
        type: 'success',
        title: 'Removed',
        message: res.message || 'Resident removed',
      });
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1f13]">Residents</h2>
          <p className="text-sm text-slate-500">
            Manage registered residents · {total} account{total === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="rounded-xl pl-9"
          />
        </div>
        <Select value={district || 'all'} onValueChange={(v) => setDistrict(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full rounded-xl lg:w-44">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All districts</SelectItem>
            {DISTRICTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={verified || 'all'} onValueChange={(v) => setVerified(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full rounded-xl lg:w-40">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Resident</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Points</th>
                <th className="px-5 py-3.5">Activity</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-5 py-3">
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : residents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="font-semibold text-slate-800">No residents found</p>
                    <p className="mt-1 text-xs text-slate-500">Try another search or district filter</p>
                  </td>
                </tr>
              ) : (
                residents.map((r) => {
                  const id = r._id || r.id;
                  const loc = [r.location?.district, r.location?.sector].filter(Boolean).join(' · ');
                  return (
                    <tr key={id} className="transition-colors hover:bg-emerald-50/30">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-sm">
                            {getInitials(r.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{r.fullName}</p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              {r.isVerified ? (
                                <Badge className="border-0 bg-emerald-100 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100">
                                  <ShieldCheck className="mr-0.5 h-3 w-3" /> Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] font-semibold text-amber-700">
                                  <ShieldAlert className="mr-0.5 h-3 w-3" /> Unverified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800">{r.email}</p>
                        <p className="text-xs text-slate-500">{r.phone || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span className="text-sm">{loc || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-base font-bold text-emerald-700">{r.points ?? 0}</p>
                        <p className="text-[11px] text-slate-400">
                          earned {r.totalPointsEarned ?? r.points ?? 0}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        <p className="text-xs">
                          <span className="font-semibold text-slate-800">{r.totalWasteScans ?? 0}</span> scans
                        </p>
                        <p className="text-xs">
                          <span className="font-semibold text-slate-800">{r.totalCollections ?? 0}</span> pickups
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatAdminDate(r.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setDeleteTarget(r)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Remove resident?</DialogTitle>
            <DialogDescription>
              This will deactivate <strong>{deleteTarget?.fullName}</strong>, cancel their open pickups,
              and remove them from the residents list. Historical records are kept for reporting.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete resident
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
