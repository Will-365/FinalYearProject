import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';
import { adminCollectorService, adminCollectionService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { vehicleEmoji, collectorStatusDot } from '@/utils/adminHelpers';
import { Truck, Layers } from 'lucide-react';

interface AssignPickupModalProps {
  open: boolean;
  onClose: () => void;
  requestId: string | null;
  onSuccess: () => void;
}

export function AssignPickupModal({ open, onClose, requestId, onSuccess }: AssignPickupModalProps) {
  const { showToast } = useToast();
  const [collectors, setCollectors] = useState<any[]>([]);
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [collectionNote, setCollectionNote] = useState('');
  const [collectorTasks, setCollectorTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    if (!open || !requestId) return;
    setLoading(true);
    setSelectedId('');
    setCollectorTasks([]);
    Promise.all([
      adminCollectionService.getById(requestId),
      adminCollectorService.getAll({ limit: 100 }),
    ])
      .then(([reqRes, colRes]) => {
        const reqData = reqRes.success ? reqRes.data?.request || reqRes.data : reqRes;
        setRequest(reqData);
        const all = colRes.success ? colRes.data?.collectors || colRes.data?.items || [] : [];
        const district = reqData?.location?.district?.toLowerCase();
        const sorted = [...all]
          .filter((c) => c.isActive !== false && c.collectorStatus !== 'offline')
          .sort((a, b) => {
            const aMatch = a.collectorZone?.district?.toLowerCase() === district ? 0 : 1;
            const bMatch = b.collectorZone?.district?.toLowerCase() === district ? 0 : 1;
            if (aMatch !== bMatch) return aMatch - bMatch;
            return (a.activeAssignments ?? 0) - (b.activeAssignments ?? 0);
          });
        setCollectors(sorted);
      })
      .catch(() => { setCollectors([]); setRequest(null); })
      .finally(() => setLoading(false));
  }, [open, requestId]);

  useEffect(() => {
    if (!selectedId) {
      setCollectorTasks([]);
      return;
    }
    setLoadingTasks(true);
    adminCollectionService
      .getAll({ collectorId: selectedId, limit: 20 })
      .then((res) => {
        const list = res.data?.requests || res.data?.items || res.requests || [];
        setCollectorTasks(
          list.filter((r) => ['assigned', 'in_progress'].includes(r.status) && (r._id || r.id) !== requestId)
        );
      })
      .catch(() => setCollectorTasks([]))
      .finally(() => setLoadingTasks(false));
  }, [selectedId, requestId]);

  const submit = async () => {
    if (!requestId || !selectedId) return;
    setSubmitting(true);
    try {
      const res = await adminCollectionService.assign(requestId, {
        collectorId: selectedId,
        scheduledDate: scheduledDate || undefined,
        collectionNote: collectionNote || undefined,
      });
      if (res.success !== false) {
        const name = collectors.find((c) => (c._id || c.id) === selectedId)?.fullName || 'collector';
        const active = res.data?.activeAssignments;
        showToast({
          type: 'success',
          title: 'Assigned',
          message: active > 1
            ? `✅ ${name} now has ${active} active pickups (including this one)`
            : `✅ Assigned to ${name} — they have been notified`,
        });
        onSuccess();
        onClose();
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message || 'Failed to assign' });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message || 'Failed to assign' });
    } finally {
      setSubmitting(false);
    }
  };

  const selected = collectors.find((c) => (c._id || c.id) === selectedId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Collector</DialogTitle>
          <DialogDescription>
            {request ? `Pickup: ${request.wasteType} (${request.quantity}) in ${request.location?.district || '—'}` : 'Select a collector for this pickup'}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800 flex items-start gap-2">
          <Layers className="h-4 w-4 shrink-0 mt-0.5" />
          Collectors can receive multiple pickups at once — active task count is shown for each.
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
        ) : collectors.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl">⚠️ No available collectors — all may be offline or none exist yet</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {collectors.map((c) => {
              const id = c._id || c.id;
              const isSelected = selectedId === id;
              const zoneMatch = c.collectorZone?.district?.toLowerCase() === request?.location?.district?.toLowerCase();
              const active = c.activeAssignments ?? 0;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedId(id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${isSelected ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}
                >
                  <span className="text-xl">{vehicleEmoji(c.vehicleType)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`h-2 w-2 rounded-full ${collectorStatusDot(c.collectorStatus)}`} />
                      <span className="font-semibold text-sm truncate">{c.fullName}</span>
                      {zoneMatch && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Same district</span>}
                      {active > 0 && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                          <Truck className="h-3 w-3 mr-0.5" />{active} active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{c.collectorZone?.district || 'No zone'} · {c.collectorStatus?.replace('_', ' ')}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedId && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
            <p className="font-semibold text-gray-800 mb-1">{selected?.fullName}&apos;s current queue</p>
            {loadingTasks ? (
              <p className="text-xs text-gray-500">Loading active pickups…</p>
            ) : collectorTasks.length === 0 ? (
              <p className="text-xs text-gray-500">No other active pickups — this will be their first task.</p>
            ) : (
              <ul className="space-y-1 text-xs text-gray-600">
                {collectorTasks.map((t) => (
                  <li key={t._id || t.id} className="flex justify-between gap-2">
                    <span className="capitalize truncate">{t.wasteType} · {t.quantity}</span>
                    <span className="shrink-0">{t.status?.replace('_', ' ')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <div>
            <Label>Scheduled date (optional)</Label>
            <Input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Collection note</Label>
            <Textarea value={collectionNote} onChange={(e) => setCollectionNote(e.target.value)} rows={2} className="mt-1" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold">Cancel</button>
          <button type="button" disabled={!selectedId || submitting} onClick={submit} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? 'Assigning…' : 'Assign & Notify'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
