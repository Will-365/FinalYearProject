import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { ShoppingBag, Package, MapPin, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'processing', 'ready', 'fulfilled', 'cancelled'];

const STATUS_CONFIG = {
  pending: { color: 'text-amber-700 bg-amber-100', icon: Clock },
  confirmed: { color: 'text-blue-700 bg-blue-100', icon: CheckCircle },
  processing: { color: 'text-purple-700 bg-purple-100', icon: Package },
  ready: { color: 'text-teal-700 bg-teal-100', icon: MapPin },
  fulfilled: { color: 'text-green-700 bg-green-100', icon: Truck },
  cancelled: { color: 'text-gray-700 bg-gray-100', icon: XCircle }
};

export function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusTab, setStatusTab] = useState('all');
  
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = statusTab === 'all' ? {} : { status: statusTab };
      const res = await productService.getMyOrders(params);
      setOrders(res.orders || res.items || res || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusTab]);

  const handleCancel = async () => {
    if (!cancelModal.orderId) return;
    setCancelLoading(true);
    try {
      await productService.cancelOrder(cancelModal.orderId, { reason: cancelReason });
      toast.success('Order cancelled successfully');
      setCancelModal({ open: false, orderId: null });
      setCancelReason('');
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  const getPaymentBadge = (method) => {
    switch (method) {
      case 'points': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">💚 Points</span>;
      case 'mobile_money': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">📱 Mobile Money</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">💵 Cash</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500">Track your eco product purchases</p>
      </div>

      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
          {STATUS_TABS.map(t => (
            <TabsTrigger key={t} value={t} className="rounded-lg text-xs sm:text-sm capitalize data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white border rounded-2xl h-32 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchOrders} variant="outline">Retry</Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">No orders found</p>
          <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={order._id || order.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center hover:shadow-md transition-all">
                <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  <img src={order.product?.imageUrl || '/placeholder-product.svg'} alt={order.product?.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{order.product?.name || 'Unknown Product'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-gray-500">{order.quantity} × {order.product?.unit || 'items'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm font-bold text-gray-900">
                          {order.paymentMethod === 'points' ? `${(order.product?.pointsCost || 0) * order.quantity} pts` : `${(order.product?.cashPrice || 0) * order.quantity} RWF`}
                        </span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold capitalize whitespace-nowrap shrink-0 ${statusConfig.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {order.status}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                    {getPaymentBadge(order.paymentMethod)}
                    <span className="text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {order.status === 'pending' && (
                      <button onClick={() => setCancelModal({ open: true, orderId: order._id || order.id })} className="text-red-500 hover:text-red-600 text-xs font-semibold ml-auto">
                        Cancel Order
                      </button>
                    )}
                  </div>
                  
                  {order.trackingNote && (
                    <div className="mt-3 bg-blue-50 text-blue-800 text-xs p-2 rounded-lg border border-blue-100">
                      <strong>Note:</strong> {order.trackingNote}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={cancelModal.open} onOpenChange={open => !open && setCancelModal({ open: false, orderId: null })}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Reason for cancellation (optional)</label>
              <Textarea
                placeholder="I changed my mind..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setCancelModal({ open: false, orderId: null })} disabled={cancelLoading}>Keep Order</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelLoading}>
              {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
