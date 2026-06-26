import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { adminCollectorService } from '@/services/adminService';
import { rwandaLocations } from '@/app/data/rwandaLocations';
import { useToast } from '@/hooks/useToast';

interface CollectorFormModalProps {
  open: boolean;
  onClose: () => void;
  collector?: any;
  onSuccess: () => void;
}

const VEHICLES = ['truck', 'van', 'motorcycle', 'bicycle', 'on_foot'];
const PROVINCES = Object.keys(rwandaLocations);

export function CollectorFormModal({ open, onClose, collector, onSuccess }: CollectorFormModalProps) {
  const isEdit = Boolean(collector);
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    vehicleType: 'motorcycle',
    province: 'Kigali City',
    district: '',
    sector: '',
  });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (collector) {
      setForm({
        fullName: collector.fullName || '',
        email: collector.email || '',
        phone: collector.phone || '',
        nationalId: collector.nationalId || '',
        password: '',
        vehicleType: collector.vehicleType || 'motorcycle',
        province: collector.collectorZone?.province || 'Kigali City',
        district: collector.collectorZone?.district || '',
        sector: collector.collectorZone?.sector || '',
      });
    } else {
      setForm({ fullName: '', email: '', phone: '', nationalId: '', password: '', vehicleType: 'motorcycle', province: 'Kigali City', district: '', sector: '' });
    }
  }, [open, collector]);

  const districts = form.province ? Object.keys(rwandaLocations[form.province] || {}) : [];
  const sectors = form.province && form.district ? Object.keys(rwandaLocations[form.province]?.[form.district] || {}) : [];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.phone.match(/^\+250\d{9}$/)) e.phone = 'Use +250XXXXXXXXX format';
    if (!form.nationalId.match(/^\d{16}$/)) e.nationalId = 'Must be 16 digits';
    if (!isEdit && !form.password) e.password = 'Required for new collectors';
    if (!form.district) e.district = 'Select district';
    if (!form.sector) e.sector = 'Select sector';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      nationalId: form.nationalId,
      vehicleType: form.vehicleType,
      collectorZone: { province: form.province, district: form.district, sector: form.sector },
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      const res = isEdit
        ? await adminCollectorService.update(collector._id || collector.id, payload)
        : await adminCollectorService.create(payload);
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Success', message: isEdit ? '✅ Collector updated' : `✅ Collector ${form.fullName} created` });
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

  const field = (key: string, label: string, props: any = {}) => (
    <div>
      <Label>{label}{!isEdit && key === 'password' ? ' *' : key !== 'password' ? ' *' : ''}</Label>
      <Input
        className={`mt-1 ${errors[key] ? 'border-red-400 ring-2 ring-red-100' : 'focus:border-green-500 focus:ring-green-100'}`}
        value={(form as any)[key]}
        onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((er) => { const n = { ...er }; delete n[key]; return n; }); }}
        {...props}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Collector' : 'Add Collector'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update collector profile' : 'Create a pre-verified collector account'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {field('fullName', 'Full Name')}
          {field('email', 'Email', { type: 'email' })}
          {field('phone', 'Phone', { placeholder: '+250788123456' })}
          {field('nationalId', 'National ID', { maxLength: 16 })}
          {field('password', isEdit ? 'New Password (optional)' : 'Password', { type: 'password' })}
          <div>
            <Label>Vehicle Type *</Label>
            <Select value={form.vehicleType} onValueChange={(v) => setForm((f) => ({ ...f, vehicleType: v }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{VEHICLES.map((v) => <SelectItem key={v} value={v} className="capitalize">{v.replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Province *</Label>
            <Select value={form.province} onValueChange={(v) => setForm((f) => ({ ...f, province: v, district: '', sector: '' }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{PROVINCES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>District *</Label>
            <Select value={form.district} onValueChange={(v) => setForm((f) => ({ ...f, district: v, sector: '' }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            {errors.district && <p className="text-xs text-red-500">{errors.district}</p>}
          </div>
          <div>
            <Label>Sector *</Label>
            <Select value={form.sector} onValueChange={(v) => setForm((f) => ({ ...f, sector: v }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select sector" /></SelectTrigger>
              <SelectContent>{sectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {errors.sector && <p className="text-xs text-red-500">{errors.sector}</p>}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold">Cancel</button>
          <button type="button" disabled={submitting} onClick={submit} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
