import { useCallback, useEffect, useState } from 'react';
import { adminCatalogService } from '@/services/adminService';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Package, ShoppingBag, Loader2, Recycle } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';

const CATEGORIES = ['recycled_goods', 'compost', 'pavers', 'eco_product', 'voucher'];
const isFromWaste = (p) => Boolean(p.wasteIntake || p.collectionRequest);
const EMPTY_FORM = {
  name: '', description: '', category: 'recycled_goods', wasteType: 'recyclable',
  pointsCost: '', cashPrice: '', phonePrice: '', stock: '', imageUrl: '', unit: 'piece',
};

export function AdminProductManagement({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);

  const displayedProducts = showLegacy ? products : products.filter(isFromWaste);
  const legacyCount = products.filter((p) => !isFromWaste(p)).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        adminCatalogService.getProducts({ limit: 100 }),
        adminCatalogService.getOrders({ limit: 50 }),
      ]);
      setProducts(pRes.success ? pRes.data?.products || [] : pRes.products || []);
      setOrders(oRes.success ? oRes.data?.orders || [] : oRes.orders || []);
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name, description: p.description || '', category: p.category,
      wasteType: p.wasteType || 'recyclable', pointsCost: String(p.pointsCost),
      cashPrice: String(p.cashPrice), phonePrice: String(p.phonePrice || p.cashPrice),
      stock: String(p.stock), imageUrl: p.imageUrl || p.images?.[0] || '', unit: p.unit || 'piece',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        pointsCost: parseInt(form.pointsCost) || 0,
        cashPrice: parseInt(form.cashPrice) || 0,
        phonePrice: parseInt(form.phonePrice) || parseInt(form.cashPrice) || 0,
        stock: parseInt(form.stock) || 0,
        images: form.imageUrl ? [form.imageUrl] : [],
      };
      const res = editId
        ? await adminCatalogService.updateProduct(editId, payload)
        : await adminCatalogService.createProduct(payload);
      if (res.success !== false) {
        showToast({ type: 'success', title: 'Saved', message: editId ? 'Product updated' : 'Product created' });
        setDialogOpen(false);
        load();
      } else throw new Error(res.message);
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const confirmOrder = async (id) => {
    try {
      await adminCatalogService.updateOrderStatus(id, 'confirmed');
      showToast({ type: 'success', title: 'Confirmed', message: 'Order confirmed' });
      load();
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const deactivate = async (p) => {
    try {
      await adminCatalogService.updateProduct(p._id, { isActive: false });
      showToast({ type: 'success', title: 'Deactivated', message: `${p.name} removed from shop` });
      load();
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Eco Product Catalog</h2>
          <p className="text-sm text-gray-500">Only waste-converted products appear in the resident eco shop</p>
        </div>
        <Button variant="outline" onClick={() => onNavigate?.('recycling')}>
          <Recycle className="h-4 w-4 mr-2" />Convert waste to product
        </Button>
      </div>

      {legacyCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-amber-900">
            {legacyCount} legacy seed product{legacyCount > 1 ? 's' : ''} hidden from the resident shop. Deactivate them or toggle below to manage.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Switch checked={showLegacy} onCheckedChange={setShowLegacy} id="legacy" />
            <Label htmlFor="legacy" className="text-sm">Show legacy products</Label>
          </div>
        </div>
      )}

      <Tabs defaultValue="products">
        <TabsList className="rounded-xl">
          <TabsTrigger value="products"><Package className="h-4 w-4 mr-1" />Products ({displayedProducts.length})</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingBag className="h-4 w-4 mr-1" />Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
          ) : displayedProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-16 text-center">
              <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="font-medium">No waste-derived products yet</p>
              <p className="text-sm text-gray-500 mt-1">Go to Recycling → approve waste intake → Create Product</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedProducts.map((p) => (
                <Card key={p._id} className="rounded-2xl overflow-hidden">
                  {p.imageUrl && (
                    <div className="h-40 bg-gray-100 overflow-hidden">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                        {isFromWaste(p) ? (
                          <Badge variant="outline" className="text-green-700 border-green-200">From waste</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-700 border-amber-200">Legacy</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-500 line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{p.pointsCost} pts</Badge>
                      <Badge variant="outline">{p.cashPrice?.toLocaleString()} RWF cash</Badge>
                      <Badge variant="outline">{p.phonePrice?.toLocaleString()} RWF mobile</Badge>
                    </div>
                    <p className="text-xs text-gray-400">Stock: {p.stock} {p.unit} · {p.category?.replace('_', ' ')}</p>
                    {p.sourceWeightKg > 0 && <p className="text-xs text-green-600">From {p.sourceWeightKg}kg collected waste</p>}
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(p)}>Edit</Button>
                      {!isFromWaste(p) && p.isActive && (
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => deactivate(p)}>Deactivate</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-4 space-y-2">
          {orders.length === 0 ? <p className="text-sm text-gray-500">No orders yet</p> : orders.map((o) => (
            <div key={o._id} className="rounded-xl border p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium">{o.product?.name}</p>
                <p className="text-sm text-gray-500">{o.user?.fullName} · {o.paymentMethod} · qty {o.quantity}</p>
                <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{o.status}</Badge>
                {o.status === 'pending' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => confirmOrder(o._id)}>Confirm</Button>
                )}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Product' : 'Create Product'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1" required /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="mt-1" rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Stock</Label><Input type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Points</Label><Input type="number" min="0" value={form.pointsCost} onChange={(e) => setForm((f) => ({ ...f, pointsCost: e.target.value }))} className="mt-1" /></div>
              <div><Label>Cash (RWF)</Label><Input type="number" min="0" value={form.cashPrice} onChange={(e) => setForm((f) => ({ ...f, cashPrice: e.target.value }))} className="mt-1" /></div>
              <div><Label>Mobile (RWF)</Label><Input type="number" min="0" value={form.phonePrice} onChange={(e) => setForm((f) => ({ ...f, phonePrice: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." className="mt-1" /></div>
            {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="h-32 w-full object-cover rounded-xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
