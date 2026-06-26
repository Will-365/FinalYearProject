import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';
import { adminCollectorService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { collectorStatusDot, vehicleEmoji, getInitials, formatAdminDate } from '@/utils/adminHelpers';

interface CollectorDetailSheetProps {
  open: boolean;
  onClose: () => void;
  collectorId: string | null;
  onRefresh: () => void;
}

export function CollectorDetailSheet({ open, onClose, collectorId, onRefresh }: CollectorDetailSheetProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!collectorId) return;
    setLoading(true);
    adminCollectorService
      .getById(collectorId)
      .then((res) => setData(res.success ? res.data : res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (open && collectorId) load(); }, [open, collectorId]);

  const collector = data?.collector || data;
  const stats = data?.stats || collector?.stats;
  const assignments = data?.recentAssignments || collector?.recentAssignments || [];

  const setStatus = async (collectorStatus: string) => {
    if (!collectorId) return;
    try {
      await adminCollectorService.setStatus(collectorId, collectorStatus);
      showToast({ type: 'success', title: 'Updated', message: `Status set to ${collectorStatus.replace('_', ' ')}` });
      load();
      onRefresh();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Collector Profile</SheetTitle>
          <SheetDescription>Stats and recent assignments</SheetDescription>
        </SheetHeader>
        {loading ? (
          <div className="space-y-3 mt-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : !collector ? (
          <p className="mt-6 text-sm text-gray-500">Collector not found</p>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-lg font-bold text-green-800">
                {getInitials(collector.fullName)}
              </div>
              <div>
                <p className="font-bold text-lg">{collector.fullName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className={`h-2 w-2 rounded-full ${collectorStatusDot(collector.collectorStatus)}`} />
                  {collector.collectorStatus?.replace('_', ' ')}
                  · {vehicleEmoji(collector.vehicleType)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setStatus('available')} className="rounded-lg bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Set Available</button>
              <button type="button" onClick={() => setStatus('offline')} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold">Set Offline</button>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-3"><dt className="text-gray-500">Completed</dt><dd className="text-xl font-bold">{stats?.completed ?? 0}</dd></div>
              <div className="rounded-xl bg-gray-50 p-3"><dt className="text-gray-500">In Progress</dt><dd className="text-xl font-bold">{stats?.in_progress ?? 0}</dd></div>
              <div className="rounded-xl bg-gray-50 p-3"><dt className="text-gray-500">Assigned</dt><dd className="text-xl font-bold">{stats?.assigned ?? 0}</dd></div>
              <div className="rounded-xl bg-gray-50 p-3"><dt className="text-gray-500">Total Pickups</dt><dd className="text-xl font-bold">{collector.totalPickups ?? 0}</dd></div>
            </dl>
            <p className="text-sm text-gray-600">{collector.phone} · {collector.collectorZone?.district}, {collector.collectorZone?.sector}</p>
            {assignments.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Recent Assignments</p>
                <ul className="space-y-2">
                  {assignments.slice(0, 10).map((a: any) => (
                    <li key={a._id || a.id} className="flex justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm">
                      <span className="capitalize">{a.wasteType}</span>
                      <Badge variant="outline">{a.status}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
