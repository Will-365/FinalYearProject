import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { adminAddressService, adminCollectorService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface AddressNodeModalProps {
  open: boolean;
  onClose: () => void;
  parentContext?: { level: string; province?: string; district?: string; sector?: string };
  editNode?: any;
  onSuccess: () => void;
}

export function AddressNodeModal({ open, onClose, parentContext, editNode, onSuccess }: AddressNodeModalProps) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [form, setForm] = useState({
    level: 'district',
    name: '',
    province: 'Kigali City',
    district: '',
    sector: '',
    collectionDays: [] as string[],
    assignedCollector: '',
    notes: '',
  });

  useEffect(() => {
    if (!open) return;
    adminCollectorService.getAll({ limit: 100 }).then((res) => {
      if (res.success) setCollectors(res.data?.collectors || []);
    });
    if (editNode) {
      setForm({
        level: editNode.level || 'sector',
        name: editNode.name || '',
        province: editNode.province || parentContext?.province || 'Kigali City',
        district: editNode.district || parentContext?.district || '',
        sector: editNode.sector || '',
        collectionDays: editNode.collectionDays || [],
        assignedCollector: editNode.assignedCollector?._id || editNode.assignedCollector || '',
        notes: editNode.notes || '',
      });
    } else if (parentContext) {
      setForm((f) => ({
        ...f,
        level: parentContext.level,
        province: parentContext.province || 'Kigali City',
        district: parentContext.district || '',
        sector: parentContext.sector || '',
        name: '',
        collectionDays: [],
        assignedCollector: '',
        notes: '',
      }));
    }
  }, [open, editNode, parentContext]);

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      collectionDays: f.collectionDays.includes(day) ? f.collectionDays.filter((d) => d !== day) : [...f.collectionDays, day],
    }));
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        assignedCollector: form.assignedCollector || undefined,
      };
      const res = editNode
        ? await adminAddressService.update(editNode._id || editNode.id, payload)
        : await adminAddressService.create(payload);
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Saved', message: editNode ? '✅ Zone updated' : '✅ Location created' });
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
      <DialogContent className="rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editNode ? 'Edit Location' : 'Add Location'}</DialogTitle>
          <DialogDescription className="capitalize">{form.level} in {form.province}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label className="mb-2 block">Collection days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <label key={d} className="flex items-center gap-1.5 text-xs capitalize">
                  <Checkbox checked={form.collectionDays.includes(d)} onCheckedChange={() => toggleDay(d)} />
                  {d.slice(0, 3)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Assign collector (optional)</Label>
            <Select value={form.assignedCollector} onValueChange={(v) => setForm((f) => ({ ...f, assignedCollector: v }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select collector" /></SelectTrigger>
              <SelectContent>
                {collectors.map((c) => (
                  <SelectItem key={c._id || c.id} value={c._id || c.id}>{c.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="mt-1" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold">Cancel</button>
          <button type="button" disabled={submitting} onClick={submit} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
