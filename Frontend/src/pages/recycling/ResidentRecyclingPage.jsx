import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { recyclingService } from '@/services/recyclingService';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { MapPin, Calendar, Package, Loader2 } from 'lucide-react';

export function ResidentRecyclingPage() {
  const { user } = useAuth();
  const { success, error } = useAppToast();
  const [centers, setCenters] = useState([]);
  const [dropOffs, setDropOffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({ centerId: '', scheduledDate: '', timeSlot: 'morning', materialType: 'plastic', estimatedWeight: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { district: user?.location?.district, limit: 20 };
      const [centerData, dropData] = await Promise.all([
        recyclingService.getNearestCenters(params),
        recyclingService.getMyDropOffs(),
      ]);
      setCenters(centerData.centers || []);
      setDropOffs(dropData.bookings || []);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.location?.district, error]);

  useEffect(() => { load(); }, [load]);

  const scheduleDropOff = async (e) => {
    e.preventDefault();
    if (!form.centerId || !form.scheduledDate) return;
    setBooking(true);
    try {
      await recyclingService.scheduleDropOff({
        centerId: form.centerId,
        scheduledDate: form.scheduledDate,
        timeSlot: form.timeSlot,
        materialType: form.materialType,
        estimatedWeight: parseFloat(form.estimatedWeight) || 0,
      });
      success('Drop-off scheduled');
      setForm({ centerId: '', scheduledDate: '', timeSlot: 'morning', materialType: 'plastic', estimatedWeight: '' });
      load();
    } catch (err) {
      error(err.message);
    } finally {
      setBooking(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await recyclingService.cancelDropOff(id);
      success('Booking cancelled');
      load();
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Recycling Centers</h2>
          <p className="text-sm text-gray-500">Find nearest centers and schedule drop-offs</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700"><Calendar className="h-4 w-4 mr-2" />Schedule Drop-off</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Schedule Drop-off</DialogTitle></DialogHeader>
            <form onSubmit={scheduleDropOff} className="space-y-4">
              <div>
                <Label>Center</Label>
                <Select value={form.centerId} onValueChange={(v) => setForm((f) => ({ ...f, centerId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select center" /></SelectTrigger>
                  <SelectContent>
                    {centers.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name} — {c.district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date</Label><Input type="date" value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} className="mt-1" required /></div>
              <div>
                <Label>Time Slot</Label>
                <Select value={form.timeSlot} onValueChange={(v) => setForm((f) => ({ ...f, timeSlot: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Material</Label>
                <Select value={form.materialType} onValueChange={(v) => setForm((f) => ({ ...f, materialType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['plastic', 'paper', 'glass', 'metal', 'organic', 'electronics', 'textiles', 'mixed'].map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Est. Weight (kg)</Label><Input type="number" min="0" value={form.estimatedWeight} onChange={(e) => setForm((f) => ({ ...f, estimatedWeight: e.target.value }))} className="mt-1" /></div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={booking}>
                {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Booking'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <CardSkeleton count={3} /> : centers.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center">
          <MapPin className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="font-medium">No centers in your area yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {centers.map((c) => (
            <div key={c._id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">{c.name}</h3>
                <Badge className={c.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>{c.isOpen ? 'Open' : 'Closed'}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{c.address}</p>
              {c.distanceKm != null && <p className="text-xs text-green-600 mt-1">{c.distanceKm.toFixed(1)} km away</p>}
              <p className="text-xs text-gray-400 mt-1">{c.hours}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {(c.acceptedMaterials || []).map((m) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Package className="h-4 w-4" />My Drop-offs</h3>
        {dropOffs.length === 0 ? <p className="text-sm text-gray-500">No drop-offs scheduled</p> : (
          <div className="space-y-2">
            {dropOffs.map((b) => (
              <div key={b._id} className="rounded-xl border p-4 flex justify-between items-center bg-white">
                <div>
                  <p className="font-medium">{b.center?.name}</p>
                  <p className="text-sm text-gray-500">{new Date(b.scheduledDate).toLocaleDateString()} · {b.timeSlot} · {b.materialType}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{b.status}</Badge>
                  {b.status === 'scheduled' && (
                    <Button variant="outline" size="sm" onClick={() => cancelBooking(b._id)}>Cancel</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
