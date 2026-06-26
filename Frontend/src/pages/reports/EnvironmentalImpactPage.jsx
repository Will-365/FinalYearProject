import { useCallback, useEffect, useState } from 'react';
import { reportsService } from '@/services/reportsService';
import { useAppToast } from '@/hooks/useAppToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Leaf, TreePine, Recycle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function EnvironmentalImpactPage() {
  const { error } = useAppToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsService.getEnvironmentalImpact();
      setData(res);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, [load]);

  const summary = data?.summary || {};
  const wasteChart = (data?.wasteByType || []).map((w) => ({ name: w.type, value: w.amount }));
  const monthly = (data?.monthlyTrend || []).map((m) => ({ month: m._id, scans: m.scans }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Environmental Impact</h2>
        <p className="text-sm text-gray-500">Track your contribution to a greener Rwanda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : (
          <>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 flex items-center gap-1"><Leaf className="h-4 w-4" />CO₂ Saved</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.co2SavedKg ?? 0} kg</p></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 flex items-center gap-1"><Recycle className="h-4 w-4" />Diverted</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.landfillDivertedKg ?? 0} kg</p></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 flex items-center gap-1"><TreePine className="h-4 w-4" />Tree Equivalent</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.treesEquivalent ?? 0}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 flex items-center gap-1"><Award className="h-4 w-4" />Points Earned</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.totalPointsEarned ?? 0}</p></CardContent></Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Waste by Type</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loading ? <Skeleton className="h-full" /> : wasteChart.length === 0 ? <p className="text-sm text-gray-400 text-center pt-16">Scan waste or complete collections to see impact</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={wasteChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{wasteChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Monthly Scans</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loading ? <Skeleton className="h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="scans" fill="#16a34a" radius={4} /></BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
