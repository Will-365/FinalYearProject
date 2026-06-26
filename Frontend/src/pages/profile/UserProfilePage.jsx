import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { profileService } from '@/services/profileService';
import { collectorService } from '@/services/collectorService';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Loader2, User, Shield } from 'lucide-react';

export function UserProfilePage({ userRole }) {
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
      const data = userRole === 'admin'
        ? await profileService.getAdminProfile()
        : await profileService.getProfile();
      setProfile(data);
      setForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        street: data.location?.street || '',
      });
      setPrefs(data.notificationPrefs || prefs);
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const initials = (profile?.fullName || user?.fullName || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const zone = profile?.collectorZone || stats?.collector?.collectorZone;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">My Profile</h2>
        <p className="text-sm text-gray-500 capitalize">Manage your {userRole} account</p>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-green-600 text-white text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left flex-1">
            <h3 className="font-bold text-xl">{profile?.fullName}</h3>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <Badge className="mt-2 capitalize">{userRole}</Badge>
          </div>
          {userRole === 'resident' && (
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{profile?.points ?? 0}</p>
              <p className="text-xs text-gray-500">Points</p>
            </div>
          )}
          {userRole === 'collector' && stats && (
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.collector?.totalPickups ?? 0}</p>
              <p className="text-xs text-gray-500">Total Pickups</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="details">
        <TabsList className="rounded-xl">
          <TabsTrigger value="details"><User className="h-4 w-4 mr-1" />Details</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-1" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Full Name</Label><Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1" /></div>
              <div><Label>Street / Address</Label><Input value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} className="mt-1" /></div>
              {profile?.location && (
                <p className="text-sm text-gray-500">
                  {[profile.location.district, profile.location.sector, profile.location.province].filter(Boolean).join(' → ')}
                </p>
              )}
              {userRole === 'collector' && zone && (
                <p className="text-sm text-gray-500">Zone: {[zone.district, zone.sector].filter(Boolean).join(' → ')}</p>
              )}
              <Button className="bg-green-600 hover:bg-green-700" onClick={saveProfile} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'collections', label: 'Collection updates' },
                { key: 'rewards', label: 'Rewards & points' },
                { key: 'news', label: 'News & tips' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Switch checked={prefs[key]} onCheckedChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="space-y-4">
                <div><Label>Current Password</Label><Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))} className="mt-1" required /></div>
                <div><Label>New Password</Label><Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))} className="mt-1" required minLength={8} /></div>
                <div><Label>Confirm Password</Label><Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} className="mt-1" required /></div>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
