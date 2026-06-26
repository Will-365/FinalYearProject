import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { adminCollectionService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';

interface SetPriorityModalProps {
  open: boolean;
  onClose: () => void;
  requestId: string | null;
  currentPriority?: string;
  onSuccess: () => void;
}

const PRIORITIES = [
  { id: 'high', label: 'High', desc: 'Urgent — perishable or overflow', className: 'border-red-300 bg-red-50 hover:bg-red-100' },
  { id: 'medium', label: 'Medium', desc: 'Standard priority', className: 'border-amber-300 bg-amber-50 hover:bg-amber-100' },
  { id: 'low', label: 'Low', desc: 'Can wait', className: 'border-green-300 bg-green-50 hover:bg-green-100' },
];

export function SetPriorityModal({ open, onClose, requestId, currentPriority, onSuccess }: SetPriorityModalProps) {
  const { showToast } = useToast();
  const [priority, setPriority] = useState(currentPriority || 'medium');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!requestId) return;
    setSubmitting(true);
    try {
      const res = await adminCollectionService.setPriority(requestId, { priority, adminNotes: adminNotes || undefined });
      if (res.success) {
        showToast({ type: 'success', title: 'Updated', message: `✅ Priority updated to ${priority.charAt(0).toUpperCase() + priority.slice(1)}` });
        onSuccess();
        onClose();
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle>Set Priority</DialogTitle>
          <DialogDescription>How urgent is this collection request?</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPriority(p.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${p.className} ${priority === p.id ? 'ring-2 ring-green-500' : ''}`}
            >
              <p className="font-bold capitalize">{p.label}</p>
              <p className="text-xs text-gray-600">{p.desc}</p>
            </button>
          ))}
        </div>
        <div>
          <Label>Admin notes (optional)</Label>
          <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} className="mt-1" />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold">Cancel</button>
          <button type="button" disabled={submitting} onClick={submit} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? 'Saving…' : 'Save Priority'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
