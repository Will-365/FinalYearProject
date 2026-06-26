import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { adminCollectorService, adminCollectionService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { vehicleEmoji, collectorStatusDot } from '@/utils/adminHelpers';

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

  useEffect(() => {
    if (!open || !requestId) return;
    setLoading(true);
    setSelectedId('');
    Promise.all([
      adminCollectionService.getById(requestId),
      adminCollectorService.getAll({ limit: 100 }),
    ])
      .then(([reqRes, colRes]) => {
        const reqData = reqRes.success ? reqRes.data : reqRes;
        setRequest(reqData);
        const all = colRes.success ? colRes.data?.collectors || colRes.data?.items || [] : [];
        const district = reqData?.location?.district?.toLowerCase();
        const sorted = [...all].sort((a, b) => {
          const aMatch = a.collectorZone?.district?.toLowerCase() === district ? 0 : 1;
          const bMatch = b.collectorZone?.district?.toLowerCase() === district ? 0 : 1;
          if (aMatch !== bMatch) return aMatch - bMatch;
          const statusOrder = { available: 0, on_route: 1, offline: 2 };
          return (statusOrder[a.collectorStatus] ?? 3) - (statusOrder[b.collectorStatus] ?? 3);
        });
        setCollectors(sorted.filter((c) => c.isActive !== false));
      })
      .catch(() => { setCollectors([]); setRequest(null); })
      .finally(() => setLoading(false));
  }, [open, requestId]);

  const submit = async () => {
    if (!requestId || !selectedId) return;
    setSubmitting(true);
    try {
      const res = await adminCollectionService.assign(requestId, {
        collectorId: selectedId,
        scheduledDate: scheduledDate || undefined,
        collectionNote: collectionNote || undefined,
      });
      if (res.success) {
        const name = collectors.find((c) => (c._id || c.id) === selectedId)?.fullName || 'collector';
        showToast({ type: 'success', title: 'Assigned', message: `✅ Assigned to ${name} — they have been notified` });
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Collector</DialogTitle>
          <DialogDescription>
            {request ? `Pickup: ${request.wasteType} (${request.quantity}) in ${request.location?.district || '—'}` : 'Select a collector for this pickup'}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
        ) : collectors.length === 0 ? (
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl">⚠️ No collectors found — create one in Collectors management</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {collectors.map((c) => {
              const id = c._id || c.id;
              const selected = selectedId === id;
              const zoneMatch = c.collectorZone?.district?.toLowerCase() === request?.location?.district?.toLowerCase();
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedId(id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${selected ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}
                >
                  <span className="text-xl">{vehicleEmoji(c.vehicleType)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${collectorStatusDot(c.collectorStatus)}`} />
                      <span className="font-semibold text-sm truncate">{c.fullName}</span>
                      {zoneMatch && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Same district</span>}
                    </div>
                    <p className="text-xs text-gray-500">{c.collectorZone?.district || 'No zone'} · {c.collectorStatus?.replace('_', ' ')} · {c.activeAssignments ?? 0} active</p>
                  </div>
                </button>
              );
            })}
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
