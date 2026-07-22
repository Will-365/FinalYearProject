import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { leaderboardService } from '@/services/leaderboardService';
import { PodiumCard, RankRow, MyBattleCard, getLevel } from '@/components/leaderboard/LeaderboardTable';
import { PageHeaderSkeleton } from '@/components/ui/Skeleton';
import { Trophy, Users, Search, Loader2, Sparkles, Swords } from 'lucide-react';

const PAGE_SIZE = 50;

export function LeaderboardPage() {
  const { user } = useAuth();
  const { error } = useAppToast();
  const [scope, setScope] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [stats, setStats] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = useCallback(
    async (pageNum = 1, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const [lbData, statsData] = await Promise.all([
          leaderboardService.getLeaderboard({
            scope,
            district: scope === 'district' ? user?.location?.district : undefined,
            limit: PAGE_SIZE,
            page: pageNum,
          }),
          pageNum === 1 ? leaderboardService.getMyStats() : Promise.resolve(null),
        ]);

        const rows = lbData.leaderboard || [];
        setLeaderboard((prev) => (append ? [...prev, ...rows] : rows));
        setMyRank(lbData.myRank || null);
        setTotalParticipants(lbData.totalParticipants ?? lbData.pagination?.total ?? 0);
        setHasMore(Boolean(lbData.pagination?.hasMore));
        setPage(pageNum);
        if (statsData) setStats(statsData);
      } catch (err) {
        error(err.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [scope, user?.location?.district, error]
  );

  useEffect(() => {
    loadData(1, false);
  }, [loadData]);

  const myUserId = String(myRank?.userId || user?._id || user?.id || '');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leaderboard;
    return leaderboard.filter(
      (e) =>
        e.fullName?.toLowerCase().includes(q) ||
        e.district?.toLowerCase().includes(q) ||
        e.sector?.toLowerCase().includes(q)
    );
  }, [leaderboard, search]);

  const topThree = useMemo(
    () => [1, 2, 3].map((r) => leaderboard.find((e) => e.rank === r)).filter(Boolean),
    [leaderboard]
  );

  const maxPoints = useMemo(
    () => Math.max(1, ...leaderboard.map((e) => e.totalPointsEarned || 0)),
    [leaderboard]
  );

  const isYou = (entry) => {
    if (entry.userId && myUserId) return String(entry.userId) === myUserId;
    return entry.rank === myRank?.rank && entry.fullName === (stats?.fullName || user?.fullName);
  };

  const yourLevel = getLevel(stats?.totalPointsEarned ?? myRank?.totalPointsEarned ?? 0);
  const districtName = user?.location?.district;

  if (loading) return <PageHeaderSkeleton />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-green-800/10 bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800 px-5 py-6 text-white shadow-lg shadow-green-900/20 sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(163,230,53,0.35), transparent 35%)',
          }}
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-lime-100 backdrop-blur-sm">
              <Swords className="h-3.5 w-3.5" /> Points arena
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Leaderboard</h1>
            <p className="mt-2 max-w-xl text-sm text-green-50/90">
              Compete with every verified resident. Scan waste, complete pickups, climb ranks, and level up your eco status.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold">
                <Users className="h-3.5 w-3.5" />
                {totalParticipants.toLocaleString()} competitors
              </span>
              {myRank?.rank != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-300/20 px-3 py-1.5 text-xs font-semibold text-lime-100">
                  <Trophy className="h-3.5 w-3.5" />
                  You are #{myRank.rank}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                {yourLevel.name}
              </span>
            </div>
          </div>

          <div className="inline-flex rounded-2xl border border-white/20 bg-black/20 p-1 backdrop-blur-sm">
            {[
              { id: 'global', label: 'All Rwanda' },
              { id: 'district', label: districtName ? `${districtName}` : 'My District' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id)}
                disabled={s.id === 'district' && !districtName}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  scope === s.id
                    ? 'bg-white text-green-800 shadow-md'
                    : 'text-green-50 hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5">
          {/* Podium */}
          {topThree.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">Hall of fame</h2>
                <p className="text-xs text-slate-400">Top 3 by total points earned</p>
              </div>
              <div className="grid items-end gap-3 sm:grid-cols-3">
                {[2, 1, 3].map((rank) => {
                  const entry = topThree.find((e) => e.rank === rank);
                  if (!entry) return <div key={rank} className="hidden sm:block" />;
                  return (
                    <div
                      key={entry.userId || rank}
                      className={rank === 1 ? 'sm:order-2' : rank === 2 ? 'sm:order-1' : 'sm:order-3'}
                    >
                      <PodiumCard entry={entry} isYou={isYou(entry)} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Trophy className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-900">No rankings yet</p>
              <p className="text-sm text-slate-500">
                Be the first — scan waste and complete pickups to earn points
              </p>
            </div>
          )}

          {/* Full rankings */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">All competitors</h2>
                <p className="text-xs text-slate-500">
                  Showing {filtered.length}
                  {!search ? ` of ${totalParticipants}` : ''} ranked by total points earned
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or district…"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none ring-green-500/30 focus:border-green-500 focus:bg-white focus:ring-2"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No residents match your search</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((entry) => (
                  <RankRow
                    key={entry.userId || `${entry.rank}-${entry.fullName}`}
                    entry={entry}
                    highlight={isYou(entry)}
                    maxPoints={maxPoints}
                  />
                ))}
              </div>
            )}

            {hasMore && !search && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => loadData(page + 1, true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white hover:shadow-sm disabled:opacity-50"
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Load more competitors
                </button>
              </div>
            )}
          </div>

          {/* Sticky your rank strip */}
          {myRank && (
            <div className="sticky bottom-3 z-20 overflow-hidden rounded-2xl border-2 border-green-400 bg-white shadow-xl shadow-green-900/10">
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-white sm:px-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-lg font-black backdrop-blur-sm">
                  #{myRank.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-100">Your live rank</p>
                  <p className="truncate font-bold">
                    Keep earning points to climb — {totalParticipants > 0 ? `${totalParticipants} in the race` : 'compete now'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black">{(myRank.totalPointsEarned ?? 0).toLocaleString()}</p>
                  <p className="text-[10px] font-semibold uppercase text-green-100">total pts</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <MyBattleCard
            stats={stats}
            myRank={myRank}
            scopeLabel={scope}
            totalParticipants={totalParticipants}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">How to climb</p>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">1</span>
                Scan waste to identify and sort materials
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">2</span>
                Request pickups and get collections approved
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">3</span>
                Earn points, level up, and beat the next rank
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
