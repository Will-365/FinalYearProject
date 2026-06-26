import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { collectionService } from '@/services/collectionService';
import { wasteTypeConfig } from '@/utils/formatters';
import { LoadingButton } from '@/components/ui/Button';
import { Check } from 'lucide-react';

const QUANTITIES = [
  { id: 'small', label: 'Small', desc: '1–2 bags', size: 'w-8 h-8' },
  { id: 'medium', label: 'Medium', desc: '3–5 bags', size: 'w-12 h-12' },
  { id: 'large', label: 'Large', desc: '6+ bags', size: 'w-16 h-16' },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', desc: '7am – 11am', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', desc: '12pm – 4pm', icon: '☀️' },
  { id: 'evening', label: 'Evening', desc: '5pm – 8pm', icon: '🌆' },
];

const WASTE_TYPES = ['organic', 'inorganic', 'recyclable', 'hazardous'];

export function RequestForm({ prefill, onSuccess }) {
  const { user } = useAuth();
  const { success, error } = useAppToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    wasteType: prefill?.wasteType || '',
    quantity: '',
    description: '',
    preferredDate: '',
    preferredTimeSlot: '',
    location: {
      province: user?.location?.province || '',
      district: user?.location?.district || '',
      sector: user?.location?.sector || '',
      street: user?.location?.street || user?.location?.streetAddress || '',
    },
    wasteScanId: prefill?.wasteScanId || '',
  });

  useEffect(() => {
    if (prefill) {
      setForm((f) => ({
        ...f,
        wasteType: prefill.wasteType || f.wasteType,
        wasteScanId: prefill.wasteScanId || f.wasteScanId,
      }));
    }
  }, [prefill]);

  useEffect(() => {
    if (user?.location) {
      setForm((f) => ({
        ...f,
        location: {
          province: user.location.province || f.location.province,
          district: user.location.district || f.location.district,
          sector: user.location.sector || f.location.sector,
          street: user.location.street || user.location.streetAddress || f.location.street,
        },
      }));
    }
  }, [user]);

  const today = new Date().toISOString().split('T')[0];

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.wasteType) e.wasteType = 'Select a waste type';
      if (!form.quantity) e.quantity = 'Select a quantity';
    }
    if (s === 2) {
      if (!form.preferredDate) e.preferredDate = 'Pick a date';
      else if (form.preferredDate < today) e.preferredDate = 'Date cannot be in the past';
      if (!form.preferredTimeSlot) e.preferredTimeSlot = 'Select a time slot';
    }
    if (s === 3) {
      if (!form.location.district) e.district = 'District is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(3, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      await collectionService.requestPickup(form);
      success("Collection request submitted! We'll assign a collector shortly.");
      onSuccess?.();
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="mb-8 flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex flex-1 items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              step > n ? 'bg-green-100 text-green-700' : step === n ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {step > n ? <Check className="h-4 w-4" /> : n}
          </div>
          {n < 3 && <div className={`h-0.5 flex-1 ${step > n ? 'bg-green-600' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator />

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold text-slate-900">Waste type</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {WASTE_TYPES.map((type) => {
                const cfg = wasteTypeConfig[type];
                const selected = form.wasteType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, wasteType: type }))}
                    className={`rounded-2xl border p-4 text-center transition-all hover:-translate-y-1 ${
                      selected ? 'border-green-600 bg-green-50 shadow-sm' : 'border-slate-200 bg-white hover:shadow-sm'
                    }`}
                  >
                    <span className="text-2xl">{cfg.icon}</span>
                    <p className="mt-2 text-sm font-semibold capitalize">{type}</p>
                  </button>
                );
              })}
            </div>
            {errors.wasteType && <p className="mt-1 text-sm text-red-600">{errors.wasteType}</p>}
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-900">Quantity</h3>
            <div className="grid grid-cols-3 gap-3">
              {QUANTITIES.map((q) => {
                const selected = form.quantity === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, quantity: q.id }))}
                    className={`rounded-2xl border p-4 transition-all hover:-translate-y-1 ${
                      selected ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="mb-2 flex justify-center">
                      <div className={`rounded-lg bg-slate-300 ${q.size}`} />
                    </div>
                    <p className="font-semibold capitalize">{q.label}</p>
                    <p className="text-xs text-slate-500">{q.desc}</p>
                  </button>
                );
              })}
            </div>
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
          </div>

          <LoadingButton onClick={next} className="w-full py-3">Continue</LoadingButton>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Preferred date</label>
            <input
              type="date"
              min={today}
              value={form.preferredDate}
              onChange={(e) => setForm((f) => ({ ...f, preferredDate: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
            {errors.preferredDate && <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>}
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-slate-900">Time slot</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {TIME_SLOTS.map((slot) => {
                const selected = form.preferredTimeSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, preferredTimeSlot: slot.id }))}
                    className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 ${
                      selected ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-xl">{slot.icon}</span>
                    <p className="mt-1 font-semibold">{slot.label}</p>
                    <p className="text-xs text-slate-500">{slot.desc}</p>
                  </button>
                );
              })}
            </div>
            {errors.preferredTimeSlot && <p className="mt-1 text-sm text-red-600">{errors.preferredTimeSlot}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Description (optional)</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Any details for the collector…"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={back} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold">Back</button>
            <LoadingButton onClick={next} className="flex-1 py-3">Continue</LoadingButton>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {['province', 'district', 'sector', 'street'].map((field) => (
              <div key={field}>
                <label className="mb-1 block text-sm font-semibold capitalize text-slate-700">{field}</label>
                <input
                  value={form.location[field] || ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      location: { ...f.location, [field]: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                />
                {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <h4 className="mb-2 font-semibold text-slate-900">Review</h4>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Type</dt><dd className="font-medium capitalize">{form.wasteType}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Quantity</dt><dd className="font-medium capitalize">{form.quantity}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Date</dt><dd className="font-medium">{form.preferredDate}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Time</dt><dd className="font-medium capitalize">{form.preferredTimeSlot}</dd></div>
            </dl>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={back} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold">Back</button>
            <LoadingButton loading={loading} onClick={submit} className="flex-1 py-3">Submit Request</LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
}
