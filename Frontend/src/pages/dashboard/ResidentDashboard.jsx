import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { leaderboardService } from '@/services/leaderboardService';
import { collectionService } from '@/services/collectionService';
import { wasteService } from '@/services/wasteService';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PointsBadge } from '@/components/ui/Badge';
import { formatDateWithSlot } from '@/utils/formatters';
import {
  ScanLine, Truck, Trophy, Ticket, ClipboardList, CalendarDays, ArrowRight,
} from 'lucide-react';

const quickActions = [
  { id: 'scan', label: 'Scan Waste', icon: ScanLine, desc: 'Identify & sort waste' },
  { id: 'collection-request', label: 'Request Pickup', icon: Truck, desc: 'Schedule collection' },
  { id: 'coupons', label: 'Redeem Coupons', icon: Ticket, desc: 'Spend your points' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, desc: 'See your rank' },
];

export function ResidentDashboard({ onNavigate }) {
  const { user, points } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [statsData, reqData, scanData] = await Promise.all([
          leaderboardService.getMyStats(),
          collectionService.getMyRequests({ page: 1, limit: 5 }),
          wasteService.getHistory(1, 5),
        ]);
        if (cancelled) return;
        setStats(statsData);
        setRequests(reqData.requests || reqData.items || []);
        setRecentScans(scanData.scans || scanData.items || scanData || []);
      } catch {
        if (!cancelled) {
          setStats(null);
          setRequests([]);
          setRecentScans([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <CardSkeleton count={4} />;

  const scans = stats?.totalWasteScans ?? recentScans.length;
  const collections = stats?.totalCollections ?? requests.filter((r) => r.status === 'completed').length;
  const rank = stats?.globalRank ?? stats?.rank ?? '—';
  const recentActivity = stats?.recentActivity || stats?.activity || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h2>
          <p className="text-slate-500">Your eco-impact at a glance</p>
        </div>
        <PointsBadge points={points ?? stats?.currentPoints ?? 0} className="text-base px-4 py-2" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Current Points', value: points ?? stats?.currentPoints ?? 0 },
          { label: 'Total Earned', value: stats?.totalPointsEarned ?? stats?.totalEarned ?? 0 },
          { label: 'Waste Scans', value: scans },
          { label: 'Collections', value: collections },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-slate-900">Quick actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="rounded-xl bg-green-50 p-2">
                <Icon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent Requests</h3>
            <button
              type="button"
              onClick={() => onNavigate?.('my-requests')}
              className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {requests.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No collection requests yet</p>
          ) : (
            <ul className="space-y-3">
              {requests.slice(0, 5).map((req) => (
                <li key={req._id || req.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="capitalize text-slate-700">{req.wasteType} · {req.quantity}</span>
                  <span className="text-slate-400">{formatDateWithSlot(req.preferredDate, req.preferredTimeSlot)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            <button
              type="button"
              onClick={() => onNavigate?.('scan')}
              className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
            >
              Scan waste <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {recentActivity.slice(0, 5).map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 truncate">{item.description || item.action}</span>
                  <span className={`font-semibold shrink-0 ml-2 ${item.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {item.points > 0 ? '+' : ''}{item.points} pts
                  </span>
                </li>
              ))}
            </ul>
          ) : recentScans.length > 0 ? (
            <ul className="space-y-3">
              {recentScans.slice(0, 5).map((scan) => (
                <li key={scan._id || scan.scanId} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-600">{scan.wasteType} scan</span>
                  <span className="font-semibold text-green-600">+{scan.pointsEarned || 5} pts</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">No activity yet — scan your first waste item</p>
          )}
        </div>
      </div>

      {rank !== '—' && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-slate-900">Global rank #{rank}</p>
              <p className="text-sm text-slate-600">Keep scanning and collecting to climb the board</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('leaderboard')}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            View Leaderboard
          </button>
        </div>
      )}
    </div>
  );
}
