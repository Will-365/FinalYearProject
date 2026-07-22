import { useCallback, useEffect, useMemo, useState } from 'react';
import { collectionService } from '@/services/collectionService';
import { useAppToast } from '@/hooks/useAppToast';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { CardSkeleton } from '@/components/ui/Skeleton';
import {
  Trash2, AlertTriangle, CheckCircle2, Gauge, Loader2, Clock3, Send,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'empty', label: 'Empty', hint: '0–20% full', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { id: 'partial', label: 'Partial', hint: '21–70% full', color: 'border-amber-300 bg-amber-50 text-amber-900' },
  { id: 'full', label: 'Full', hint: '71–100% full', color: 'border-orange-300 bg-orange-50 text-orange-900' },
  { id: 'overdue', label: 'Overdue', hint: 'Needs pickup now', color: 'border-red-300 bg-red-50 text-red-800' },
];

const CRIT_OPTIONS = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'critical', label: 'Critical' },
];

function deriveStatus(pct) {
  if (pct <= 20) return 'empty';
  if (pct <= 70) return 'partial';
  return 'full';
}

function deriveCriticalness(status, pct) {
  if (status === 'overdue') return 'critical';
  if (status === 'full' || pct >= 85) return 'high';
  if (status === 'partial' || pct >= 40) return 'medium';
  return 'low';
}

export function BinStatusPage({ onNavigate }) {
  const { success, error } = useAppToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [daysSinceLastPickup, setDaysSinceLastPickup] = useState(null);

  const [fillPercent, setFillPercent] = useState(50);
  const [status, setStatus] = useState('partial');
  const [criticalness, setCriticalness] = useState('medium');
  const [wasteType, setWasteType] = useState('mixed');
  const [note, setNote] = useState('');
  const [markOverdue, setMarkOverdue] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await collectionService.getMyBinStatus();
      setLatest(data.latest || null);
      setHistory(data.history || []);
      setDaysSinceLastPickup(data.daysSinceLastPickup ?? null);
      if (data.latest) {
        setFillPercent(data.latest.fillPercent ?? 50);
        setStatus(data.latest.status || 'partial');
        setCriticalness(data.latest.criticalness || 'medium');
        setWasteType(data.latest.wasteType || 'mixed');
        setNote(data.latest.note || '');
        setMarkOverdue(data.latest.status === 'overdue');
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep status/criticalness in sync with slider unless overdue forced
  useEffect(() => {
    if (markOverdue) {
      setStatus('overdue');
      setCriticalness('critical');
      return;
    }
    const nextStatus = deriveStatus(fillPercent);
    setStatus(nextStatus);
    setCriticalness(deriveCriticalness(nextStatus, fillPercent));
  }, [fillPercent, markOverdue]);

  const statusMeta = useMemo(
    () => STATUS_OPTIONS.find((s) => s.id === status) || STATUS_OPTIONS[1],
    [status]
  );

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await collectionService.reportBinStatus({
        fillPercent,
        status: markOverdue ? 'overdue' : status,
        criticalness: markOverdue ? 'critical' : criticalness,
        wasteType,
        note,
        markOverdue,
      });
      if (res.success === false) throw new Error(res.message || 'Failed to report');
      success(
        res.data?.autoMarkedOverdue
          ? 'Reported — marked overdue because pickup is overdue (14+ days)'
          : 'Bin status reported — admins can now see your fill level'
      );
      await load();
    } catch (err) {
      error(err.message || 'Failed to report bin status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <CardSkeleton count={3} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bin Status</h1>
        <p className="text-slate-500">
          Tell admins how full your bin is so pickups can be prioritized
        </p>
      </div>

      {/* Current snapshot */}
      <div className={`rounded-2xl border p-5 ${statusMeta.color}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">Current report</p>
              <p className="text-xl font-black">
                {latest ? `${latest.fillPercent}% · ${latest.status}` : 'Not reported yet'}
              </p>
              <p className="text-sm opacity-80 capitalize">
                {latest ? `Criticalness: ${latest.criticalness}` : 'Slide below and submit your first update'}
              </p>
            </div>
          </div>
          {daysSinceLastPickup != null && (
            <Badge variant="outline" className="bg-white/80">
              Last pickup {daysSinceLastPickup}d ago
            </Badge>
          )}
        </div>
        {latest && (
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/50">
            <div
              className="h-full rounded-full bg-slate-800/70 transition-all"
              style={{ width: `${latest.fillPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Report form */}
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-sm font-semibold">How full is your bin?</Label>
            <span className="text-2xl font-black text-green-700">{fillPercent}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={fillPercent}
            onChange={(e) => setFillPercent(Number(e.target.value))}
            className="w-full accent-green-600"
          />
          <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400">
            <span>Empty</span>
            <span>Half</span>
            <span>Full</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                fillPercent <= 20
                  ? 'bg-emerald-500'
                  : fillPercent <= 70
                    ? 'bg-amber-500'
                    : 'bg-orange-500'
              }`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-sm font-semibold">Status indicator</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STATUS_OPTIONS.map((opt) => {
              const selected = (markOverdue ? 'overdue' : status) === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (opt.id === 'overdue') {
                      setMarkOverdue(true);
                    } else {
                      setMarkOverdue(false);
                      setStatus(opt.id);
                      // nudge slider to match status band
                      if (opt.id === 'empty') setFillPercent(10);
                      if (opt.id === 'partial') setFillPercent(50);
                      if (opt.id === 'full') setFillPercent(90);
                    }
                  }}
                  className={`rounded-xl border px-3 py-3 text-left transition-all ${opt.color} ${
                    selected ? 'ring-2 ring-green-600 ring-offset-1' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p className="text-[10px] opacity-70">{opt.hint}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-sm font-semibold">Criticalness</Label>
            <Select
              value={markOverdue ? 'critical' : criticalness}
              onValueChange={(v) => {
                setCriticalness(v);
                if (v === 'critical') setMarkOverdue(true);
              }}
              disabled={markOverdue}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CRIT_OPTIONS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm font-semibold">Main waste type</Label>
            <Select value={wasteType} onValueChange={setWasteType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['organic', 'inorganic', 'recyclable', 'hazardous', 'mixed'].map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-sm font-semibold">Note for collectors (optional)</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 300))}
            rows={3}
            placeholder="e.g. Bin is overflowing near the gate"
            className="resize-none"
          />
        </div>

        {daysSinceLastPickup != null && daysSinceLastPickup >= 14 && fillPercent >= 40 && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            No completed pickup in {daysSinceLastPickup} days. Submitting may auto-mark your bin as overdue.
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit bin status
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onNavigate?.('collection-request')}
          >
            Request pickup
          </Button>
        </div>
      </form>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
            <Clock3 className="h-4 w-4 text-green-600" /> Recent reports
          </h3>
          <ul className="space-y-2">
            {history.map((h) => (
              <li
                key={h._id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-semibold capitalize text-slate-800">
                    {h.status} · {h.fillPercent}%
                  </p>
                  <p className="text-xs capitalize text-slate-500">
                    {h.criticalness} · {h.wasteType}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(h.reportedAt || h.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Gauge, title: 'Fill %', text: 'Slide to match how full your household bin is' },
          { icon: AlertTriangle, title: 'Criticalness', text: 'Tell admins how urgent a pickup feels' },
          { icon: CheckCircle2, title: 'Stay updated', text: 'Report again when the bin fills or after pickup' },
        ].map((tip) => {
          const Icon = tip.icon;
          return (
            <div key={tip.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <Icon className="mb-2 h-4 w-4 text-green-600" />
              <p className="text-sm font-bold text-slate-900">{tip.title}</p>
              <p className="mt-1 text-xs text-slate-500">{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
