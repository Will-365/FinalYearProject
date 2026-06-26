import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { couponService } from '@/services/couponService';
import { CouponCard, MyCouponCard } from '@/components/coupons/CouponCard';
import { ClaimModal } from '@/components/coupons/ClaimModal';
import { PointsBadge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Gift } from 'lucide-react';

const CATEGORIES = ['', 'food', 'transport', 'utilities', 'shopping', 'health', 'other'];

export function CouponsPage() {
  const { user, updateUser } = useAuth();
  const { success, error } = useAppToast();
  const [tab, setTab] = useState('available');
  const [category, setCategory] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [myCoupons, setMyCoupons] = useState([]);
  const [userPoints, setUserPoints] = useState(user?.points || 0);
  const [page, setPage] = useState(1);
  const [myPage, setMyPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [claimCoupon, setClaimCoupon] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(null);

  const loadAvailable = useCallback(async (p = 1, cat = category) => {
    setLoading(true);
    try {
      const data = await couponService.getCoupons({ category: cat, page: p, limit: 9 });
      setCoupons(data.coupons || []);
      setUserPoints(data.userPoints ?? user?.points ?? 0);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(p);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, user?.points, error]);

  const loadMyCoupons = useCallback(async (p = 1, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await couponService.getMyCoupons({ status: 'active', page: p, limit: 9 });
      setMyCoupons(data.coupons || data.items || []);
      setMyTotalPages(data.pagination?.totalPages || 1);
      setMyPage(p);
    } catch (err) {
      if (!silent) error(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (tab === 'available') {
      const t = setTimeout(() => loadAvailable(1), 300);
      return () => clearTimeout(t);
    }
    loadMyCoupons(1);
  }, [tab, category, loadAvailable, loadMyCoupons]);

  // Poll for new admin-granted coupons while on My Coupons tab
  useEffect(() => {
    if (tab !== 'mine') return;
    const interval = setInterval(() => loadMyCoupons(myPage, true), 10000);
    const onFocus = () => loadMyCoupons(myPage, true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [tab, myPage, loadMyCoupons]);

  const handleClaim = async () => {
    if (!claimCoupon) return;
    setClaimLoading(true);
    try {
      const res = await couponService.claimCoupon(claimCoupon._id);
      const spent = res.data?.pointsSpent || claimCoupon.pointsRequired;
      const newPoints = (userPoints || 0) - spent;
      setUserPoints(newPoints);
      updateUser({ points: newPoints });
      setClaimSuccess(res.data);
      success('Coupon claimed! Code copied to clipboard.');
      if (res.data?.couponCode) {
        await navigator.clipboard.writeText(res.data.couponCode);
      }
      loadAvailable(page);
    } catch (err) {
      error(err.message || 'Not enough points to claim this coupon.');
    } finally {
      setClaimLoading(false);
    }
  };

  const closeClaimModal = () => {
    setClaimCoupon(null);
    setClaimSuccess(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupons & Rewards</h1>
          <p className="text-slate-500">Redeem your eco-points for partner discounts</p>
        </div>
        <PointsBadge points={userPoints} className="text-base px-4 py-2" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl">
          <TabsTrigger value="available">Available Coupons</TabsTrigger>
          <TabsTrigger value="mine">My Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6 space-y-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.filter(Boolean).map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200/70" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Gift className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-900">No coupons available</p>
              <p className="text-sm text-slate-500">Check back soon for new partner offers</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.map((c) => (
                  <CouponCard
                    key={c._id}
                    coupon={c}
                    userPoints={userPoints}
                    onClaim={setClaimCoupon}
                  />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={loadAvailable} loading={loading} />
            </>
          )}
        </TabsContent>

        <TabsContent value="mine" className="mt-6">
          <p className="text-xs text-slate-500 mb-4">Rewards from approved collections appear here automatically — updates every few seconds.</p>
          {loading ? (
            <CardSkeleton count={3} />
          ) : myCoupons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Gift className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-900">No claimed coupons yet</p>
              <p className="text-sm text-slate-500">Browse available coupons or recycle waste — admins reward coupons after collection approval</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {myCoupons.map((c) => (
                  <MyCouponCard key={c._id} coupon={c} />
                ))}
              </div>
              <Pagination page={myPage} totalPages={myTotalPages} onPageChange={loadMyCoupons} loading={loading} />
            </>
          )}
        </TabsContent>
      </Tabs>

      <ClaimModal
        open={Boolean(claimCoupon || claimSuccess)}
        onClose={closeClaimModal}
        coupon={claimCoupon}
        userPoints={userPoints}
        onConfirm={handleClaim}
        loading={claimLoading}
        successData={claimSuccess}
      />
    </div>
  );
}
