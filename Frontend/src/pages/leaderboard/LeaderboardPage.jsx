import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppToast } from '@/hooks/useAppToast';
import { leaderboardService } from '@/services/leaderboardService';
import { RankCard, LeaderboardTable, MyStatsPanel } from '@/components/leaderboard/LeaderboardTable';
import { PageHeaderSkeleton } from '@/components/ui/Skeleton';
import { Trophy } from 'lucide-react';

export function LeaderboardPage() {
  const { user } = useAuth();
  const { error } = useAppToast();
  const [scope, setScope] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [lbData, statsData] = await Promise.all([
        leaderboardService.getLeaderboard({
          scope,
          district: scope === 'district' ? user?.location?.district : undefined,
          limit: 20,
        }),
        leaderboardService.getMyStats(),
      ]);
      setLeaderboard(lbData.leaderboard || []);
      setMyRank(lbData.myRank || null);
      setStats(statsData);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [scope, user?.location?.district, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const topThree = leaderboard.filter((e) => e.rank <= 3);

  if (loading) return <PageHeaderSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
          <p className="text-slate-500">Top eco-champions across Rwanda</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {['global', 'district'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                scope === s ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'global' ? 'Global' : 'My District'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {topThree.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[2, 1, 3].map((rank) => {
                const entry = topThree.find((e) => e.rank === rank);
                if (!entry) return <div key={rank} />;
                return (
                  <div key={rank} className={rank === 1 ? 'sm:order-2 sm:-mt-2' : rank === 2 ? 'sm:order-1' : 'sm:order-3'}>
                    <RankCard entry={entry} size="large" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Trophy className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-900">No rankings yet</p>
              <p className="text-sm text-slate-500">Start scanning waste and requesting pickups to climb the board</p>
            </div>
          )}

          <LeaderboardTable entries={leaderboard} highlightRank={myRank?.rank} />

          {myRank && (
            <div className="sticky bottom-4 rounded-2xl border-2 border-green-300 bg-green-50 p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-green-700">Your Rank</p>
                  <p className="text-lg font-bold text-slate-900">#{myRank.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-600">{myRank.totalPointsEarned ?? myRank.currentPoints} pts</p>
                  <p className="text-xs text-slate-500">
                    {myRank.totalWasteScans || 0} scans · {myRank.totalCollections || 0} collections
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <MyStatsPanel stats={stats} />
        </div>
      </div>
    </div>
  );
}
