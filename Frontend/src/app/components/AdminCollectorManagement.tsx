import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { adminCollectorService } from '@/services/adminService';
import { useDebounce, collectorStatusDot, vehicleEmoji, getInitials, getTotalPages } from '@/utils/adminHelpers';
import { useToast } from '@/hooks/useToast';
import { CollectorFormModal } from '@/app/components/admin/CollectorFormModal';
import { CollectorDetailSheet } from '@/app/components/admin/CollectorDetailSheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Truck, Plus, Eye, Edit, Trash2 } from 'lucide-react';

export function AdminCollectorManagement() {
  const { showToast } = useToast();
  const [collectors, setCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editCollector, setEditCollector] = useState<any>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const fetchCollectors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCollectorService.getAll({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        status: statusTab === 'all' ? undefined : statusTab,
      });
      if (res.success) {
        setCollectors(res.data?.collectors || res.data?.items || []);
        setTotalPages(getTotalPages(res.data?.pagination));
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message || 'Failed to load collectors' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusTab, showToast]);

  useEffect(() => { fetchCollectors(); }, [fetchCollectors]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const id = deleteTarget._id || deleteTarget.id;
    try {
      const res = await adminCollectorService.remove(id);
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Deactivated', message: '✅ Collector deactivated' });
        setDeleteTarget(null);
        fetchCollectors();
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message || `Cannot delete — ${deleteTarget.fullName} has active assignments` });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1f13]">Collector Management</h2>
          <p className="text-sm text-gray-500">Manage field collectors and assignments</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setEditCollector(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Collector
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search name, email, phone…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="sm:max-w-xs" />
        <Tabs value={statusTab} onValueChange={(v) => { setStatusTab(v); setPage(1); }}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="on_route">On Route</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
      ) : collectors.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center">
          <Truck className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="font-semibold">No collectors yet</p>
          <Button className="mt-3 bg-green-600" onClick={() => setFormOpen(true)}>Add your first collector →</Button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Collector</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Zone & Vehicle</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {collectors.map((c) => {
                  const id = c._id || c.id;
                  return (
                    <tr key={id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
                              {getInitials(c.fullName)}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${collectorStatusDot(c.collectorStatus)}`} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{c.fullName}</p>
                            <p className="text-xs text-gray-500 capitalize">{c.collectorStatus?.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {c.phone}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{c.collectorZone?.district || 'Unassigned'}</p>
                        <p className="text-xs text-gray-500">{vehicleEmoji(c.vehicleType)} {c.vehicleType || 'No vehicle'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md w-max">{c.activeAssignments ?? 0} active</span>
                          <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-md w-max">{c.totalPickups ?? 0} pickups</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700" onClick={() => setDetailId(id)} title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700" onClick={() => { setEditCollector(c); setFormOpen(true); }} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteTarget(c)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </>
      )}

      <CollectorFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditCollector(null); }} collector={editCollector} onSuccess={fetchCollectors} />
      <CollectorDetailSheet open={Boolean(detailId)} onClose={() => setDetailId(null)} collectorId={detailId} onRefresh={fetchCollectors} />
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Deactivate {deleteTarget?.fullName}?</DialogTitle>
            <DialogDescription>This will prevent them from receiving new assignments. Their collection history will be preserved.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={deleting} onClick={handleDelete}>{deleting ? 'Removing…' : 'Deactivate'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
