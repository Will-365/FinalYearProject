import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { collectorService } from '@/services/collectorService';
import { formatAdminDate, statusBadgeClass, wasteBadgeClass } from '@/utils/adminHelpers';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import {
  MapPin, Phone, Package, Clock, PlayCircle, CheckCircle2, Loader2,
  Truck, CheckCircle, Navigation, Inbox, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Textarea } from '@/app/components/ui/textarea';

const TAB_META = {
  assigned: { label: 'Active Pickups', empty: 'No active pickups — admin will assign tasks to you' },
  requested: { label: 'Open Requests', empty: 'No open requests in your district right now' },
  history: { label: 'Completed', empty: 'Your completed pickups will appear here' },
};

function StatCard({ icon: Icon, label, value, sub, accent = 'green' }) {
  const colors = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
    slate: 'from-slate-600 to-slate-800',
  };
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors[accent]} text-white mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export function CollectorTasksPage() {
  const { user } = useAuth();
  const { success, error } = useAppToast();
  const [tab, setTab] = useState('assigned');
  const [stats, setStats] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // Discrepancy Reporting State
  const [discrepancyModal, setDiscrepancyModal] = useState({ open: false, pickup: null, step: 1 });
  const [hasDiscrepancy, setHasDiscrepancy] = useState(false);
  const [discrepancyData, setDiscrepancyData] = useState({ actualWasteType: '', actualQuantity: '', actualWeightKg: '', notes: '' });

  const scopeMap = { assigned: 'assigned', requested: 'requested', history: 'history' };

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsData, pickupData] = await Promise.all([
        collectorService.getStats(),
        collectorService.getPickups({ scope: scopeMap[tab], limit: 50 }),
      ]);
      setStats(statsData);
      setPickups(pickupData.requests || []);
    } catch (err) {
      if (!silent) error(err.message || 'Failed to load tasks');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tab, error]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(true), 20000);
    const onFocus = () => load(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  const updateStatus = async (id, status) => {
    setActionId(id);
    try {
      const res = await collectorService.updatePickupStatus(id, { status });
      success(res.message || 'Pickup started');
      load(true);
    } catch (err) {
      error(err.message);
    } finally {
      setActionId(null);
    }
  };

  const handleCompletePickupClick = (pickup) => {
    setDiscrepancyModal({ open: true, pickup, step: 1 });
    setHasDiscrepancy(false);
    setDiscrepancyData({ actualWasteType: pickup.wasteType, actualQuantity: pickup.quantity, actualWeightKg: '', notes: '' });
  };

  const submitCompletion = async () => {
    const id = discrepancyModal.pickup?._id || discrepancyModal.pickup?.id;
    if (!id) return;
    
    setActionId(id);
    setDiscrepancyModal({ open: false, pickup: null, step: 1 });
    
    try {
      const payload = { 
        status: 'completed',
        hasDiscrepancy 
      };

      if (hasDiscrepancy) {
        payload.discrepancyDetails = {
          actualWasteType: discrepancyData.actualWasteType,
          actualQuantity: discrepancyData.actualQuantity,
          notes: discrepancyData.notes
        };
      }
      
      // We pass the weight as well, which will create the intake record in backend
      payload.actualWeightKg = Number(discrepancyData.actualWeightKg) || 0;

      await collectorService.updatePickupStatus(id, payload);
      success(hasDiscrepancy ? 'Pickup completed with discrepancy report.' : 'Pickup completed successfully!');
      load(true);
    } catch (err) {
      error(err.message || 'Failed to complete pickup');
    } finally {
      setActionId(null);
    }
  };

  const todayLabel = new Date().toLocaleDateString('en-RW', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const completedToday = stats?.completedToday ?? 0;
  const todayTotal = stats?.todayPickups ?? 0;
  const inProgress = pickups.filter((p) => p.status === 'in_progress').length;
  const progress = todayTotal ? Math.min(100, (completedToday / todayTotal) * 100) : 0;
  const zone = stats?.collector?.collectorZone;
  const zoneLabel = [zone?.district, zone?.sector].filter(Boolean).join(' → ') || 'Zone not assigned';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{todayLabel}</p>
          <h1 className="text-2xl font-bold text-[#0d1f13]">Good day, {user?.fullName?.split(' ')[0] || 'Collector'}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4 text-green-600" /> {zoneLabel}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()} className="shrink-0">
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Truck} label="Today's pickups" value={todayTotal} sub="Scheduled for today" accent="green" />
        <StatCard icon={CheckCircle} label="Completed" value={completedToday} sub={`${Math.round(progress)}% done`} accent="blue" />
        <StatCard icon={Navigation} label="In progress" value={tab === 'assigned' ? inProgress : '—'} sub="Active now" accent="amber" />
        <StatCard icon={Package} label="All-time pickups" value={stats?.collector?.totalPickups ?? 0} sub="Career total" accent="slate" />
      </div>

      {todayTotal > 0 && (
        <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-green-800">Today&apos;s progress</span>
            <span className="text-sm font-bold text-green-700">{completedToday}/{todayTotal}</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-green-100" />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-gray-100 p-1 h-auto">
          {Object.entries(TAB_META).map(([key, meta]) => (
            <TabsTrigger key={key} value={key} className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5">
              {meta.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {loading ? (
            <CardSkeleton count={3} />
          ) : pickups.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center bg-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                <Inbox className="h-8 w-8 text-gray-300" />
              </div>
              <p className="font-semibold text-slate-800">Nothing here yet</p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{TAB_META[tab].empty}</p>
            </div>
          ) : (
            pickups.map((p) => {
              const id = p._id || p.id;
              const resident = p.resident;
              const location = [p.location?.district, p.location?.sector, p.location?.street].filter(Boolean).join(', ');
              return (
                <article key={id} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
                  <div className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="font-bold text-lg text-slate-900">{resident?.fullName || 'Resident'}</h3>
                          <Badge className={statusBadgeClass(p.status)}>{p.status?.replace('_', ' ')}</Badge>
                          <Badge className={wasteBadgeClass(p.wasteType)}>{p.wasteType}</Badge>
                          {p.priority === 'high' && <Badge className="bg-red-100 text-red-700">High priority</Badge>}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-start gap-2 rounded-xl bg-gray-50 p-3">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
                            <span>{location || 'Address not provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3">
                            <Clock className="h-4 w-4 shrink-0 text-blue-600" />
                            <span>{formatAdminDate(p.preferredDate, p.preferredTimeSlot)}</span>
                          </div>
                        </div>
                        <p className="mt-3 text-sm capitalize text-gray-700">
                          <span className="font-medium">Quantity:</span> {p.quantity}
                        </p>
                        {p.description && (
                          <p className="mt-2 text-sm bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-900">{p.description}</p>
                        )}
                      </div>
                      <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                        {resident?.phone && (
                          <a href={`tel:${resident.phone}`} className="inline-flex flex-1 lg:flex-none items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors">
                            <Phone className="h-4 w-4 text-green-600" /> Call resident
                          </a>
                        )}
                        {p.status === 'assigned' && tab === 'assigned' && (
                          <Button className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 rounded-xl" disabled={actionId === id} onClick={() => updateStatus(id, 'in_progress')}>
                            {actionId === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-1" />}
                            Start pickup
                          </Button>
                        )}
                        {p.status === 'in_progress' && tab === 'assigned' && (
                          <Button className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 rounded-xl" disabled={actionId === id} onClick={() => handleCompletePickupClick(p)}>
                            {actionId === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                            Confirm collected
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Discrepancy Modal Workflow */}
      <Dialog open={discrepancyModal.open} onOpenChange={open => !open && setDiscrepancyModal(m => ({ ...m, open: false }))}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Complete Pickup</DialogTitle>
          </DialogHeader>

          {/* STEP 1: Discrepancy Check */}
          {discrepancyModal.step === 1 && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">Does the actual collected waste match what the resident reported?</p>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Reported Type:</span>
                  <span className="font-semibold capitalize">{discrepancyModal.pickup?.wasteType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reported Size:</span>
                  <span className="font-semibold capitalize">{discrepancyModal.pickup?.quantity}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={() => { setHasDiscrepancy(false); setDiscrepancyModal(m => ({ ...m, step: 3 })); }} className="w-full bg-green-600 hover:bg-green-700 h-12">
                  Yes, it matches
                </Button>
                <Button onClick={() => { setHasDiscrepancy(true); setDiscrepancyModal(m => ({ ...m, step: 2 })); }} variant="outline" className="w-full h-12 text-amber-700 border-amber-200 hover:bg-amber-50">
                  <AlertTriangle className="h-4 w-4 mr-2" /> No, report difference
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Discrepancy Details */}
          {discrepancyModal.step === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Actual Waste Type</label>
                <select 
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
                  value={discrepancyData.actualWasteType}
                  onChange={e => setDiscrepancyData(d => ({ ...d, actualWasteType: e.target.value }))}
                >
                  {['organic', 'inorganic', 'recyclable', 'hazardous', 'mixed'].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actual Quantity (Size)</label>
                <select 
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
                  value={discrepancyData.actualQuantity}
                  onChange={e => setDiscrepancyData(d => ({ ...d, actualQuantity: e.target.value }))}
                >
                  {['small', 'medium', 'large'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea 
                  placeholder="Explain the difference..."
                  value={discrepancyData.notes}
                  onChange={e => setDiscrepancyData(d => ({ ...d, notes: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDiscrepancyModal(m => ({ ...m, step: 1 }))}>Back</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setDiscrepancyModal(m => ({ ...m, step: 3 }))}>Continue</Button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 3: Weight Entry (Required for Intake) */}
          {discrepancyModal.step === 3 && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">Enter the measured weight of the collected waste to log it into the processing pipeline.</p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">Actual Weight (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full h-14 text-2xl font-bold text-center border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500 pr-12"
                    placeholder="0.0"
                    value={discrepancyData.actualWeightKg}
                    onChange={e => setDiscrepancyData(d => ({ ...d, actualWeightKg: e.target.value }))}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">kg</span>
                </div>
              </div>

              <DialogFooter className="mt-6 gap-2">
                <Button variant="outline" onClick={() => setDiscrepancyModal(m => ({ ...m, step: hasDiscrepancy ? 2 : 1 }))}>Back</Button>
                <Button 
                  disabled={!discrepancyData.actualWeightKg || Number(discrepancyData.actualWeightKg) <= 0}
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={submitCompletion}
                >
                  Submit & Complete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
