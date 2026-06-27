import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buyerService } from '@/services/buyerService';
import { productService } from '@/services/productService';
import { User, Phone, MapPin, Loader2, Save, ShoppingBag, Truck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

const DISTRICTS = ['Gasabo','Kicukiro','Nyarugenge','Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Nyagatare','Rwamagana','Burera','Gakenke','Gicumbi','Musanze','Rulindo','Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango','Karongi','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rusizi','Rutsiro','Rusizi'];

export function BuyerProfile() {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    preferredDistrict: '',
    preferredSector: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, fulfilled: 0, pending: 0, totalSpent: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [meRes, ordersRes] = await Promise.all([
          buyerService.getMe(),
          productService.getMyOrders({ limit: 1000 })
        ]);
        
        const profile = meRes.buyer || meRes;
        setFormData({
          fullName: profile.fullName || '',
          preferredDistrict: profile.preferredDistrict || '',
          preferredSector: profile.preferredSector || ''
        });

        const orders = ordersRes.orders || ordersRes.items || ordersRes || [];
        let spent = 0;
        let fulfilled = 0;
        let pending = 0;

        orders.forEach(o => {
          if (o.paymentMethod !== 'points' && o.status !== 'cancelled') {
            spent += (o.product?.cashPrice || 0) * (o.quantity || 1);
          }
          if (o.status === 'fulfilled') fulfilled++;
          if (['pending', 'confirmed', 'processing', 'ready'].includes(o.status)) pending++;
        });

        setStats({
          totalOrders: orders.length,
          fulfilled,
          pending,
          totalSpent: spent
        });

      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await buyerService.updateMe(formData);
      const updated = res.buyer || res;
      updateUser({ ...updated, role: 'buyer' });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-4">
        <div className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Manage your account and view order statistics</p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
            <Truck className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.fulfilled}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Fulfilled</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center mb-2">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending</p>
        </div>
        <div className="bg-emerald-600 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center text-center text-white">
          <p className="text-xl font-bold mb-1">{stats.totalSpent.toLocaleString()}</p>
          <p className="text-xs font-medium uppercase tracking-wider opacity-80">RWF Spent</p>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-600" />
          Personal Information
        </h2>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number (Read-only)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  value={user?.phone || ''}
                  disabled
                  className="pl-9 bg-gray-50 text-gray-500"
                />
              </div>
              <p className="text-xs text-gray-400">Your phone number is used for login and cannot be changed here.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preferred District</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select 
                  value={formData.preferredDistrict}
                  onChange={e => setFormData({ ...formData, preferredDistrict: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background pl-9 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="">Select district...</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preferred Sector / Address</label>
              <Input 
                value={formData.preferredSector}
                onChange={e => setFormData({ ...formData, preferredSector: e.target.value })}
                placeholder="E.g. Kimironko, KG 11 Ave"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
