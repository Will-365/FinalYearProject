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
import { Download, MapPin } from 'lucide-react';
import { generateProfessionalPDF } from '@/utils/pdfGenerator';
import api from '@/services/api';

const PERIODS = [{ id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }, { id: '90d', label: '90 days' }];

// Rwanda – Kigali districts and their sectors
const DISTRICTS = [
  { value: 'all', label: 'All Districts' },
  { value: 'Gasabo', label: 'Gasabo' },
  { value: 'Kicukiro', label: 'Kicukiro' },
  { value: 'Nyarugenge', label: 'Nyarugenge' },
];

const SECTORS_BY_DISTRICT = {
  all: [{ value: 'all', label: 'All Sectors' }],
  Gasabo: [
    { value: 'all', label: 'All Sectors' },
    { value: 'Bumbogo', label: 'Bumbogo' },
    { value: 'Gatsata', label: 'Gatsata' },
    { value: 'Gikomero', label: 'Gikomero' },
    { value: 'Gisozi', label: 'Gisozi' },
    { value: 'Jabana', label: 'Jabana' },
    { value: 'Jali', label: 'Jali' },
    { value: 'Kacyiru', label: 'Kacyiru' },
    { value: 'Kimihurura', label: 'Kimihurura' },
    { value: 'Kimironko', label: 'Kimironko' },
    { value: 'Kinyinya', label: 'Kinyinya' },
    { value: 'Ndera', label: 'Ndera' },
    { value: 'Nduba', label: 'Nduba' },
    { value: 'Remera', label: 'Remera' },
    { value: 'Rusororo', label: 'Rusororo' },
    { value: 'Rutunga', label: 'Rutunga' },
  ],
  Kicukiro: [
    { value: 'all', label: 'All Sectors' },
    { value: 'Gahanga', label: 'Gahanga' },
    { value: 'Gatenga', label: 'Gatenga' },
    { value: 'Gikondo', label: 'Gikondo' },
    { value: 'Kagarama', label: 'Kagarama' },
    { value: 'Kanombe', label: 'Kanombe' },
    { value: 'Kicukiro', label: 'Kicukiro' },
    { value: 'Kigarama', label: 'Kigarama' },
    { value: 'Masaka', label: 'Masaka' },
    { value: 'Niboye', label: 'Niboye' },
    { value: 'Nyarugunga', label: 'Nyarugunga' },
  ],
  Nyarugenge: [
    { value: 'all', label: 'All Sectors' },
    { value: 'Gitega', label: 'Gitega' },
    { value: 'Kanyinya', label: 'Kanyinya' },
    { value: 'Kigali', label: 'Kigali' },
    { value: 'Kimisagara', label: 'Kimisagara' },
    { value: 'Mageragere', label: 'Mageragere' },
    { value: 'Muhima', label: 'Muhima' },
    { value: 'Nyakabanda', label: 'Nyakabanda' },
    { value: 'Nyamirambo', label: 'Nyamirambo' },
    { value: 'Nyarugenge', label: 'Nyarugenge' },
    { value: 'Rwezamenyo', label: 'Rwezamenyo' },
  ],
};

// Returns today's date as YYYY-MM-DD (for max= attribute on date inputs)
const todayStr = () => new Date().toISOString().split('T')[0];

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

  // Location filter
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');

  // When district changes, reset sector
  const handleDistrictChange = (val) => {
    setSelectedDistrict(val);
    setSelectedSector('all');
  };

  const sectorOptions = SECTORS_BY_DISTRICT[selectedDistrict] || SECTORS_BY_DISTRICT.all;

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

      // Attach location filters
      if (selectedDistrict !== 'all') params.district = selectedDistrict;
      if (selectedSector !== 'all') params.sector = selectedSector;

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

      // Client-side location filtering helper (in case backend doesn't support it)
      const matchesLocation = (item) => {
        const itemDistrict = item.location?.district || '';
        const itemSector = item.location?.sector || '';
        if (selectedDistrict !== 'all' && itemDistrict.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
        if (selectedSector !== 'all' && itemSector.toLowerCase() !== selectedSector.toLowerCase()) return false;
        return true;
      };

      if (selectedReportType === 'collection') {
        title = 'Collection Report';
        const res = await api.get('/admin/collections', { params });
        data = getArrayData(res.data).filter(matchesLocation);
        columns = ['#', 'Waste Type', 'Date', 'Address', 'Status', 'Priority', 'Assigned To'];
        rows = data.map((item, idx) => [
          idx + 1,
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
        columns = ['#', 'Product ID', 'Name', 'Category', 'Stock', 'Cash Price (RWF)', 'Points Cost'];
        rows = data.map((item, idx) => [
          idx + 1,
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
        data = getArrayData(res.data).filter(matchesLocation);
        columns = ['#', 'Intake ID', 'Date', 'Waste Type', 'Weight (kg)', 'Stage', 'Source'];
        rows = data.map((item, idx) => [
          idx + 1,
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
        data = getArrayData(res.data).filter(item => {
          if (selectedDistrict !== 'all' && (item.district || '').toLowerCase() !== selectedDistrict.toLowerCase()) return false;
          return true;
        });
        columns = ['#', 'Center Name', 'District', 'Latitude', 'Longitude', 'Hours', 'Status'];
        rows = data.map((item, idx) => [
          idx + 1,
          item.name || '-',
          item.district || 'Kigali',
          item.latitude?.toFixed(4) || '-',
          item.longitude?.toFixed(4) || '-',
          item.hours || '-',
          item.isActive ? 'Active' : 'Inactive'
        ]);
      }

      if (!rows.length) {
        error('No data found for the selected filters to generate a report.');
        return;
      }

      let periodStr = dateRange.replace('-', ' ').toUpperCase();
      if (dateRange === 'custom') {
        periodStr = `${customStartDate || '?'} to ${customEndDate || '?'}`;
      } else if (dateRange === 'today') {
        periodStr = new Date().toLocaleDateString();
      }

      // Append location to period string
      if (selectedDistrict !== 'all') {
        periodStr += ` | ${selectedDistrict}${selectedSector !== 'all' ? ' – ' + selectedSector : ''}`;
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {/* Report Type */}
            <div>
              <Label className="mb-2 block font-semibold text-gray-700">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white">
                  <SelectItem value="collection">Collection Report</SelectItem>
                  <SelectItem value="products">Products &amp; Inventory Report</SelectItem>
                  <SelectItem value="wastes">Waste Intake Report</SelectItem>
                  <SelectItem value="centers">Recycling Centers Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Period */}
            <div>
              <Label className="mb-2 block font-semibold text-gray-700">Time Period</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white">
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom dates — only shown when "custom" is selected */}
            {dateRange === 'custom' && (
              <>
                <div>
                  <Label className="mb-2 block font-semibold text-gray-700">Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    max={todayStr()}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label className="mb-2 block font-semibold text-gray-700">End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    min={customStartDate || undefined}
                    max={todayStr()}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>
              </>
            )}

            {/* District Filter */}
            <div>
              <Label className="mb-2 block font-semibold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-green-600" /> District
              </Label>
              <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white">
                  {DISTRICTS.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sector Filter */}
            <div>
              <Label className="mb-2 block font-semibold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Sector
              </Label>
              <Select value={selectedSector} onValueChange={setSelectedSector} disabled={selectedDistrict === 'all'}>
                <SelectTrigger className={`bg-white border-gray-300 ${selectedDistrict === 'all' ? 'opacity-50' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white">
                  {sectorOptions.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Active filter badge */}
          {(selectedDistrict !== 'all' || selectedSector !== 'all') && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Filtering by:</span>
              <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                {selectedDistrict !== 'all' ? selectedDistrict : ''}
                {selectedSector !== 'all' ? ` › ${selectedSector}` : ''}
              </span>
              <button
                onClick={() => { setSelectedDistrict('all'); setSelectedSector('all'); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕ Clear
              </button>
            </div>
          )}

          <div className="mt-4 flex justify-end">
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
        ))}
      </div>

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

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base">Daily Completions</CardTitle></CardHeader>
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
