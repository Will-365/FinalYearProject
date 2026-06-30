import { useCallback, useEffect, useState } from 'react';
import { reportsService } from '@/services/reportsService';
import { useAppToast } from '@/hooks/useAppToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Filter } from 'lucide-react';
import { generateProfessionalPDF } from '@/utils/pdfGenerator';
import api from '@/services/api';

const PERIODS = [{ id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }, { id: '90d', label: '90 days' }];

export function AdminReportsPage() {
  const { error, success } = useAppToast();
  const [period, setPeriod] = useState('30d');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // PDF Generator States
  const [dateRange, setDateRange] = useState('this-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('collection');
  const [generatingReport, setGeneratingReport] = useState(false);

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

  const exportPdf = async () => {
    try {
      setGeneratingReport(true);
      let data = [];
      let columns = [];
      let rows = [];
      let title = '';
      
      const params = {};
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      } else {
        params.period = dateRange;
      }
      
      const getArrayData = (obj) => {
        if (!obj) return [];
        if (Array.isArray(obj)) return obj;
        if (typeof obj === 'object') {
          for (const key of Object.keys(obj)) {
            if (Array.isArray(obj[key])) return obj[key];
          }
          if (obj.data) return getArrayData(obj.data);
        }
        return [];
      };

      if (selectedReportType === 'collection') {
        title = 'Collection Report';
        const res = await api.get('/admin/collections', { params });
        data = getArrayData(res.data);
        columns = ['Waste Type', 'Date', 'Address', 'Status', 'Priority', 'Assigned To'];
        rows = data.map((item) => [
          item.wasteType ? (item.wasteType.charAt(0).toUpperCase() + item.wasteType.slice(1)) : '-',
          new Date(item.createdAt).toLocaleDateString(),
          [item.location?.district, item.location?.sector].filter(Boolean).join(', ') || 'Unknown',
          item.status || 'pending',
          item.priority || 'normal',
          item.collectorInfo?.fullName || item.collector?.fullName || item.collector?.name || 'Unassigned'
        ]);
      } else if (selectedReportType === 'products') {
        title = 'Products & Inventory Report';
        const res = await api.get('/admin/catalog/products', { params });
        data = getArrayData(res.data);
        columns = ['Product ID', 'Name', 'Category', 'Stock', 'Cash Price (RWF)', 'Points Cost'];
        rows = data.map((item) => [
          item._id?.substring(0, 8) || '-',
          item.name || '-',
          item.category || '-',
          item.stock?.toString() || '0',
          item.cashPrice?.toLocaleString() || '-',
          item.pointsCost?.toString() || '-'
        ]);
      } else if (selectedReportType === 'wastes') {
        title = 'Waste Intake Report';
        const res = await api.get('/admin/waste-intake', { params });
        data = getArrayData(res.data);
        columns = ['Intake ID', 'Date', 'Waste Type', 'Weight (kg)', 'Stage', 'Source'];
        rows = data.map((item) => [
          item._id?.substring(0, 8) || '-',
          new Date(item.intakeDate || item.createdAt).toLocaleDateString(),
          item.wasteType || '-',
          item.weightKg?.toString() || '0',
          item.processingStatus || item.stage || '-',
          [item.location?.district, item.location?.sector].filter(Boolean).join(', ') || 'Unknown'
        ]);
      } else if (selectedReportType === 'centers') {
        title = 'Recycling Centers Report';
        const res = await api.get('/recycling/centers/nearest', { params: { limit: 1000 } });
        data = getArrayData(res.data);
        columns = ['Center Name', 'District', 'Latitude', 'Longitude', 'Hours', 'Status'];
        rows = data.map((item) => [
          item.name || '-',
          item.district || 'Kigali',
          item.latitude?.toFixed(4) || '-',
          item.longitude?.toFixed(4) || '-',
          item.hours || '-',
          item.isActive ? 'Active' : 'Inactive'
        ]);
      }

      if (!rows.length) {
        error('No data found for the selected period to generate a report.');
        return;
      }
      
      let periodStr = dateRange.replace('-', ' ').toUpperCase();
      if (dateRange === 'custom') {
        periodStr = `${customStartDate || '?'} to ${customEndDate || '?'}`;
      } else if (dateRange === 'today') {
        periodStr = new Date().toLocaleDateString();
      }
      
      const logoImg = await new Promise((resolve) => {
        const img = new Image();
        img.src = '/src/images/greencare-icon.png';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
      
      generateProfessionalPDF({
        title,
        period: periodStr,
        columns,
        rows,
        logoImg,
        filename: `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.pdf`
      });
      
      success('Report generated successfully!');
    } catch (err) {
      console.error(err);
      error(err?.response?.data?.message || 'Failed to generate report.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const s = report?.summary || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Generate Report</h2>
          <p className="text-sm text-gray-500">System-wide operational analytics</p>
        </div>
      </div>
      <Card className="mb-6 bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-2 block font-semibold text-gray-700">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collection">Collection Report</SelectItem>
                  <SelectItem value="products">Products & Inventory Report</SelectItem>
                  <SelectItem value="wastes">Waste Intake Report</SelectItem>
                  <SelectItem value="centers">Recycling Centers Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="mb-2 block font-semibold text-gray-700">Time Period</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div className="w-[150px]">
                  <Label className="mb-2 block font-semibold text-gray-700">Start Date</Label>
                  <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="bg-white border-gray-300" />
                </div>
                <div className="w-[150px]">
                  <Label className="mb-2 block font-semibold text-gray-700">End Date</Label>
                  <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="bg-white border-gray-300" />
                </div>
              </>
            )}

            <Button 
              className="bg-green-600 hover:bg-green-700 shadow-md h-10 px-6 font-semibold" 
              onClick={exportPdf} 
              disabled={generatingReport}
            >
              {generatingReport ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> Generating...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> Export PDF Report</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-2">
        <h3 className="font-semibold text-gray-700 mr-2 flex items-center">Dashboard Stats:</h3>
        {PERIODS.map((p) => (
        <button key={p.id} type="button" onClick={() => setPeriod(p.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${period === p.id ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}>{p.label}</button>
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
