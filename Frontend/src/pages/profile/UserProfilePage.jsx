import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { profileService } from '@/services/profileService';
import { collectorService } from '@/services/collectorService';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  Loader2, User, Shield, MapPin, Sparkles, Lock, Save,
} from 'lucide-react';

const PREF_ITEMS = [
  { key: 'collections', label: 'Collections' },
  { key: 'rewards', label: 'Rewards' },
  { key: 'news', label: 'News' },
];

export function UserProfilePage({ userRole }) {
  const { user, updateUser } = useAuth();
  const { success, error } = useAppToast();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('details');
  const [form, setForm] = useState({ fullName: '', phone: '', street: '' });
  const [prefs, setPrefs] = useState({ collections: true, rewards: true, news: false });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = userRole === 'admin'
        ? await profileService.getAdminProfile()
        : await profileService.getProfile();
      setProfile(data);
      setForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        street: data.location?.street || '',
      });
      if (data.notificationPrefs) setPrefs(data.notificationPrefs);
      if (userRole === 'collector') {
        const s = await collectorService.getStats();
        setStats(s);
      }
    } catch (err) {
      error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userRole, error]);

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
      const res = userRole === 'admin'
        ? await profileService.updateAdminProfile(payload)
        : await profileService.updateProfile(payload);
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
      <div className="flex h-[calc(100dvh-8.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const initials = (profile?.fullName || user?.fullName || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const zone = profile?.collectorZone || stats?.collector?.collectorZone;
  const locationBits = profile?.location
    ? [profile.location.district, profile.location.sector, profile.location.province].filter(Boolean)
    : [];

  const heroStat =
    userRole === 'resident'
      ? { value: profile?.points ?? 0, label: 'Eco points' }
      : userRole === 'collector'
        ? { value: stats?.collector?.totalPickups ?? 0, label: 'Pickups' }
        : null;

  return (
    <div className="mx-auto flex h-[calc(100dvh-8.5rem)] max-w-5xl flex-col gap-3 overflow-hidden">
      {/* Compact identity band */}
      <div className="relative shrink-0 overflow-hidden rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-5 py-4 text-white shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, rgba(255,255,255,0.35), transparent 42%), radial-gradient(circle at 88% 0%, rgba(255,255,255,0.18), transparent 35%)',
          }}
        />
        <div className="relative flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-white/40 shadow-lg">
            <AvatarFallback className="bg-white/15 text-lg font-bold text-white backdrop-blur">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight">
                {profile?.fullName || 'My Profile'}
              </h1>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
                {userRole}
              </span>
            </div>
            <p className="truncate text-sm text-emerald-50/85">{profile?.email}</p>
          </div>
          {heroStat && (
            <div className="hidden shrink-0 rounded-xl bg-white/15 px-4 py-2 text-right backdrop-blur-sm sm:block">
              <p className="flex items-center justify-end gap-1 text-2xl font-bold leading-none">
                {userRole === 'resident' && <Sparkles className="h-4 w-4 text-amber-200" />}
                {heroStat.value}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-emerald-50/80">
                {heroStat.label}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main panel — fills remaining height */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 sm:px-5">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab('details')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                tab === 'details'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Details
            </button>
            <button
              type="button"
              onClick={() => setTab('security')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                tab === 'security'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Security
            </button>
          </div>
          <p className="hidden text-xs text-slate-400 sm:block">
            Keep your account details up to date
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
          {tab === 'details' ? (
            <div className="flex h-full flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Full name
                  </Label>
                  <Input
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="mt-1 h-10 rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Phone
                  </Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="mt-1 h-10 rounded-xl border-slate-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Street / address
                  </Label>
                  <Input
                    value={form.street}
                    onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                    className="mt-1 h-10 rounded-xl border-slate-200"
                  />
                </div>
              </div>

              {(locationBits.length > 0 || (userRole === 'collector' && zone)) && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {locationBits.map((bit) => (
                    <span
                      key={bit}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700"
                    >
                      {bit}
                    </span>
                  ))}
                  {userRole === 'collector' && zone && (
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                      Zone: {[zone.district, zone.sector].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Notifications
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {PREF_ITEMS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-lg bg-white px-3 py-2.5 border border-slate-100"
                    >
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                      <Switch
                        checked={Boolean(prefs[key])}
                        onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex justify-end pt-1">
                <Button
                  className="h-10 rounded-xl bg-emerald-600 px-5 hover:bg-emerald-700"
                  onClick={saveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save changes
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={changePassword} className="flex h-full flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <p className="text-sm text-amber-900/80">
                  Use at least 8 characters. You’ll stay signed in after updating.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current password
                  </Label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                    }
                    className="mt-1 h-10 rounded-xl border-slate-200"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    New password
                  </Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                    }
                    className="mt-1 h-10 rounded-xl border-slate-200"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Confirm password
                  </Label>
                  <Input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, confirm: e.target.value }))
                    }
                    className="mt-1 h-10 rounded-xl border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="mt-auto flex justify-end pt-1">
                <Button
                  type="submit"
                  className="h-10 rounded-xl bg-emerald-600 px-5 hover:bg-emerald-700"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
