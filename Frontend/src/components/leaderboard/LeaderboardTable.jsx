import { Trophy, Medal } from 'lucide-react';

const medalColors = {
  1: 'from-yellow-400 to-amber-500 text-white',
  2: 'from-slate-300 to-slate-400 text-white',
  3: 'from-amber-600 to-amber-700 text-white',
};

export function RankCard({ entry, size = 'normal' }) {
  const isTop = entry.rank <= 3;
  const large = size === 'large';

  if (isTop && large) {
    return (
      <div
        className={`rounded-2xl bg-gradient-to-br ${medalColors[entry.rank]} p-5 shadow-md transition-all hover:-translate-y-1`}
      >
        <div className="mb-2 flex items-center gap-2">
          <Medal className="h-5 w-5" />
          <span className="text-sm font-bold opacity-90">#{entry.rank}</span>
        </div>
        <p className="text-lg font-bold truncate">{entry.fullName}</p>
        <p className="text-sm opacity-90">{entry.district}</p>
        <p className="mt-3 text-2xl font-black">{entry.totalPointsEarned ?? entry.currentPoints} pts</p>
        <p className="text-xs opacity-80">
          {entry.totalWasteScans || 0} scans · {entry.totalCollections || 0} collections
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <span className="w-8 text-center font-bold text-slate-400">#{entry.rank}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate">{entry.fullName}</p>
        <p className="text-xs text-slate-500">{entry.district}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-600">{entry.totalPointsEarned ?? entry.currentPoints}</p>
        <p className="text-xs text-slate-400">pts</p>
      </div>
    </div>
  );
}

export function LeaderboardTable({ entries, highlightRank }) {
  const rest = entries.filter((e) => e.rank > 3);

  if (rest.length === 0) return null;

  return (
    <div className="space-y-2">
      {rest.map((entry) => (
        <div
          key={entry.rank}
          className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
            entry.rank === highlightRank
              ? 'border-green-300 bg-green-50 shadow-sm'
              : 'border-slate-100 bg-white'
          }`}
        >
          <span className="w-8 text-center font-bold text-slate-500">#{entry.rank}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">
              {entry.fullName}
              {entry.rank === highlightRank && (
                <span className="ml-2 text-xs font-bold text-green-600">You</span>
              )}
            </p>
            <p className="text-xs text-slate-500">{entry.district}</p>
          </div>
          <div className="hidden sm:block text-xs text-slate-400">
            {entry.totalWasteScans || 0} scans · {entry.totalCollections || 0} pickups
          </div>
          <div className="text-right font-bold text-green-600">
            {entry.totalPointsEarned ?? entry.currentPoints}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MyStatsPanel({ stats }) {
  if (!stats) return null;

  const recent = stats.recentActivity || stats.activity || [];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-green-600" />
        <h3 className="font-bold text-slate-900">Your Stats</h3>
      </div>
      <dl className="mb-5 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-green-50 p-3">
          <dt className="text-xs text-slate-500">Current points</dt>
          <dd className="text-xl font-bold text-green-700">{stats.currentPoints ?? stats.points ?? 0}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Total earned</dt>
          <dd className="text-xl font-bold text-slate-900">{stats.totalPointsEarned ?? stats.totalEarned ?? 0}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Global rank</dt>
          <dd className="text-xl font-bold text-slate-900">#{stats.globalRank ?? stats.rank ?? '—'}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">District rank</dt>
          <dd className="text-xl font-bold text-slate-900">#{stats.districtRank ?? '—'}</dd>
        </div>
      </dl>
      {recent.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Recent activity</p>
          <ul className="space-y-2">
            {recent.slice(0, 5).map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate">{item.description || item.action}</span>
                <span className={`font-semibold shrink-0 ml-2 ${item.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {item.points > 0 ? '+' : ''}{item.points} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
