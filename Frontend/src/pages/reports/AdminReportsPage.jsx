import { useCallback, useEffect, useState } from 'react';
import { reportsService } from '@/services/reportsService';
import { useAppToast } from '@/hooks/useAppToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Button } from '@/app/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

const PERIODS = [{ id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }, { id: '90d', label: '90 days' }];

export function AdminReportsPage() {
  const { error, success } = useAppToast();
  const [period, setPeriod] = useState('30d');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReport(await reportsService.getAdminReport(period));
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  }, [period, error]);

  useEffect(() => { load(); }, [load]);

  const exportPdf = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.text('GreenCare Admin Report', 14, 18);
    doc.setFontSize(10);
    doc.text(`Period: ${period}`, 14, 26);
    const s = report.summary || {};
    doc.text(`Residents: ${s.totalResidents} | Collectors: ${s.totalCollectors} | Completed: ${s.completedCollections}`, 14, 32);
    doc.save(`greencare-admin-report-${period}.pdf`);
    success('Report downloaded');
  };

  const s = report?.summary || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-2xl font-bold">Generate Report</h2><p className="text-sm text-gray-500">System-wide operational analytics</p></div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={exportPdf} disabled={!report}><Download className="h-4 w-4 mr-2" />Export PDF</Button>
      </div>
      <div className="flex gap-2">{PERIODS.map((p) => (
        <button key={p.id} type="button" onClick={() => setPeriod(p.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${period === p.id ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>{p.label}</button>
      ))}</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : (
          <>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Residents</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{s.totalResidents ?? 0}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Completed Collections</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{s.completedCollections ?? 0}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Pending Requests</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{s.pendingRequests ?? 0}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Waste Scans</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{s.scansCount ?? 0}</p></CardContent></Card>
          </>
        )}
      </div>
      <Card className="rounded-2xl"><CardHeader><CardTitle className="text-base">Daily Completions</CardTitle></CardHeader>
        <CardContent className="h-64">
          {loading ? <Skeleton className="h-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(report?.dailyCollections || []).map((d) => ({ day: d._id?.slice(5), count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#16a34a" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
