import { useCallback, useEffect, useState } from 'react';
import { collectorService } from '@/services/collectorService';
import { useAppToast } from '@/hooks/useAppToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Button } from '@/app/components/ui/button';
import { formatAdminDate } from '@/utils/adminHelpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PERIODS = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
];

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function CollectorReportsPage() {
  const { error, success } = useAppToast();
  const [period, setPeriod] = useState('30d');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await collectorService.getReport(period);
      setReport(data);
    } catch (err) {
      error(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [period, error]);

  useEffect(() => { load(); }, [load]);

  const exportPdf = () => {
    if (!report) return;
    const doc = new jsPDF();
    const img = new Image();
    img.src = '/src/images/greencare-icon.png';
    const buildPdf = () => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('GreenCare Collector Report', 36, 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Period: ${period} · Generated ${new Date().toLocaleString()}`, 36, 26);
      doc.text(`Completed: ${report.summary?.completed ?? 0} · Rate: ${report.summary?.completionRate ?? 0}%`, 14, 36);
      autoTable(doc, {
        startY: 44,
        head: [['Date', 'Resident', 'Waste', 'Qty', 'Status']],
        body: (report.activityLog || []).slice(0, 30).map((row) => [
          formatAdminDate(row.preferredDate, row.preferredTimeSlot),
          row.resident?.fullName || '—',
          row.wasteType,
          row.quantity,
          row.status,
        ]),
      });
      doc.save(`greencare-collector-report-${period}.pdf`);
      success('Report downloaded');
    };
    img.onload = () => {
      doc.addImage(img, 'JPEG', 14, 10, 18, 18);
      buildPdf();
    };
    img.onerror = () => buildPdf();
  };

  const summary = report?.summary || {};
  const dailyTrend = (report?.dailyTrend || []).map((d) => ({ day: d._id?.slice(5) || d._id, count: d.count }));
  const wasteChart = (report?.byWasteType || []).map((w) => ({ name: w._id, value: w.count }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d1f13]">Generate Report</h2>
          <p className="text-sm text-gray-500">Performance and pickup activity</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={exportPdf} disabled={loading || !report}>
          <Download className="h-4 w-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button key={p.id} type="button" onClick={() => setPeriod(p.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${period === p.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : (
          <>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Completed</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.completed ?? 0}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">In Progress</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.inProgress ?? 0}</p></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Completion Rate</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.completionRate ?? 0}%</p></CardContent></Card>
            <Card className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Career Pickups</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{summary.totalPickups ?? 0}</p></CardContent></Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="text-base">Daily Completions</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#16a34a" radius={4} /></BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="text-base">By Waste Type</CardTitle></CardHeader>
          <CardContent className="h-64">
            {loading ? <Skeleton className="h-full w-full" /> : wasteChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">No completed pickups in this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={wasteChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{wasteChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-gray-100 shadow-sm">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Activity Log</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (report?.activityLog || []).length === 0 ? (
            <p className="text-center py-8 text-gray-500 text-sm">No activity for this period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="py-2">Date</th><th>Resident</th><th>Type</th><th>Qty</th></tr></thead>
                <tbody>
                  {report.activityLog.map((row) => (
                    <tr key={row._id} className="border-b border-gray-50">
                      <td className="py-2">{formatAdminDate(row.preferredDate, row.preferredTimeSlot)}</td>
                      <td>{row.resident?.fullName || '—'}</td>
                      <td className="capitalize">{row.wasteType}</td>
                      <td className="capitalize">{row.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
