import { Trophy, Flame, Target, Zap, Crown, Medal, TrendingUp, Star } from 'lucide-react';

/** Eco level tiers from total points earned — gamification only, derived dynamically */
export const LEVELS = [
  { id: 'seedling', name: 'Seedling', min: 0, color: 'text-lime-700', bg: 'bg-lime-100', bar: 'bg-lime-500' },
  { id: 'sprout', name: 'Sprout', min: 50, color: 'text-green-700', bg: 'bg-green-100', bar: 'bg-green-500' },
  { id: 'guardian', name: 'Eco Guardian', min: 150, color: 'text-emerald-800', bg: 'bg-emerald-100', bar: 'bg-emerald-600' },
  { id: 'champion', name: 'Champion', min: 400, color: 'text-teal-800', bg: 'bg-teal-100', bar: 'bg-teal-600' },
  { id: 'legend', name: 'Legend', min: 1000, color: 'text-amber-800', bg: 'bg-amber-100', bar: 'bg-amber-500' },
];

export function getLevel(points = 0) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.min) current = level;
  }
  const idx = LEVELS.findIndex((l) => l.id === current.id);
  const next = LEVELS[idx + 1] || null;
  const rangeStart = current.min;
  const rangeEnd = next ? next.min : Math.max(points, current.min + 1);
  const progress = next
    ? Math.min(100, Math.round(((points - rangeStart) / (rangeEnd - rangeStart)) * 100))
    : 100;
  return { ...current, next, progress, pointsToNext: next ? Math.max(0, next.min - points) : 0 };
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
}

export function cleanActivityText(text = '') {
  if (!text) return 'Points activity';
  if (/coupon/i.test(text)) {
    return /claim|redeem|spent|used/i.test(text)
      ? 'Points redeemed for a reward'
      : 'Points activity';
  }
  return text;
}

export function activityDelta(item) {
  const raw = Number(item?.points) || 0;
  if (item?.type === 'spent' || item?.type === 'debit') return -Math.abs(raw);
  return raw;
}

const podiumStyle = {
  1: {
    wrap: 'from-amber-400 via-yellow-400 to-amber-500 text-amber-950 shadow-amber-400/40',
    ring: 'ring-amber-300',
    height: 'sm:pt-2 sm:pb-6',
    icon: Crown,
  },
  2: {
    wrap: 'from-slate-200 via-slate-100 to-slate-300 text-slate-800 shadow-slate-300/50',
    ring: 'ring-slate-200',
    height: 'sm:pt-6 sm:pb-4',
    icon: Medal,
  },
  3: {
    wrap: 'from-orange-400 via-amber-500 to-orange-600 text-orange-950 shadow-orange-400/35',
    ring: 'ring-orange-300',
    height: 'sm:pt-8 sm:pb-4',
    icon: Medal,
  },
};

export function PodiumCard({ entry, isYou }) {
  const style = podiumStyle[entry.rank] || podiumStyle[3];
  const Icon = style.icon;
  const level = getLevel(entry.totalPointsEarned);

  return (
    <div className={`relative ${style.height}`}>
      {entry.rank === 1 && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            <Crown className="h-3 w-3" /> Leader
          </span>
        </div>
      )}
      <div
        className={`rounded-2xl bg-gradient-to-br p-4 shadow-lg ring-2 ${style.wrap} ${style.ring} transition-transform hover:-translate-y-1`}
      >
        <div className="mb-3 flex justify-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/30 text-lg font-black backdrop-blur-sm">
            {initials(entry.fullName)}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black shadow">
              {entry.rank}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="truncate text-sm font-bold">
            {entry.fullName}
            {isYou && <span className="ml-1 text-[10px] font-extrabold uppercase opacity-80">· You</span>}
          </p>
          <p className="mt-0.5 text-[11px] font-medium opacity-80">{entry.district}</p>
          <p className="mt-3 text-2xl font-black tracking-tight">
            {(entry.totalPointsEarned ?? 0).toLocaleString()}
            <span className="ml-1 text-xs font-bold opacity-80">pts</span>
          </p>
          <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${level.bg} ${level.color}`}>
            {level.name}
          </p>
          <p className="mt-2 text-[10px] font-medium opacity-75">
            {entry.totalWasteScans || 0} scans · {entry.totalCollections || 0} pickups
          </p>
        </div>
        <div className="mt-3 flex justify-center opacity-70">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function RankRow({ entry, highlight, maxPoints }) {
  const level = getLevel(entry.totalPointsEarned);
  const pts = entry.totalPointsEarned ?? 0;
  const width = maxPoints > 0 ? Math.max(8, Math.round((pts / maxPoints) * 100)) : 8;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border px-3 py-3 transition-all sm:px-4 ${
        highlight
          ? 'border-green-400 bg-green-50/90 shadow-md shadow-green-600/10 ring-1 ring-green-400/40'
          : 'border-slate-100 bg-white hover:border-green-200 hover:shadow-sm'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r from-green-500/10 to-transparent transition-all"
        style={{ width: `${width}%` }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
            entry.rank <= 3
              ? 'bg-amber-100 text-amber-800'
              : highlight
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-600'
          }`}
        >
          {entry.rank}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            highlight ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'
          }`}
        >
          {initials(entry.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-bold text-slate-900">
              {entry.fullName}
              {highlight && (
                <span className="ml-2 rounded-full bg-green-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                  You
                </span>
              )}
            </p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${level.bg} ${level.color}`}>
              {level.name}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {entry.district}
            {entry.sector && entry.sector !== 'N/A' ? ` · ${entry.sector}` : ''}
            <span className="hidden sm:inline">
              {' '}
              · {entry.totalWasteScans || 0} scans · {entry.totalCollections || 0} pickups
            </span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-black text-green-700">{pts.toLocaleString()}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">points</p>
        </div>
      </div>
    </div>
  );
}

export function MyBattleCard({ stats, myRank, scopeLabel, totalParticipants }) {
  if (!stats && !myRank) return null;

  const earned = stats?.totalPointsEarned ?? myRank?.totalPointsEarned ?? 0;
  const current = stats?.currentPoints ?? myRank?.currentPoints ?? 0;
  const rank = (scopeLabel === 'district' ? stats?.districtRank : stats?.globalRank) ?? myRank?.rank;
  const level = getLevel(earned);

  return (
    <div className="overflow-hidden rounded-2xl border border-green-200/80 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-green-700 via-emerald-600 to-green-800 px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-100/90">Your battle card</p>
            <p className="mt-1 text-lg font-bold">{stats?.fullName || 'You'}</p>
            <p className="text-xs text-green-100/80">
              {stats?.location?.district || 'Rwanda'}
              {stats?.location?.sector ? ` · ${stats.location.sector}` : ''}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase text-green-100">Rank</p>
            <p className="text-2xl font-black">#{rank ?? '—'}</p>
            {totalParticipants != null && (
              <p className="text-[10px] text-green-100/80">of {totalParticipants}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className={`rounded-full bg-white/20 px-2 py-0.5 font-bold`}>{level.name}</span>
            {level.next ? (
              <span className="text-green-100/90">{level.pointsToNext} pts to {level.next.name}</span>
            ) : (
              <span className="text-green-100/90">Max level reached</span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-300 to-white transition-all duration-700"
              style={{ width: `${level.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4">
        {[
          { label: 'Spendable points', value: current, icon: Zap, accent: true },
          { label: 'Lifetime earned', value: earned, icon: Star },
          { label: 'Waste scans', value: stats?.totalWasteScans ?? myRank?.totalWasteScans ?? 0, icon: Target },
          { label: 'Pickups done', value: stats?.totalCollections ?? myRank?.totalCollections ?? 0, icon: Flame },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-xl p-3 ${s.accent ? 'bg-green-50' : 'bg-slate-50'}`}
            >
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <Icon className={`h-3 w-3 ${s.accent ? 'text-green-600' : 'text-slate-400'}`} />
                {s.label}
              </div>
              <p className={`text-xl font-black ${s.accent ? 'text-green-700' : 'text-slate-900'}`}>
                {Number(s.value).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {Array.isArray(stats?.recentActivity) && stats.recentActivity.length > 0 && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <TrendingUp className="h-3.5 w-3.5" /> Recent points
          </p>
          <ul className="space-y-2">
            {stats.recentActivity.slice(0, 6).map((item, i) => {
              const delta = activityDelta(item);
              return (
                <li key={item._id || i} className="flex items-start justify-between gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-slate-600">
                    {cleanActivityText(item.description || item.action)}
                  </span>
                  <span
                    className={`shrink-0 font-bold ${delta >= 0 ? 'text-green-600' : 'text-slate-500'}`}
                  >
                    {delta > 0 ? '+' : ''}
                    {delta} pts
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
