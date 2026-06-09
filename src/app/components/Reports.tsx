import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { 
  Download, 
  FileText, 
  Calendar,
  TrendingUp,
  Leaf,
  Award,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Package,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  FileDown,
  Filter,
  MapPin,
  Recycle,
  Gift,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

// Resident report data
const residentWasteData = [
  { id: 'rw1', type: 'Organic', weight: 45.6, color: '#10b981' },
  { id: 'rw2', type: 'Plastic', weight: 28.3, color: '#3b82f6' },
  { id: 'rw3', type: 'General', weight: 18.2, color: '#6b7280' },
];

const residentPointsData = [
  { id: 'rp1', month: 'Oct', points: 45 },
  { id: 'rp2', month: 'Nov', points: 62 },
  { id: 'rp3', month: 'Dec', points: 58 },
  { id: 'rp4', month: 'Jan', points: 77 },
];

const residentCollections = [
  { date: '2026-04-10', wasteType: 'Organic', weight: 12.5, points: 25, status: 'Completed' },
  { date: '2026-04-07', wasteType: 'Plastic', weight: 8.3, points: 20, status: 'Completed' },
  { date: '2026-04-03', wasteType: 'General', weight: 15.0, points: 15, status: 'Completed' },
  { date: '2026-03-30', wasteType: 'Organic', weight: 10.2, points: 20, status: 'Completed' },
  { date: '2026-03-26', wasteType: 'Plastic', weight: 6.5, points: 15, status: 'Completed' },
];

// Collector report data
const collectorDailyPickups = [
  { id: 'cd1', day: 'Mon', pickups: 28, target: 25 },
  { id: 'cd2', day: 'Tue', pickups: 32, target: 25 },
  { id: 'cd3', day: 'Wed', pickups: 27, target: 25 },
  { id: 'cd4', day: 'Thu', pickups: 30, target: 25 },
  { id: 'cd5', day: 'Fri', pickups: 35, target: 25 },
  { id: 'cd6', day: 'Sat', pickups: 22, target: 20 },
];

const collectorPerformanceData = [
  { id: 'cp1', week: 'Week 1', completionRate: 96, efficiency: 92 },
  { id: 'cp2', week: 'Week 2', completionRate: 98, efficiency: 95 },
  { id: 'cp3', week: 'Week 3', completionRate: 97, efficiency: 93 },
  { id: 'cp4', week: 'Week 4', completionRate: 99, efficiency: 97 },
];

const collectorActivityLog = [
  { date: '2026-04-15', pickups: 35, completed: 34, missed: 1, weight: 425, onTime: 97, earnings: 8500 },
  { date: '2026-04-14', pickups: 32, completed: 32, missed: 0, weight: 390, onTime: 100, earnings: 8000 },
  { date: '2026-04-13', pickups: 28, completed: 27, missed: 1, weight: 340, onTime: 96, earnings: 7000 },
  { date: '2026-04-12', pickups: 30, completed: 30, missed: 0, weight: 375, onTime: 100, earnings: 7500 },
  { date: '2026-04-11', pickups: 27, completed: 26, missed: 1, weight: 320, onTime: 96, earnings: 6800 },
];

// Generate hourly data for "Today" view
const generateHourlyData = () => {
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  return hours.map((hour, idx) => ({
    id: `hourly-${idx}`,
    period: hour,
    pickups: Math.floor(Math.random() * 5) + 2,
    target: 4,
    completed: Math.floor(Math.random() * 4) + 2,
    missed: Math.random() > 0.7 ? 1 : 0,
    weight: Math.floor(Math.random() * 50) + 30,
    onTime: Math.random() > 0.3 ? 100 : 95,
    earnings: Math.floor(Math.random() * 1000) + 500
  }));
};

// Generate daily data for "This Week" view
const generateWeeklyData = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map((day, idx) => ({
    id: `weekly-${idx}`,
    period: day,
    pickups: Math.floor(Math.random() * 10) + 25,
    target: 25,
    completed: Math.floor(Math.random() * 8) + 24,
    missed: Math.random() > 0.8 ? 1 : 0,
    weight: Math.floor(Math.random() * 100) + 300,
    onTime: Math.floor(Math.random() * 5) + 95,
    earnings: Math.floor(Math.random() * 2000) + 6000
  }));
};

// Generate weekly data for "This Month" view
const generateMonthlyData = () => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  return weeks.map((week, idx) => ({
    id: `monthly-${idx}`,
    period: week,
    pickups: Math.floor(Math.random() * 20) + 150,
    target: 140,
    completed: Math.floor(Math.random() * 15) + 145,
    missed: Math.floor(Math.random() * 3) + 1,
    weight: Math.floor(Math.random() * 300) + 1800,
    onTime: Math.floor(Math.random() * 4) + 96,
    earnings: Math.floor(Math.random() * 5000) + 35000
  }));
};

// Admin report data
const adminCollectionData = [
  { id: 'ac1', district: 'Gasabo', total: 1250, completed: 1198, missed: 52, weight: 15600 },
  { id: 'ac2', district: 'Kicukiro', total: 980, completed: 945, missed: 35, weight: 12300 },
  { id: 'ac3', district: 'Nyarugenge', total: 1120, completed: 1089, missed: 31, weight: 14100 },
];

const adminMonthlyTrend = [
  { id: 'amt1', month: 'Oct', collections: 2850, recycled: 2280, landfill: 570 },
  { id: 'amt2', month: 'Nov', collections: 3100, recycled: 2480, landfill: 620 },
  { id: 'amt3', month: 'Dec', collections: 3280, recycled: 2624, landfill: 656 },
  { id: 'amt4', month: 'Jan', collections: 3350, recycled: 2680, landfill: 670 },
];

const adminRecyclingData = [
  { id: 'ar1', category: 'Compost Produced', value: 2450, unit: 'kg', trend: '+12%' },
  { id: 'ar2', category: 'Plastic Processed', value: 1280, unit: 'kg', trend: '+8%' },
  { id: 'ar3', category: 'Inventory (Compost)', value: 850, unit: 'kg', trend: '-5%' },
  { id: 'ar4', category: 'Inventory (Plastic)', value: 420, unit: 'kg', trend: '+3%' },
];

const adminIncentiveData = [
  { id: 'ai1', month: 'Oct', pointsIssued: 45600, redeemed: 38200, participants: 2340 },
  { id: 'ai2', month: 'Nov', pointsIssued: 52100, redeemed: 43500, participants: 2580 },
  { id: 'ai3', month: 'Dec', pointsIssued: 58900, redeemed: 48700, participants: 2820 },
  { id: 'ai4', month: 'Jan', pointsIssued: 62400, redeemed: 51200, participants: 3050 },
];

interface ReportsProps {
  userRole?: string;
}

export function Reports({ userRole }: ReportsProps) {
  const [dateRange, setDateRange] = useState('this-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('collection');

  // RESIDENT REPORTS
  if (userRole === 'resident' || !userRole) {
    const totalWaste = residentWasteData.reduce((sum, item) => sum + item.weight, 0);
    const totalPoints = residentPointsData.reduce((sum, item) => sum + item.points, 0);
    const co2Saved = (totalWaste * 2.1).toFixed(1); // Mock calculation
    const wasteFromLandfill = totalWaste;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-bold text-2xl">My Impact Reports</h2>
          <p className="text-gray-600 mt-1">Track your recycling journey and environmental impact</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 block">Report Period</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
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
                  <div className="flex-1 min-w-[150px]">
                    <Label className="mb-2 block">Start Date</Label>
                    <Input 
                      type="date" 
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <Label className="mb-2 block">End Date</Label>
                    <Input 
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button className="bg-green-600 hover:bg-green-700">
                <Filter className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Waste Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-green-600">{totalWaste.toFixed(1)} kg</div>
              <p className="text-xs text-gray-600 mt-1">Last 4 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Points Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-blue-600">{totalPoints}</div>
              <p className="text-xs text-gray-600 mt-1">Recycling rewards</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">CO₂ Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-purple-600">{co2Saved} kg</div>
              <p className="text-xs text-gray-600 mt-1">Carbon offset</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recycling Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-green-600">82%</div>
              <p className="text-xs text-gray-600 mt-1">Above average</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Waste Breakdown by Type</CardTitle>
              <CardDescription>Distribution of collected materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div key="resident-waste-pie-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={residentWasteData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, weight }) => `${type}: ${weight}kg`}
                      outerRadius={100}
                      dataKey="weight"
                      nameKey="type"
                    >
                      {residentWasteData.map((entry) => (
                        <Cell key={`cell-${entry.id}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {residentWasteData.map((item) => (
                  <div key={item.type} className="text-center">
                    <div className="w-4 h-4 rounded mx-auto mb-1" style={{ backgroundColor: item.color }} />
                    <p className="text-xs font-medium">{item.type}</p>
                    <p className="text-xs text-gray-600">{item.weight} kg</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Points Earned Over Time</CardTitle>
              <CardDescription>Your recycling rewards growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div key="resident-points-line-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={residentPointsData} syncId="residentPoints">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="points" stroke="#16a34a" strokeWidth={2} name="Points" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environmental Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Environmental Impact Summary</CardTitle>
            <CardDescription>Your contribution to sustainability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">CO₂ Emissions Saved</p>
                    <p className="font-bold text-xl text-green-600">{co2Saved} kg</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Equivalent to planting 4 trees</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <Recycle className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Waste Diverted</p>
                    <p className="font-bold text-xl text-blue-600">{wasteFromLandfill.toFixed(1)} kg</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Kept from landfills</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Community Rank</p>
                    <p className="font-bold text-xl text-purple-600">Top 15%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Among all participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Collection History</CardTitle>
            <CardDescription>Detailed breakdown of your submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Waste Type</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Weight (kg)</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Points</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {residentCollections.map((collection, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{collection.date}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant="outline">{collection.wasteType}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-right">{collection.weight}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                        +{collection.points}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {collection.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Export Report</CardTitle>
            <CardDescription>Download your impact report for records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-red-600 hover:bg-red-700">
                <FileText className="h-4 w-4 mr-2" />
                Download PDF Report
              </Button>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // COLLECTOR REPORTS
  if (userRole === 'collector') {
    // Generate dynamic data based on selected date range
    const chartData = useMemo(() => {
      switch (dateRange) {
        case 'today':
          return generateHourlyData();
        case 'this-week':
          return generateWeeklyData();
        case 'this-month':
          return generateMonthlyData();
        default:
          return collectorDailyPickups;
      }
    }, [dateRange]);

    const activityData = useMemo(() => {
      switch (dateRange) {
        case 'today':
          return generateHourlyData();
        case 'this-week':
          return generateWeeklyData();
        case 'this-month':
          return generateMonthlyData();
        default:
          return collectorActivityLog;
      }
    }, [dateRange]);

    // Get period label based on date range
    const getPeriodLabel = () => {
      switch (dateRange) {
        case 'today':
          return 'Time';
        case 'this-week':
          return 'Day';
        case 'this-month':
          return 'Week';
        default:
          return 'Date';
      }
    };

    // Get chart title based on date range
    const getChartTitle = () => {
      switch (dateRange) {
        case 'today':
          return 'Hourly Pickups';
        case 'this-week':
          return 'Daily Pickups';
        case 'this-month':
          return 'Weekly Pickups';
        default:
          return 'Daily Pickups';
      }
    };

    // Get chart description based on date range
    const getChartDescription = () => {
      switch (dateRange) {
        case 'today':
          return 'Pickups completed per hour vs target';
        case 'this-week':
          return 'Pickups completed per day vs target';
        case 'this-month':
          return 'Pickups completed per week vs target';
        default:
          return 'Pickups completed vs target';
      }
    };

    const totalPickups = activityData.reduce((sum, day) => sum + day.pickups, 0);
    const totalCompleted = activityData.reduce((sum, day) => sum + day.completed, 0);
    const totalMissed = activityData.reduce((sum, day) => sum + day.missed, 0);
    const totalWeight = activityData.reduce((sum, day) => sum + day.weight, 0);
    const avgOnTime = (activityData.reduce((sum, day) => sum + day.onTime, 0) / activityData.length).toFixed(1);
    const totalEarnings = activityData.reduce((sum, day) => sum + day.earnings, 0);

    // PDF Export Function
    const handlePDFExport = () => {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.text('Collector Performance Report', 14, 22);
      
      doc.setFontSize(11);
      doc.text(`Report Period: ${dateRange}`, 14, 32);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
      
      // Add summary metrics
      doc.setFontSize(14);
      doc.text('Summary Metrics', 14, 50);
      
      doc.setFontSize(10);
      doc.text(`Total Pickups: ${totalPickups}`, 14, 58);
      doc.text(`Completed: ${totalCompleted}`, 14, 64);
      doc.text(`Missed: ${totalMissed}`, 14, 70);
      doc.text(`Completion Rate: ${((totalCompleted / totalPickups) * 100).toFixed(1)}%`, 14, 76);
      doc.text(`Total Weight: ${totalWeight.toLocaleString()} kg`, 14, 82);
      doc.text(`Total Earnings: RWF ${totalEarnings.toLocaleString()}`, 14, 88);
      
      // Add activity log table
      const tableData = activityData.map(item => [
        item.period || item.date,
        item.pickups,
        item.completed,
        item.missed,
        item.weight,
        `${item.onTime}%`,
        `RWF ${item.earnings.toLocaleString()}`
      ]);
      
      autoTable(doc, {
        startY: 95,
        head: [[getPeriodLabel(), 'Pickups', 'Completed', 'Missed', 'Weight (kg)', 'On-Time %', 'Earnings']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }
      });
      
      doc.save(`collector-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report downloaded successfully!');
    };

    // CSV Export Function
    const handleCSVExport = () => {
      const headers = [getPeriodLabel(), 'Pickups', 'Completed', 'Missed', 'Weight (kg)', 'On-Time %', 'Earnings'];
      const rows = activityData.map(item => [
        item.period || item.date,
        item.pickups,
        item.completed,
        item.missed,
        item.weight,
        `${item.onTime}%`,
        `RWF ${item.earnings.toLocaleString()}`
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `collector-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV data exported successfully!');
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-bold text-2xl">Work Performance Reports</h2>
          <p className="text-gray-600 mt-1">Track your collection activity and earnings</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-2 block">Report Period</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
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
                  <div className="flex-1 min-w-[150px]">
                    <Label className="mb-2 block">Start Date</Label>
                    <Input 
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <Label className="mb-2 block">End Date</Label>
                    <Input 
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button className="bg-green-600 hover:bg-green-700">
                <Filter className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pickups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-blue-600">{totalPickups}</div>
              <p className="text-xs text-gray-600 mt-1">{totalCompleted} completed, {totalMissed} missed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-green-600">
                {((totalCompleted / totalPickups) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Above target (95%)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Weight Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-purple-600">{totalWeight.toLocaleString()} kg</div>
              <p className="text-xs text-gray-600 mt-1">{dateRange === 'today' ? 'Today' : dateRange === 'this-week' ? 'This week' : dateRange === 'this-month' ? 'This month' : 'Selected period'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl text-green-600">RWF {totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">{dateRange === 'today' ? 'Today' : dateRange === 'this-week' ? 'This week' : dateRange === 'this-month' ? 'This month' : 'Selected period'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">
                    {dateRange === 'today' ? 'Avg Pickups/Hour' : 
                     dateRange === 'this-week' ? 'Avg Pickups/Day' : 
                     dateRange === 'this-month' ? 'Avg Pickups/Week' : 'Avg Pickups/Day'}
                  </p>
                  <p className="font-bold text-lg">{(totalPickups / activityData.length).toFixed(1)}</p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">On-Time Rate</p>
                  <p className="font-bold text-lg">{avgOnTime}%</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Issues Reported</p>
                  <p className="font-bold text-lg">{totalMissed}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Avg Weight/Pickup</p>
                  <p className="font-bold text-lg">{(totalWeight / totalCompleted).toFixed(1)} kg</p>
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{getChartTitle()}</CardTitle>
              <CardDescription>{getChartDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div key={`collector-bar-chart-${dateRange}`}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} syncId={`collector-${dateRange}`}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pickups" fill="#16a34a" name="Completed" />
                    <Bar dataKey="target" fill="#d1d5db" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trend</CardTitle>
            <CardDescription>Completion rate and efficiency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div key="collector-performance-area-chart">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={collectorPerformanceData} syncId="collectorPerformance">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="completionRate" stroke="#16a34a" fill="#bbf7d0" name="Completion Rate %" />
                  <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" fill="#bfdbfe" name="Efficiency %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>{dateRange === 'today' ? 'Hourly Activity Log' : dateRange === 'this-week' ? 'Daily Activity Log' : dateRange === 'this-month' ? 'Weekly Activity Log' : 'Activity Log'}</CardTitle>
            <CardDescription>Detailed breakdown of your work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">{getPeriodLabel()}</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Pickups</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Completed</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Missed</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Weight (kg)</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">On-Time %</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {activityData.map((day, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{day.period || day.date}</td>
                      <td className="py-3 px-4 text-sm text-right">{day.pickups}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className="text-green-600 font-medium">{day.completed}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        {day.missed > 0 ? (
                          <span className="text-red-600 font-medium">{day.missed}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">{day.weight}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <Badge className={day.onTime === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {day.onTime}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                        RWF {day.earnings.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Export Report</CardTitle>
            <CardDescription>Download your performance report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-red-600 hover:bg-red-700" onClick={handlePDFExport}>
                <FileText className="h-4 w-4 mr-2" />
                Download PDF Report
              </Button>
              <Button variant="outline" onClick={handleCSVExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ADMIN REPORTS
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl">Operational & Compliance Reports</h2>
        <p className="text-gray-600 mt-1">System-wide analytics and performance tracking</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-2 block">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collection">Collection Report</SelectItem>
                  <SelectItem value="zone">Zone Performance Report</SelectItem>
                  <SelectItem value="recycling">Recycling & Production Report</SelectItem>
                  <SelectItem value="incentive">Incentive & Participation Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="mb-2 block">Time Period</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
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
                <div className="flex-1 min-w-[150px]">
                  <Label className="mb-2 block">Start Date</Label>
                  <Input 
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <Label className="mb-2 block">End Date</Label>
                  <Input 
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button className="bg-green-600 hover:bg-green-700">
              <Filter className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-blue-600">3,350</div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+8.2%</span> vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">96.8%</div>
            <p className="text-xs text-gray-600 mt-1">Above target (95%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-purple-600">42,000 kg</div>
            <p className="text-xs text-gray-600 mt-1">Collected this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-blue-600">3,050</div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12.5%</span> growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection by District</CardTitle>
            <CardDescription>Performance across service areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminCollectionData.map((district) => (
                <div key={district.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{district.district}</span>
                    <span className="text-gray-600">{district.completed}/{district.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(district.completed / district.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Collections over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div key="admin-monthly-trend-chart">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={adminMonthlyTrend} syncId="adminMonthly">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="collections" fill="#3b82f6" name="Total" />
                  <Bar dataKey="recycled" fill="#16a34a" name="Recycled" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Download comprehensive reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-red-600 hover:bg-red-700">
              <FileText className="h-4 w-4 mr-2" />
              Download PDF Report
            </Button>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
