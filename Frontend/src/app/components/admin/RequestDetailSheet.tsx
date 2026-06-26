import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { adminCollectionService, adminCouponService } from '@/services/adminService';
import { formatAdminDate, statusBadgeClass, priorityBadgeClass, wasteBadgeClass } from '@/utils/adminHelpers';
import { useToast } from '@/hooks/useToast';
import { Phone, Mail, MapPin, User, Gift, Loader2, CheckCircle2 } from 'lucide-react';

interface RequestDetailSheetProps {
  open: boolean;
  onClose: () => void;
  requestId: string | null;
  onRefresh?: () => void;
}

export function RequestDetailSheet({ open, onClose, requestId, onRefresh }: RequestDetailSheetProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [autoReward, setAutoReward] = useState(true);
  const [approving, setApproving] = useState(false);

  const loadRequest = () => {
    if (!requestId) return;
    setLoading(true);
    adminCollectionService
      .getById(requestId)
      .then((res) => setData(res.success ? res.data : res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || !requestId) return;
    loadRequest();
    adminCouponService
      .getAll()
      .then((res) => {
        const list = res.data?.coupons || res.coupons || [];
        setCoupons(list.filter((c: any) => c.isActive));
      })
      .catch(() => setCoupons([]));
  }, [open, requestId]);

  const req = data?.request || data;

  const handleApprove = async () => {
    if (!requestId) return;
    setApproving(true);
    try {
      const res = await adminCollectionService.approve(requestId, {
        couponId: autoReward ? undefined : selectedCouponId || undefined,
        autoRewardCoupon: autoReward,
      });
      if (res.success !== false) {
        const reward = res.data?.couponReward;
        showToast({
          type: 'success',
          title: 'Collection approved',
          message: reward
            ? `${res.data?.pointsAwarded} pts + coupon "${reward.title}" (${reward.code}) sent to resident`
            : `${res.data?.pointsAwarded} points sent to resident`,
        });
        loadRequest();
        onRefresh?.();
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setApproving(false);
    }
  };

  const canApprove = req?.status === 'completed' && !req?.adminApproved;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Request Details</SheetTitle>
          <SheetDescription>Full collection request information</SheetDescription>
        </SheetHeader>
        {loading ? (
          <div className="space-y-3 mt-6">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !req ? (
          <p className="mt-6 text-sm text-gray-500">Could not load request</p>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge className={statusBadgeClass(req.status)}>{req.status?.replace('_', ' ')}</Badge>
              <Badge className={priorityBadgeClass(req.priority || 'medium')}>{req.priority || 'medium'}</Badge>
              <Badge className={wasteBadgeClass(req.wasteType)}>{req.wasteType}</Badge>
              {req.adminApproved && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1 inline" />Approved
                </Badge>
              )}
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Quantity</dt><dd className="capitalize font-medium">{req.quantity}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Preferred</dt><dd>{formatAdminDate(req.preferredDate, req.preferredTimeSlot)}</dd></div>
              {req.pointsEarned > 0 && (
                <div className="flex justify-between"><dt className="text-gray-500">Points awarded</dt><dd className="font-medium text-green-600">{req.pointsEarned} pts</dd></div>
              )}
              {req.description && <div><dt className="text-gray-500 mb-1">Description</dt><dd>{req.description}</dd></div>}
              {req.adminNotes && <div><dt className="text-gray-500 mb-1">Admin notes</dt><dd>{req.adminNotes}</dd></div>}
            </dl>
            {req.resident && (
              <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-gray-400">Resident</p>
                <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{req.resident.fullName}</span></div>
                {req.resident.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>{req.resident.phone}</span></div>}
                {req.resident.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{req.resident.email}</span></div>}
                {req.location && (
                  <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" /><span>{[req.location.district, req.location.sector, req.location.street].filter(Boolean).join(', ')}</span></div>
                )}
              </div>
            )}
            {req.collector && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase text-blue-700">Collector</p>
                <p className="font-medium">{req.collector.fullName}</p>
                {req.collector.phone && <p className="text-sm">{req.collector.phone}</p>}
                <Badge variant="outline">{req.collector.collectorStatus || req.collector.vehicleType}</Badge>
              </div>
            )}
            {req.wasteScan && (
              <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase text-green-700 mb-2">Linked Scan</p>
                <p className="text-sm capitalize">{req.wasteScan.wasteType} · {req.wasteScan.confidence}% confidence</p>
                <p className="text-sm text-gray-600 mt-1">{req.wasteScan.recommendation}</p>
              </div>
            )}

            {canApprove && (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-amber-700" />
                  <p className="font-semibold text-amber-900">Approve & reward resident</p>
                </div>
                <p className="text-sm text-amber-800">
                  Collection is complete. Approve to award eco-points and send a reward coupon instantly to the resident&apos;s account.
                </p>
                <div className="space-y-2">
                  <Label className="text-sm">Reward coupon</Label>
                  <Select
                    value={autoReward ? 'auto' : selectedCouponId || 'auto'}
                    onValueChange={(v) => {
                      if (v === 'auto') {
                        setAutoReward(true);
                        setSelectedCouponId('');
                      } else {
                        setAutoReward(false);
                        setSelectedCouponId(v);
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select coupon" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto — best match for {req.wasteType} waste</SelectItem>
                      {coupons.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.title} ({c.partner})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={approving || (!autoReward && !selectedCouponId)}
                >
                  {approving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gift className="h-4 w-4 mr-2" />}
                  Approve & send coupon
                </Button>
              </div>
            )}

            {req.adminApproved && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                Approved on {req.approvedAt ? new Date(req.approvedAt).toLocaleString() : '—'}.
                {req.pointsEarned > 0 && ` ${req.pointsEarned} points credited.`}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
