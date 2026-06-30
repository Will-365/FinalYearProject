import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { adminCollectorService } from '@/services/adminService';
import { rwandaLocations } from '@/app/data/rwandaLocations';
import { useToast } from '@/hooks/useToast';
import {
  User, Mail, Phone, CreditCard, Lock, Truck, MapPin,
  CheckCircle2, Eye, EyeOff, ChevronDown, Bike, Footprints, Car
} from 'lucide-react';

interface CollectorFormModalProps {
  open: boolean;
  onClose: () => void;
  collector?: any;
  onSuccess: () => void;
}

const VEHICLES = [
  { value: 'truck', label: 'Truck', icon: '🚛' },
  { value: 'van', label: 'Van', icon: '🚐' },
  { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { value: 'bicycle', label: 'Bicycle', icon: '🚲' },
  { value: 'on_foot', label: 'On Foot', icon: '🚶' },
];

const PROVINCES = Object.keys(rwandaLocations);

export function CollectorFormModal({ open, onClose, collector, onSuccess }: CollectorFormModalProps) {
  const isEdit = Boolean(collector);
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);
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
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email address is required';
    if (!form.phone.match(/^\+250\d{9}$/)) e.phone = 'Use format +250XXXXXXXXX';
    if (!form.nationalId.match(/^\d{16}$/)) e.nationalId = 'Must be exactly 16 digits';
    if (!isEdit && !form.password) e.password = 'Password is required for new collectors';
    if (!form.district) e.district = 'Please select a district';
    if (!form.sector) e.sector = 'Please select a sector';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const setField = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(er => { const n = { ...er }; delete n[key]; return n; });
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

  const InputField = ({
    fieldKey, label, icon: Icon, type = 'text', placeholder = '', maxLength, suffix
  }: { fieldKey: string; label: string; icon: any; type?: string; placeholder?: string; maxLength?: number; suffix?: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 bg-white transition-all duration-200
        ${errors[fieldKey] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-green-500 focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.08)]'}`}>
        <Icon className={`w-4 h-4 flex-shrink-0 ${errors[fieldKey] ? 'text-red-400' : 'text-gray-400'}`} />
        <input
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          value={(form as any)[fieldKey]}
          onChange={e => setField(fieldKey, e.target.value)}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
        />
        {suffix}
      </div>
      {errors[fieldKey] && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">!</span>
          {errors[fieldKey]}
        </p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-0 rounded-2xl max-w-xl max-h-[92vh] overflow-hidden flex flex-col border-0 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 px-6 py-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-bold m-0">
                {isEdit ? 'Edit Collector Profile' : 'Add New Collector'}
              </DialogTitle>
              <DialogDescription className="text-green-100 text-xs mt-0.5 m-0">
                {isEdit ? 'Update the collector's account information below' : 'Fill in the details to create a verified collector account'}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 bg-gray-50">

          {/* Section: Personal Info */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Personal Information</h3>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 grid gap-3">
              <InputField fieldKey="fullName" label="Full Name" icon={User} placeholder="e.g. Jean Claude Habimana" />
              <InputField fieldKey="email" label="Email Address" icon={Mail} type="email" placeholder="collector@example.com" />
              <InputField fieldKey="phone" label="Phone Number" icon={Phone} placeholder="+250788123456" />
              <InputField fieldKey="nationalId" label="National ID" icon={CreditCard} placeholder="16-digit ID number" maxLength={16} />
              <InputField
                fieldKey="password"
                label={isEdit ? 'New Password (optional)' : 'Password'}
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder={isEdit ? 'Leave blank to keep current' : 'Set a strong password'}
                suffix={
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>
          </div>

          {/* Section: Vehicle Type */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Vehicle Type</h3>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="grid grid-cols-5 gap-2">
                {VEHICLES.map(v => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => setField('vehicleType', v.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer
                      ${form.vehicleType === v.value
                        ? 'border-green-500 bg-green-50 shadow-[0_0_0_3px_rgba(22,163,74,0.1)]'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'}`}
                  >
                    <span className="text-xl">{v.icon}</span>
                    <span className={`text-[10px] font-semibold leading-tight ${form.vehicleType === v.value ? 'text-green-700' : 'text-gray-500'}`}>
                      {v.label}
                    </span>
                    {form.vehicleType === v.value && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Zone */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Assigned Zone</h3>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 grid gap-3">
              {/* Province */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Province</label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-3 py-2.5 bg-white focus-within:border-green-500 focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <Select value={form.province} onValueChange={v => setForm(f => ({ ...f, province: v, district: '', sector: '' }))}>
                    <SelectTrigger className="border-0 p-0 h-auto text-sm focus:ring-0 shadow-none bg-transparent flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">District</label>
                <div className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 bg-white focus-within:border-green-500 focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all
                  ${errors.district ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                  <MapPin className={`w-4 h-4 flex-shrink-0 ${errors.district ? 'text-red-400' : 'text-gray-400'}`} />
                  <Select value={form.district} onValueChange={v => { setForm(f => ({ ...f, district: v, sector: '' })); setErrors(e => { const n={...e}; delete n.district; return n; }); }}>
                    <SelectTrigger className="border-0 p-0 h-auto text-sm focus:ring-0 shadow-none bg-transparent flex-1">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {errors.district && <p className="mt-1 text-xs text-red-500">{errors.district}</p>}
              </div>

              {/* Sector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sector</label>
                <div className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 bg-white focus-within:border-green-500 focus-within:shadow-[0_0_0_3px_rgba(22,163,74,0.08)] transition-all
                  ${errors.sector ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                  <MapPin className={`w-4 h-4 flex-shrink-0 ${errors.sector ? 'text-red-400' : 'text-gray-400'}`} />
                  <Select value={form.sector} onValueChange={v => { setField('sector', v); }}>
                    <SelectTrigger className="border-0 p-0 h-auto text-sm focus:ring-0 shadow-none bg-transparent flex-1">
                      <SelectValue placeholder={form.district ? 'Select sector' : 'Select district first'} />
                    </SelectTrigger>
                    <SelectContent>{sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {errors.sector && <p className="mt-1 text-xs text-red-500">{errors.sector}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-sm font-bold text-white shadow-lg shadow-green-200 hover:shadow-green-300 hover:from-green-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isEdit ? 'Update Collector' : 'Create Collector'}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
