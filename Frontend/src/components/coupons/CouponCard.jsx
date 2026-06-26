import { categoryIcons } from '@/utils/formatters';
import { format, parseISO, isValid } from 'date-fns';
import { StatusBadge } from '@/components/ui/Badge';

export function CouponCard({ coupon, userPoints, onClaim }) {
  const canClaim = coupon.canClaim;
  const needed = Math.max(0, (coupon.pointsRequired || 0) - (userPoints || 0));
  const icon = categoryIcons[coupon.category] || '🎁';

  const expiry = coupon.expiresAt
    ? isValid(parseISO(coupon.expiresAt))
      ? format(parseISO(coupon.expiresAt), 'd MMM yyyy')
      : coupon.expiresAt
    : '—';

  const discountLabel =
    coupon.discountType === 'percentage'
      ? `${coupon.discountValue}% off`
      : `${coupon.discountValue} RWF off`;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-2xl">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize">
              {coupon.category}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 truncate">{coupon.title}</h3>
          <p className="text-sm text-green-600 font-semibold">{discountLabel}</p>
          {coupon.partner && (
            <p className="text-xs text-slate-500">{coupon.partner}</p>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-800">{coupon.pointsRequired} pts required</span>
        <span className="text-slate-400">Expires {expiry}</span>
      </div>

      {canClaim ? (
        <button
          type="button"
          onClick={() => onClaim(coupon)}
          className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700"
        >
          Claim
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
        >
          Need {needed} more pts
        </button>
      )}
    </div>
  );
}

export function MyCouponCard({ coupon }) {
  const icon = categoryIcons[coupon.category] || '🎁';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-bold text-slate-900">{coupon.title || coupon.coupon?.title}</h3>
            <p className="text-xs text-slate-500">{coupon.partner || coupon.coupon?.partner}</p>
          </div>
        </div>
        <StatusBadge status={coupon.status} />
      </div>
      {coupon.source === 'admin_reward' && (
        <span className="mb-3 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
          Collection reward
        </span>
      )}
      <div className="rounded-xl border-2 border-dashed border-green-200 bg-green-50 px-4 py-3 text-center">
        <p className="text-xs text-slate-500 mb-1">Redemption code</p>
        <p className="text-xl font-mono font-bold tracking-wider text-green-800">
          {coupon.couponCode || coupon.code}
        </p>
      </div>
    </div>
  );
}
