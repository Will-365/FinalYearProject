import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  MapPin, Calendar, Package, Loader2, Navigation, LocateFixed,
  Clock, Recycle, Crosshair, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const KIGALI = [-1.9441, 30.0619];

const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:22px;height:22px">
    <span style="position:absolute;inset:0;border-radius:9999px;background:rgba(37,99,235,0.25);animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite"></span>
    <span style="position:absolute;inset:4px;border-radius:9999px;background:#2563eb;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(37,99,235,0.45)"></span>
  </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const centerIcon = (selected) =>
  L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center">
      <div style="width:34px;height:34px;border-radius:12px;background:${selected ? '#15803d' : '#16a34a'};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(22,163,74,0.4);border:2px solid #fff;transform:${selected ? 'scale(1.12)' : 'none'}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${selected ? '#15803d' : '#16a34a'};margin-top:-1px"></div>
    </div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
  });

function FitBounds({ userLocation, centers }) {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (userLocation) points.push(L.latLng(userLocation[0], userLocation[1]));
    centers.forEach((c) => {
      if (c.latitude != null && c.longitude != null) {
        points.push(L.latLng(c.latitude, c.longitude));
      }
    });
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14, animate: true });
  }, [map, userLocation, centers]);
  return null;
}

function FlyToSelected({ center }) {
  const map = useMap();
  useEffect(() => {
    if (!center?.latitude || !center?.longitude) return;
    map.flyTo([center.latitude, center.longitude], Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [map, center?._id]);
  return null;
}

export function ResidentRecyclingPage() {
  const { user } = useAuth();
  const { success, error } = useAppToast();
  const [centers, setCenters] = useState([]);
  const [dropOffs, setDropOffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    centerId: '',
    scheduledDate: '',
    timeSlot: 'morning',
    materialType: 'plastic',
    estimatedWeight: '',
  });

  const [userLocation, setUserLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [locationPhase, setLocationPhase] = useState('locating'); // locating | ready | denied | unsupported
  const [selectedId, setSelectedId] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const loadCenters = useCallback(async (lat, lng) => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      // With GPS: sort by true distance (don't restrict to district)
      if (lat != null && lng != null) {
        params.latitude = lat;
        params.longitude = lng;
      } else if (user?.location?.district) {
        params.district = user.location.district;
      }
      const [centerData, dropData] = await Promise.all([
        recyclingService.getNearestCenters(params),
        recyclingService.getMyDropOffs(),
      ]);
      const list = centerData.centers || [];
      setCenters(list);
      setDropOffs(dropData.bookings || []);
      setSelectedId((prev) => {
        if (prev && list.some((c) => c._id === prev)) return prev;
        return list[0]?._id || null;
      });
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.location?.district, error]);

  const locateUser = useCallback((opts = { silent: false }) => {
    if (!navigator.geolocation) {
      setLocationPhase('unsupported');
      if (!opts.silent) error('Geolocation is not supported by your browser');
      loadCenters();
      return;
    }

    setLocationPhase('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation([lat, lng]);
        setAccuracy(position.coords.accuracy || 80);
        setLocationPhase('ready');
        setMapReady(true);
        loadCenters(lat, lng);
      },
      () => {
        setLocationPhase('denied');
        setMapReady(true);
        if (!opts.silent) {
          error('Location access denied. Showing centers without distance — enable location for nearby results.');
        }
        loadCenters();
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }, [error, loadCenters]);

  // Locate user FIRST on enter, then load nearby centers
  useEffect(() => {
    locateUser({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCenter = useMemo(
    () => centers.find((c) => c._id === selectedId) || null,
    [centers, selectedId]
  );

  const openSchedule = (centerId) => {
    setForm((f) => ({ ...f, centerId: centerId || f.centerId || '' }));
    setDialogOpen(true);
  };

  const scheduleDropOff = async (e) => {
    e.preventDefault();
    if (!form.centerId || !form.scheduledDate) {
      error('Please select a center and date');
      return;
    }
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
      setDialogOpen(false);
      if (userLocation) loadCenters(userLocation[0], userLocation[1]);
      else loadCenters();
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
      if (userLocation) loadCenters(userLocation[0], userLocation[1]);
      else loadCenters();
    } catch (err) {
      error(err.message);
    }
  };

  const mapCenter = userLocation || KIGALI;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-green-700">Drop-off network</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recycling Centers</h2>
          <p className="mt-1 text-sm text-slate-500">We find your location first, then the centers closest to you</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 shadow-sm shadow-green-600/20">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Drop-off
            </Button>
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
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                        {c.distanceKm != null ? ` · ${c.distanceKm.toFixed(1)} km` : ` — ${c.district}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  className="mt-1"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
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
              <div>
                <Label>Est. Weight (kg)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.estimatedWeight}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedWeight: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={booking}>
                {booking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Booking'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Location status strip */}
      <div
        className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
          locationPhase === 'ready'
            ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50/80'
            : locationPhase === 'locating'
              ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50/80'
              : 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/60'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              locationPhase === 'ready'
                ? 'bg-green-600 text-white'
                : locationPhase === 'locating'
                  ? 'bg-blue-600 text-white'
                  : 'bg-amber-500 text-white'
            }`}
          >
            {locationPhase === 'locating' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : locationPhase === 'ready' ? (
              <LocateFixed className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
          </div>
          <div>
            {locationPhase === 'locating' && (
              <>
                <p className="text-sm font-semibold text-blue-900">Finding your location…</p>
                <p className="text-xs text-blue-700/80">Allow location access so we can show centers nearest to you</p>
              </>
            )}
            {locationPhase === 'ready' && (
              <>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-green-900">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Your location is pinned
                </p>
                <p className="text-xs text-green-800/80">
                  Showing nearest recycling centers
                  {accuracy ? ` · accuracy ~${Math.round(accuracy)} m` : ''}
                </p>
              </>
            )}
            {(locationPhase === 'denied' || locationPhase === 'unsupported') && (
              <>
                <p className="text-sm font-semibold text-amber-900">Location unavailable</p>
                <p className="text-xs text-amber-800/80">
                  Enable location in your browser to sort centers by distance from you
                </p>
              </>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => locateUser({ silent: false })}
          disabled={locationPhase === 'locating'}
          className="shrink-0 border-white/60 bg-white/80"
        >
          {locationPhase === 'locating' ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Navigation className="mr-2 h-3.5 w-3.5" />
          )}
          {locationPhase === 'ready' ? 'Refresh location' : 'Use my location'}
        </Button>
      </div>

      {/* Map + list split */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          {/* Map */}
          <div className="relative min-h-[360px] border-b border-slate-100 lg:min-h-[520px] lg:border-b-0 lg:border-r">
            {!mapReady && locationPhase === 'locating' ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-green-50/40">
                <div className="relative mb-4 h-16 w-16">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
                  <span className="absolute inset-3 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                    <Crosshair className="h-5 w-5" />
                  </span>
                </div>
                <p className="font-semibold text-slate-800">Pinning your location</p>
                <p className="mt-1 text-sm text-slate-500">Nearby centers appear next</p>
              </div>
            ) : null}
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', minHeight: 360, width: '100%' }}
              className="z-0 lg:!min-h-[520px]"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds userLocation={userLocation} centers={centers} />
              {selectedCenter && <FlyToSelected center={selectedCenter} />}

              {userLocation && (
                <>
                  <Circle
                    center={userLocation}
                    radius={Math.min(Math.max(accuracy || 60, 40), 200)}
                    pathOptions={{
                      color: '#2563eb',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.12,
                      weight: 1,
                    }}
                  />
                  <Marker position={userLocation} icon={userIcon} zIndexOffset={1000}>
                    <Popup>
                      <div className="text-sm font-bold text-blue-700">You are here</div>
                      <div className="text-xs text-slate-500">Your current location</div>
                    </Popup>
                  </Marker>
                </>
              )}

              {centers.map((c) =>
                c.latitude && c.longitude ? (
                  <Marker
                    key={c._id}
                    position={[c.latitude, c.longitude]}
                    icon={centerIcon(c._id === selectedId)}
                    eventHandlers={{
                      click: () => setSelectedId(c._id),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[140px]">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.address}</div>
                        {c.distanceKm != null && (
                          <div className="mt-1 text-xs font-semibold text-green-600">
                            {c.distanceKm.toFixed(1)} km away
                          </div>
                        )}
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold text-green-700 underline"
                          onClick={() => openSchedule(c._id)}
                        >
                          Schedule drop-off
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>

            {/* Map legend */}
            <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> You
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80">
                <span className="h-2.5 w-2.5 rounded-full bg-green-600" /> Centers
              </span>
            </div>
          </div>

          {/* Nearby list */}
          <div className="flex max-h-[520px] flex-col bg-slate-50/50">
            <div className="border-b border-slate-100 bg-white px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900">Nearby centers</h3>
                  <p className="text-xs text-slate-500">
                    {userLocation
                      ? 'Sorted by distance from you'
                      : 'Enable location to sort by distance'}
                  </p>
                </div>
                <Badge variant="outline" className="bg-white text-slate-600">
                  {centers.length} found
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loading ? (
                <CardSkeleton count={3} />
              ) : centers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="font-medium text-slate-800">No centers nearby yet</p>
                  <p className="mt-1 text-xs text-slate-500">Try refreshing your location</p>
                </div>
              ) : (
                centers.map((c, index) => {
                  const active = c._id === selectedId;
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => setSelectedId(c._id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? 'border-green-500 bg-white shadow-md shadow-green-600/10 ring-1 ring-green-500/30'
                          : 'border-slate-200/80 bg-white hover:border-green-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                              active ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate font-bold text-slate-900">{c.name}</h4>
                              <Badge
                                className={
                                  c.isOpen
                                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                                }
                              >
                                {c.isOpen ? 'Open' : 'Closed'}
                              </Badge>
                            </div>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{c.address}</span>
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="h-3 w-3 shrink-0" />
                              {c.hours || 'Hours not listed'}
                            </p>
                          </div>
                        </div>
                        {c.distanceKm != null && (
                          <div className="shrink-0 rounded-xl bg-green-50 px-2.5 py-1.5 text-center">
                            <p className="text-sm font-bold text-green-700">{c.distanceKm.toFixed(1)}</p>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-green-600/80">km</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {(c.acceptedMaterials || []).slice(0, 5).map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600 ring-1 ring-slate-200/80"
                          >
                            <Recycle className="h-2.5 w-2.5 text-green-600" />
                            {m}
                          </span>
                        ))}
                      </div>

                      {active && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSchedule(c._id);
                            }}
                          >
                            <Calendar className="mr-1.5 h-3.5 w-3.5" />
                            Schedule
                          </Button>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My drop-offs */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
          <Package className="h-4 w-4 text-green-600" />
          My Drop-offs
        </h3>
        {dropOffs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No drop-offs scheduled yet
          </p>
        ) : (
          <div className="space-y-2">
            {dropOffs.map((b) => (
              <div
                key={b._id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{b.center?.name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(b.scheduledDate).toLocaleDateString()} · {b.timeSlot} · {b.materialType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{b.status}</Badge>
                  {b.status === 'scheduled' && (
                    <Button variant="outline" size="sm" onClick={() => cancelBooking(b._id)}>
                      Cancel
                    </Button>
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
