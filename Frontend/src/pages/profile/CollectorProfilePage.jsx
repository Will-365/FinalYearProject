import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { profileService } from '@/services/profileService';
import { collectorService } from '@/services/collectorService';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import {
  Loader2, MapPin, Mail, Truck, Shield, Bell, Save, User,
} from 'lucide-react';
import { getInitials } from '@/utils/adminHelpers';

export function CollectorProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error } = useAppToast();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', street: '' });
  const [prefs, setPrefs] = useState({ collections: true, rewards: true, news: false });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, s] = await Promise.all([
        profileService.getProfile(),
        collectorService.getStats(),
      ]);
      setProfile(data);
      setStats(s);
      setForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        street: data.location?.street || '',
      });
      setPrefs(data.notificationPrefs || { collections: true, rewards: true, news: false });
    } catch (err) {
      error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, [load]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        location: { ...profile?.location, street: form.street },
        notificationPrefs: prefs,
      };
      const res = await profileService.updateProfile(payload);
      success(res.message || 'Profile updated');
      updateUser(res.data || { ...user, ...payload });
      load();
    } catch (err) {
      error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const res = await profileService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      success(res.message);
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const zone = profile?.collectorZone || stats?.collector?.collectorZone;
  const zoneLabel = [zone?.district, zone?.sector].filter(Boolean).join(' → ') || 'Not assigned';
  const collector = stats?.collector || profile;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0d1f13]">My Profile</h1>
        <p className="text-sm text-gray-500">Collector account and work zone</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-[#075e54] to-[#128c7e] p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">
            {getInitials(profile?.fullName || user?.fullName)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold">{profile?.fullName}</h2>
            <p className="text-green-100 text-sm flex items-center justify-center sm:justify-start gap-1 mt-1">
              <Mail className="h-4 w-4" /> {profile?.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <Badge className="bg-white/20 text-white border-0">Collector</Badge>
              <Badge className="bg-white/20 text-white border-0 capitalize">{collector?.collectorStatus || 'active'}</Badge>
              {collector?.vehicleType && <Badge className="bg-white/20 text-white border-0 capitalize">{collector.vehicleType}</Badge>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">{collector?.totalPickups ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total pickups</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-blue-600">{stats?.completedToday ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Completed today</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-amber-600">{stats?.todayPickups ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Today&apos;s schedule</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><User className="h-5 w-5 text-green-600" /> Personal details</h3>
          <div><Label>Full name</Label><Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="mt-1" /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1" /></div>
          <div><Label>Street address</Label><Input value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} className="mt-1" /></div>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={saveProfile} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save changes
          </Button>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-green-600" /> Work zone</h3>
            <p className="text-lg font-medium text-slate-800">{zoneLabel}</p>
            {profile?.location && (
              <p className="text-sm text-gray-500">
                Home: {[profile.location.district, profile.location.sector].filter(Boolean).join(' → ')}
              </p>
            )}
            <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-sm text-green-800 flex items-start gap-2">
              <Truck className="h-4 w-4 mt-0.5 shrink-0" />
              Pickups in your zone are assigned by admin. Contact admin via Messages if your zone needs updating.
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Bell className="h-5 w-5 text-green-600" /> Notifications</h3>
            {[
              { key: 'collections', label: 'New pickup assignments' },
              { key: 'rewards', label: 'Performance updates' },
              { key: 'news', label: 'Platform news' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <Switch checked={prefs[key]} onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} />
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={saveProfile} disabled={saving}>Save preferences</Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><Shield className="h-5 w-5 text-green-600" /> Security</h3>
        <form onSubmit={changePassword} className="grid sm:grid-cols-3 gap-4">
          <div><Label>Current password</Label><Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))} className="mt-1" required /></div>
          <div><Label>New password</Label><Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))} className="mt-1" required minLength={8} /></div>
          <div><Label>Confirm</Label><Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} className="mt-1" required /></div>
          <div className="sm:col-span-3">
            <Button type="submit" variant="outline" disabled={saving}>Update password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
