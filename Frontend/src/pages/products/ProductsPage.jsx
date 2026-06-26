import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { useCart } from '@/context/CartContext';
import { productService } from '@/services/productService';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  ShoppingBag, Smartphone, Banknote, Loader2, Gift, Package,
  ShoppingCart, Plus, Minus, Trash2,
} from 'lucide-react';

export function ProductsPage() {
  const { user, updatePoints } = useAuth();
  const { success, error } = useAppToast();
  const { items, addItem, updateQuantity, removeItem, clearCart, syncStock, totals, itemCount } = useCart();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('points');
  const [qtyDraft, setQtyDraft] = useState({});

  const loadProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const productData = await productService.getProducts();
      const list = productData.products || [];
      setProducts(list);
      syncStock(list);
    } catch (err) {
      if (!silent) error(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [error, syncStock]);

  const loadOrders = useCallback(async () => {
    try {
      const orderData = await productService.getMyOrders();
      setOrders(orderData.orders || []);
    } catch { /* ignore */ }
  }, []);

  const load = useCallback(async (silent = false) => {
    await Promise.all([loadProducts(silent), loadOrders()]);
  }, [loadProducts, loadOrders]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(() => loadProducts(true), 12000);
    const onFocus = () => loadProducts(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadProducts]);

  const getQty = (id) => qtyDraft[id] ?? 1;

  const handleAddToCart = (product) => {
    const qty = getQty(product._id);
    if (product.stock <= 0) return;
    addItem(product, Math.min(qty, product.stock));
    success(`${product.name} added to cart`);
    setQtyDraft((d) => ({ ...d, [product._id]: 1 }));
  };

  const checkout = async () => {
    if (items.length === 0) return;
    if (paymentMethod === 'points' && (user?.points ?? 0) < totals.points) {
      error(`Need ${totals.points} points but you have ${user?.points ?? 0}`);
      return;
    }
    setCheckingOut(true);
    let lastPoints = user?.points;
    try {
      for (const { productId, quantity } of items) {
        const res = await productService.buyProduct(productId, { paymentMethod, quantity });
        if (res.data?.remainingPoints != null) lastPoints = res.data.remainingPoints;
      }
      if (lastPoints != null) updatePoints(lastPoints);
      success(`Order placed — ${items.length} item${items.length > 1 ? 's' : ''} via ${paymentMethod}`);
      clearCart();
      setCartOpen(false);
      load(true);
    } catch (err) {
      error(err.message || 'Checkout failed — some items may be out of stock');
      load(true);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Eco Marketplace</h2>
          <p className="text-sm text-gray-500">Real products from waste collected in your community — updates automatically</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-center">
            <p className="text-xs text-green-700">Your Points</p>
            <p className="text-xl font-bold text-green-600">{user?.points ?? 0}</p>
          </div>
          <Button variant="outline" className="relative rounded-xl h-12 px-4" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-green-600 px-1.5 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="shop">
        <TabsList className="rounded-xl">
          <TabsTrigger value="shop"><ShoppingBag className="h-4 w-4 mr-1" />Shop</TabsTrigger>
          <TabsTrigger value="orders"><Gift className="h-4 w-4 mr-1" />My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="mt-4">
          {loading ? <CardSkeleton count={4} /> : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-16 text-center bg-white">
              <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="font-medium">No products available yet</p>
              <p className="text-sm text-gray-500 mt-1">New items appear here when admin converts collected waste</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => {
                const img = p.imageUrl || p.images?.[0];
                const outOfStock = p.stock <= 0;
                const qty = getQty(p._id);
                return (
                  <div key={p._id} className={`rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col ${outOfStock ? 'opacity-60' : ''}`}>
                    <div className="h-44 bg-gray-100 relative overflow-hidden">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">♻️</div>
                      )}
                      {outOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Badge className="bg-white text-gray-800">Out of stock</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <Badge variant="outline" className="w-fit capitalize mb-2">{p.category?.replace('_', ' ')}</Badge>
                      <h3 className="font-bold text-lg">{p.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex-1">{p.description}</p>
                      {p.sourceWeightKg > 0 && (
                        <p className="text-xs text-green-600 mt-2">Made from {p.sourceWeightKg}kg collected waste</p>
                      )}
                      <div className="mt-4 grid grid-cols-3 gap-1 text-center text-xs">
                        <div className="rounded-lg bg-green-50 p-2"><p className="font-bold text-green-700">{p.pointsCost}</p><p className="text-gray-500">pts</p></div>
                        <div className="rounded-lg bg-blue-50 p-2"><p className="font-bold text-blue-700">{(p.cashPrice || 0).toLocaleString()}</p><p className="text-gray-500">cash</p></div>
                        <div className="rounded-lg bg-purple-50 p-2"><p className="font-bold text-purple-700">{(p.phonePrice || p.cashPrice || 0).toLocaleString()}</p><p className="text-gray-500">mobile</p></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center">{p.stock} {p.unit}(s) available</p>
                      {!outOfStock && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex items-center rounded-xl border">
                            <button type="button" className="p-2 hover:bg-gray-50" onClick={() => setQtyDraft((d) => ({ ...d, [p._id]: Math.max(1, qty - 1) }))}><Minus className="h-4 w-4" /></button>
                            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                            <button type="button" className="p-2 hover:bg-gray-50" onClick={() => setQtyDraft((d) => ({ ...d, [p._id]: Math.min(p.stock, qty + 1) }))}><Plus className="h-4 w-4" /></button>
                          </div>
                          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAddToCart(p)}>
                            <ShoppingCart className="h-4 w-4 mr-1" /> Add to cart
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-4 space-y-2">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-12 text-center bg-white">
              <Gift className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm text-gray-500">Items you purchase appear here</p>
            </div>
          ) : orders.map((o) => (
            <div key={o._id} className="rounded-xl border p-4 bg-white flex justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                {(o.product?.imageUrl || o.product?.images?.[0]) && (
                  <img src={o.product.imageUrl || o.product.images?.[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-medium">{o.product?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{o.paymentMethod} · qty {o.quantity} · {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge className="capitalize">{o.status}</Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Your Cart ({itemCount})
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
              <p className="font-medium">Cart is empty</p>
              <p className="text-sm text-gray-500 mt-1">Add eco products from the shop</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {items.map(({ productId, product, quantity }) => (
                  <div key={productId} className="rounded-xl border p-3 bg-gray-50">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.pointsCost} pts · {(product.cashPrice || 0).toLocaleString()} RWF</p>
                      </div>
                      <button type="button" onClick={() => removeItem(productId)} className="text-gray-400 hover:text-red-500 shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-lg border bg-white">
                        <button type="button" className="p-1.5" onClick={() => updateQuantity(productId, quantity - 1)}><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <button type="button" className="p-1.5" onClick={() => updateQuantity(productId, quantity + 1)}><Plus className="h-3 w-3" /></button>
                      </div>
                      <p className="text-sm font-bold text-green-700">{product.pointsCost * quantity} pts</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label className="text-sm">Payment method</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { id: 'points', label: 'Points', icon: Gift },
                      { id: 'phone', label: 'Mobile', icon: Smartphone },
                      { id: 'cash', label: 'Cash', icon: Banknote },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={`rounded-xl border p-2 text-xs font-semibold flex flex-col items-center gap-1 ${paymentMethod === id ? 'border-green-600 bg-green-50 text-green-800' : 'hover:bg-gray-50'}`}
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-green-50 p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>Items</span><span>{totals.count}</span></div>
                  <div className="flex justify-between font-bold text-green-800">
                    <span>{paymentMethod === 'points' ? 'Total points' : paymentMethod === 'cash' ? 'Total cash' : 'Total mobile'}</span>
                    <span>
                      {paymentMethod === 'points' && `${totals.points} pts`}
                      {paymentMethod === 'cash' && `${totals.cash.toLocaleString()} RWF`}
                      {paymentMethod === 'phone' && `${totals.phone.toLocaleString()} RWF`}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700 h-12" onClick={checkout} disabled={checkingOut}>
                  {checkingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingBag className="h-4 w-4 mr-2" />}
                  Place order
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
