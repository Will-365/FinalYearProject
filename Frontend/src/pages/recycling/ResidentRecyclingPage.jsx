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
import { MapPin, Calendar, Package, Loader2, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Pins
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const centerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function UpdateMapCenter({ center }) {
  const map = useMap();
  if (center) map.setView(center, map.getZoom());
  return null;
}

export function ResidentRecyclingPage() {
  const { user } = useAuth();
  const { success, error } = useAppToast();
  const [centers, setCenters] = useState([]);
  const [dropOffs, setDropOffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({ centerId: '', scheduledDate: '', timeSlot: 'morning', materialType: 'plastic', estimatedWeight: '' });

  // Map state
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([-1.9441, 30.0619]); // Kigali default

  const load = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const params = { district: user?.location?.district, limit: 20 };
      if (lat && lng) {
        params.latitude = lat;
        params.longitude = lng;
      }
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

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      error("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);
        setMapCenter([lat, lng]);
        load(lat, lng);
        setLocationLoading(false);
      },
      (err) => {
        error("Unable to retrieve your location. Please check browser permissions.");
        setLocationLoading(false);
      }
    );
  };

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

      {/* Map Section */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 overflow-hidden mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg">Nearby Centers Map</h3>
            <p className="text-sm text-gray-500">Interactive map of recycling centers around you</p>
          </div>
          <Button onClick={handleLocateMe} disabled={locationLoading} className="bg-blue-600 hover:bg-blue-700">
            {locationLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
            See Nearby Centers
          </Button>
        </div>
        
        <div className="h-[400px] rounded-xl overflow-hidden border z-0 relative">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <UpdateMapCenter center={mapCenter} />
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup>
                  <span className="font-bold">You are here</span>
                </Popup>
              </Marker>
            )}
            {centers.map(c => (
              c.latitude && c.longitude ? (
                <Marker key={c._id} position={[c.latitude, c.longitude]} icon={centerIcon}>
                  <Popup>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-sm">{c.address}</div>
                    {c.distanceKm && <div className="text-xs text-green-600 font-medium">{c.distanceKm.toFixed(2)} km away</div>}
                    <div className="mt-2 text-xs text-gray-500">{c.hours}</div>
                  </Popup>
                </Marker>
              ) : null
            ))}
          </MapContainer>
        </div>
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
