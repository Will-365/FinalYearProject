import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Search, Filter, Download, Bell, ChevronDown, MapPin, Activity,
  AlertTriangle, CheckCircle2, Clock, Truck, User, TrendingUp,
  Package, Leaf, Construction, Send, FileText, UserPlus, RotateCcw,
  Zap, Circle, Settings, Database, ArrowRight, Calendar, FileDown,
  Phone, Edit, Eye, X, Trash2, Plus, Check
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

// Mock data for live activity feed
const liveActivities = [
  { id: 1, time: '2 min ago', status: 'in-progress', collector: 'Jean Baptiste', location: 'Gasabo - Remera', type: 'Pickup in progress', bin: 'RW-2847' },
  { id: 2, time: '5 min ago', status: 'completed', collector: 'Marie Uwase', location: 'Kicukiro - Gatenga', type: 'Pickup completed', bin: 'RW-3192' },
  { id: 3, time: '8 min ago', status: 'missed', collector: 'Patrick Nkusi', location: 'Nyarugenge - Nyarugenge', type: 'Missed pickup', bin: 'RW-4521' },
  { id: 4, time: '12 min ago', status: 'alert', collector: 'System', location: 'Gasabo - Kacyiru', type: 'Overflow alert', bin: 'RW-5673' },
  { id: 5, time: '15 min ago', status: 'in-progress', collector: 'Emmanuel Habimana', location: 'Kicukiro - Niboye', type: 'Pickup in progress', bin: 'RW-6894' },
  { id: 6, time: '18 min ago', status: 'completed', collector: 'Grace Murekatete', location: 'Gasabo - Kimironko', type: 'Pickup completed', bin: 'RW-7235' },
  { id: 7, time: '22 min ago', status: 'missed', collector: 'David Mukasa', location: 'Kicukiro - Gikondo', type: 'Missed pickup', bin: 'RW-8456' },
  { id: 8, time: '25 min ago', status: 'in-progress', collector: 'Sarah Ingabire', location: 'Nyarugenge - Muhima', type: 'Pickup in progress', bin: 'RW-9127' },
];

// Mock data for collector activity
const collectorStatus = [
  { id: 1, name: 'Jean Baptiste', status: 'active', route: 'RT-001', pickups: 12, pending: 3, location: 'Gasabo - Remera' },
  { id: 2, name: 'Marie Uwase', status: 'active', route: 'RT-002', pickups: 15, pending: 2, location: 'Kicukiro - Gatenga' },
  { id: 3, name: 'Patrick Nkusi', status: 'delayed', route: 'RT-003', pickups: 8, pending: 7, location: 'Nyarugenge - Nyarugenge' },
  { id: 4, name: 'Emmanuel Habimana', status: 'active', route: 'RT-004', pickups: 14, pending: 1, location: 'Kicukiro - Niboye' },
  { id: 5, name: 'Grace Murekatete', status: 'active', route: 'RT-005', pickups: 16, pending: 2, location: 'Gasabo - Kimironko' },
  { id: 6, name: 'David Mukasa', status: 'inactive', route: 'RT-006', pickups: 3, pending: 12, location: 'Not assigned' },
];

// Mock data for zone performance heatmap
const zonePerformance = [
  { zone: 'Gasabo - Remera', today: 92, week: 88, collectors: 5, pending: 8 },
  { zone: 'Gasabo - Kacyiru', today: 88, week: 85, collectors: 4, pending: 12 },
  { zone: 'Gasabo - Kimironko', today: 95, week: 91, collectors: 6, pending: 5 },
  { zone: 'Kicukiro - Gatenga', today: 78, week: 72, collectors: 4, pending: 24 },
  { zone: 'Kicukiro - Niboye', today: 65, week: 68, collectors: 3, pending: 38 },
  { zone: 'Kicukiro - Gikondo', today: 82, week: 79, collectors: 5, pending: 15 },
  { zone: 'Nyarugenge - Nyarugenge', today: 95, week: 93, collectors: 6, pending: 5 },
  { zone: 'Nyarugenge - Muhima', today: 89, week: 86, collectors: 5, pending: 10 },
];

// Mock data for pending actions
const pendingActions = [
  { id: 1, type: 'reassign', title: 'Reassign Missed Pickup', location: 'Nyarugenge - Nyarugenge', bin: 'RW-4521', priority: 'high' },
  { id: 2, type: 'approve', title: 'Approve Compost Batch #CB-2401', quantity: '2.5 tons', priority: 'medium' },
  { id: 3, type: 'assign', title: 'Assign Collector to Route RT-007', zone: 'Gasabo - Kagugu', priority: 'high' },
  { id: 4, type: 'approve', title: 'Approve Paver Production #PP-1523', quantity: '450 units', priority: 'low' },
  { id: 5, type: 'review', title: 'Review Overflow Report', location: 'Gasabo - Kacyiru', bin: 'RW-5673', priority: 'medium' },
];

// Mock collector data for Collector Management tab
const mockCollectors = [
  {
    id: 'COL-001',
    name: 'Jean Baptiste Uwimana',
    phone: '+250 788 123 456',
    zone: 'Gasabo - Remera',
    status: 'active',
    completedToday: 6,
    pendingPickups: 2,
    completedThisMonth: 124,
    completionRate: 97.6,
    performanceScore: 97
  },
  {
    id: 'COL-002',
    name: 'Marie Uwase Kamanzi',
    phone: '+250 788 234 567',
    zone: 'Kicukiro - Gatenga',
    status: 'active',
    completedToday: 10,
    pendingPickups: 2,
    completedThisMonth: 156,
    completionRate: 95.1,
    performanceScore: 95
  },
  {
    id: 'COL-003',
    name: 'Patrick Nkusi Mugabo',
    phone: '+250 788 345 678',
    zone: 'Nyarugenge - Nyarugenge',
    status: 'active',
    completedToday: 5,
    pendingPickups: 0,
    completedThisMonth: 98,
    completionRate: 98.0,
    performanceScore: 98
  },
  {
    id: 'COL-004',
    name: 'Emmanuel Habimana',
    phone: '+250 788 456 789',
    zone: 'Gasabo - Kacyiru',
    status: 'active',
    completedToday: 5,
    pendingPickups: 1,
    completedThisMonth: 82,
    completionRate: 98.8,
    performanceScore: 99
  },
  {
    id: 'COL-005',
    name: 'Grace Murekatete',
    phone: '+250 788 567 890',
    zone: 'Gasabo - Kimironko',
    status: 'inactive',
    completedToday: 0,
    pendingPickups: 0,
    completedThisMonth: 145,
    completionRate: 96.0,
    performanceScore: 96
  }
];

// Mock collection requests data
const mockRequests = [
  {
    id: 'REQ-2024-001',
    residentName: 'Jean Mutabazi',
    phone: '+250 788 123 456',
    zone: 'Gasabo - Remera',
    wasteType: 'Organic',
    estimatedWeight: 25,
    status: 'pending',
    submittedAt: '2026-04-21 08:30',
    assignedCollector: null
  },
  {
    id: 'REQ-2024-002',
    residentName: 'Marie Uwase',
    phone: '+250 788 234 567',
    zone: 'Kicukiro - Gatenga',
    wasteType: 'Plastic',
    estimatedWeight: 15,
    status: 'assigned',
    submittedAt: '2026-04-21 09:15',
    assignedCollector: 'Jean Baptiste'
  },
  {
    id: 'REQ-2024-003',
    residentName: 'Patrick Nkusi',
    phone: '+250 788 345 678',
    zone: 'Nyarugenge - Nyarugenge',
    wasteType: 'Recyclables',
    estimatedWeight: 65,
    status: 'in-progress',
    submittedAt: '2026-04-21 07:00',
    assignedCollector: 'Marie Uwase'
  },
  {
    id: 'REQ-2024-004',
    residentName: 'Grace Murekatete',
    phone: '+250 788 456 789',
    zone: 'Gasabo - Kacyiru',
    wasteType: 'General Waste',
    estimatedWeight: 8,
    status: 'completed',
    submittedAt: '2026-04-20 14:20',
    assignedCollector: 'Emmanuel Habimana',
    completedAt: '2026-04-21 10:45',
    actualWeight: 9
  },
  {
    id: 'REQ-2024-005',
    residentName: 'Emmanuel Habimana',
    phone: '+250 788 567 890',
    zone: 'Kicukiro - Niboye',
    wasteType: 'Organic',
    estimatedWeight: 32,
    status: 'completed',
    submittedAt: '2026-04-20 11:00',
    assignedCollector: 'Patrick Nkusi',
    completedAt: '2026-04-21 09:30',
    actualWeight: 34
  },
  {
    id: 'REQ-2024-006',
    residentName: 'David Mukasa',
    phone: '+250 788 678 901',
    zone: 'Nyarugenge - Muhima',
    wasteType: 'Plastic',
    estimatedWeight: 12,
    status: 'missed',
    submittedAt: '2026-04-20 15:45',
    assignedCollector: 'Grace Murekatete'
  }
];

export function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('today');
  const [selectedZone, setSelectedZone] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'missed':
        return 'text-red-600 bg-red-50';
      case 'alert':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCollectorStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'delayed':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 75) return 'bg-yellow-500';
    if (value >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Filter data based on date and zone selections
  const filteredCollectors = useMemo(() => {
    return mockCollectors.filter(collector => {
      if (selectedZone === 'all') return true;
      return collector.zone.toLowerCase().includes(selectedZone.toLowerCase());
    });
  }, [selectedZone]);

  const filteredRequests = useMemo(() => {
    return mockRequests.filter(request => {
      if (selectedZone === 'all') return true;
      return request.zone.toLowerCase().includes(selectedZone.toLowerCase());
    });
  }, [selectedZone]);

  // Export functions for Dashboard tab
  const handleDashboardPDFExport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Green Care Rwanda - Dashboard Report', 14, 22);

    doc.setFontSize(11);
    doc.text(`Period: ${dateRange}`, 14, 32);
    doc.text(`Zone: ${selectedZone === 'all' ? 'All Zones' : selectedZone}`, 14, 38);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 44);

    doc.setFontSize(14);
    doc.text('Summary Metrics', 14, 56);

    doc.setFontSize(10);
    doc.text('Today Pickups: 187', 14, 64);
    doc.text('Collected: 4.2 tons', 14, 70);
    doc.text('Missed: 12', 14, 76);
    doc.text('Active Collectors: 52', 14, 82);

    doc.setFontSize(14);
    doc.text('Zone Performance', 14, 94);

    const zoneTableData = zonePerformance.map(zone => [
      zone.zone,
      `${zone.today}%`,
      `${zone.week}%`,
      zone.collectors,
      zone.pending
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['Zone', 'Today', 'Week Avg', 'Collectors', 'Pending']],
      body: zoneTableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] }
    });

    doc.save(`dashboard-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Dashboard report downloaded successfully!');
  };

  const handleDashboardCSVExport = () => {
    const headers = ['Zone', 'Today %', 'Week Avg %', 'Collectors', 'Pending'];
    const rows = zonePerformance.map(zone => [
      zone.zone,
      zone.today,
      zone.week,
      zone.collectors,
      zone.pending
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Dashboard data exported to CSV!');
  };

  // Export functions for Collector Management tab
  const handleCollectorPDFExport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Collector Management Report', 14, 22);

    doc.setFontSize(11);
    doc.text(`Period: ${dateRange}`, 14, 32);
    doc.text(`Zone: ${selectedZone === 'all' ? 'All Zones' : selectedZone}`, 14, 38);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 44);

    const tableData = filteredCollectors.map(collector => [
      collector.id,
      collector.name,
      collector.zone,
      collector.status,
      collector.completedThisMonth,
      `${collector.completionRate.toFixed(1)}%`,
      collector.performanceScore
    ]);

    autoTable(doc, {
      startY: 52,
      head: [['ID', 'Name', 'Zone', 'Status', 'Completed', 'Rate', 'Score']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] }
    });

    doc.save(`collector-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Collector report downloaded successfully!');
  };

  const handleCollectorCSVExport = () => {
    const headers = ['ID', 'Name', 'Phone', 'Zone', 'Status', 'Completed Today', 'Pending', 'Completed This Month', 'Completion Rate %', 'Performance Score'];
    const rows = filteredCollectors.map(collector => [
      collector.id,
      collector.name,
      collector.phone,
      collector.zone,
      collector.status,
      collector.completedToday,
      collector.pendingPickups,
      collector.completedThisMonth,
      collector.completionRate.toFixed(1),
      collector.performanceScore
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `collectors-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Collector data exported to CSV!');
  };

  // Export functions for Collection Management tab
  const handleCollectionPDFExport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Collection Management Report', 14, 22);

    doc.setFontSize(11);
    doc.text(`Period: ${dateRange}`, 14, 32);
    doc.text(`Zone: ${selectedZone === 'all' ? 'All Zones' : selectedZone}`, 14, 38);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 44);

    const tableData = filteredRequests.map(request => [
      request.id,
      request.residentName,
      request.zone,
      request.wasteType,
      request.estimatedWeight,
      request.status,
      request.assignedCollector || 'Unassigned'
    ]);

    autoTable(doc, {
      startY: 52,
      head: [['Request ID', 'Resident', 'Zone', 'Type', 'Weight (kg)', 'Status', 'Collector']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] }
    });

    doc.save(`collection-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Collection report downloaded successfully!');
  };

  const handleCollectionCSVExport = () => {
    const headers = ['Request ID', 'Resident', 'Phone', 'Zone', 'Waste Type', 'Estimated Weight', 'Status', 'Submitted At', 'Assigned Collector', 'Completed At', 'Actual Weight'];
    const rows = filteredRequests.map(request => [
      request.id,
      request.residentName,
      request.phone,
      request.zone,
      request.wasteType,
      request.estimatedWeight,
      request.status,
      request.submittedAt,
      request.assignedCollector || 'Unassigned',
      request.completedAt || 'N/A',
      request.actualWeight || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `collections-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Collection data exported to CSV!');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Control Bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search collections, collectors, zones..."
                className="pl-10 bg-gray-50"
              />
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-48">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="gasabo">Gasabo</SelectItem>
                <SelectItem value="kicukiro">Kicukiro</SelectItem>
                <SelectItem value="nyarugenge">Nyarugenge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {selectedTab === 'dashboard' && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleDashboardPDFExport}>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b px-6">
          <TabsList className="h-12">
            <TabsTrigger value="dashboard" className="gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="collectors" className="gap-2">
              <Truck className="h-4 w-4" />
              Collector Management
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2">
              <Package className="h-4 w-4" />
              Collection Management
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="flex-1 m-0 overflow-hidden">
          <div className="h-full grid grid-cols-12 gap-4 p-4 overflow-hidden">
        
        {/* LEFT PANEL - Live Activity Feed */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto">
          
          {/* Real-time Pickup Status */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  Live Activity Feed
                </CardTitle>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <Circle className="h-2 w-2 fill-green-600 mr-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {liveActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-2 p-2 border rounded hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'in-progress' ? 'bg-blue-500' :
                    activity.status === 'missed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-xs truncate">{activity.type}</p>
                      <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{activity.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs py-0 h-5">{activity.bin}</Badge>
                      <span className="text-xs text-gray-500">{activity.collector}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Collector Activity Log */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                Collector Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {collectorStatus.map((collector) => (
                <div key={collector.id} className="border rounded p-2 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getCollectorStatusColor(collector.status)}`} />
                      <span className="font-medium text-sm">{collector.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{collector.route}</Badge>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">{collector.location}</div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-600 font-medium">{collector.pickups} done</span>
                    <span className="text-gray-500">{collector.pending} pending</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* CENTER PANEL - Operational Metrics */}
        <div className="col-span-6 flex flex-col gap-4 overflow-y-auto">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-4 gap-3 flex-shrink-0">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Today</span>
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div className="font-bold text-xl">187</div>
                <div className="text-xs text-gray-600 mt-0.5">Pickups</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Collected</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="font-bold text-xl">4.2t</div>
                <div className="text-xs text-gray-600 mt-0.5">Today</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Missed</span>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="font-bold text-xl text-red-600">12</div>
                <div className="text-xs text-gray-600 mt-0.5">Critical</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Active</span>
                  <Truck className="h-4 w-4 text-purple-600" />
                </div>
                <div className="font-bold text-xl">52</div>
                <div className="text-xs text-gray-600 mt-0.5">Collectors</div>
              </CardContent>
            </Card>
          </div>

          {/* Waste Collection Pipeline */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Monthly Collection Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-xs text-gray-600 mb-1">Organic</div>
                  <div className="font-bold text-lg text-blue-600">10.4t</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">Recyclables</div>
                  <div className="font-bold text-lg text-green-600">6.8t</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
                  <div className="text-xs text-gray-600 mb-1">Plastic</div>
                  <div className="font-bold text-lg text-orange-600">5.2t</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">General</div>
                  <div className="font-bold text-lg text-gray-600">2.4t</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-1">Monthly Target: 30 tons</div>
              <Progress value={82} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>24.8 tons collected</span>
                <span>82%</span>
              </div>
            </CardContent>
          </Card>

          {/* Processing Pipelines */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  Compost Production
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Awaiting Processing</span>
                  <span className="font-bold">3.2t</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">In Process</span>
                  <span className="font-bold text-blue-600">5.8t</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Finished Inventory</span>
                  <span className="font-bold text-green-600">8.2t</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-600 mb-1">Pipeline Efficiency</div>
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Construction className="h-4 w-4 text-gray-600" />
                  Paver Production
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Plastic Stock</span>
                  <span className="font-bold">1.8t</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">In Production</span>
                  <span className="font-bold text-blue-600">420 units</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ready for Sale</span>
                  <span className="font-bold text-green-600">1,450 units</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-600 mb-1">Production Rate</div>
                  <Progress value={72} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zone Performance Heatmap */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  Zone Performance Heatmap
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  View Map
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-gray-600">Zone</th>
                      <th className="text-center px-2 font-medium text-gray-600">Today</th>
                      <th className="text-center px-2 font-medium text-gray-600">Week Avg</th>
                      <th className="text-center px-2 font-medium text-gray-600">Collectors</th>
                      <th className="text-center px-2 font-medium text-gray-600">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zonePerformance.map((zone, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2 pr-4 font-medium">{zone.zone}</td>
                        <td className="text-center px-2">
                          <div className="flex items-center justify-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getPerformanceColor(zone.today)}`} />
                            <span className="font-medium">{zone.today}%</span>
                          </div>
                        </td>
                        <td className="text-center px-2 text-gray-600">{zone.week}%</td>
                        <td className="text-center px-2 text-gray-600">{zone.collectors}</td>
                        <td className="text-center px-2">
                          <Badge variant="outline" className="text-xs py-0 h-5">
                            {zone.pending}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL - Action Center */}
        <div className="col-span-3 flex flex-col gap-4 overflow-y-auto">
          
          {/* Quick Actions */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" className="w-full justify-start bg-green-600 hover:bg-green-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Collector
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reassign Route
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Send Announcement
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={handleDashboardPDFExport}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Pending Approvals & Actions */}
          <Card className="flex-1 flex-shrink-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  Pending Actions
                </CardTitle>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                  {pendingActions.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingActions.map((action) => (
                <div 
                  key={action.id} 
                  className={`border rounded p-3 space-y-2 ${getPriorityColor(action.priority)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-medium text-sm leading-tight">{action.title}</h5>
                    <Badge className={`text-xs capitalize ${getPriorityColor(action.priority)}`}>
                      {action.priority}
                    </Badge>
                  </div>
                  {action.location && (
                    <p className="text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {action.location}
                    </p>
                  )}
                  {action.bin && (
                    <p className="text-xs">Bin: {action.bin}</p>
                  )}
                  {action.quantity && (
                    <p className="text-xs">Quantity: {action.quantity}</p>
                  )}
                  {action.zone && (
                    <p className="text-xs">Zone: {action.zone}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    {action.type === 'approve' && (
                      <Button size="sm" className="h-7 text-xs flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    )}
                    {action.type === 'reassign' && (
                      <Button size="sm" className="h-7 text-xs flex-1 bg-blue-600 hover:bg-blue-700">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reassign
                      </Button>
                    )}
                    {action.type === 'assign' && (
                      <Button size="sm" className="h-7 text-xs flex-1 bg-purple-600 hover:bg-purple-700">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                    )}
                    {action.type === 'review' && (
                      <Button size="sm" className="h-7 text-xs flex-1 bg-orange-600 hover:bg-orange-700">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Stats */}
          <Card className="flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                System Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Residents</span>
                <span className="font-bold">3,245</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Routes</span>
                <span className="font-bold text-green-600">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Processing Centers</span>
                <span className="font-bold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Points Issued (MTD)</span>
                <span className="font-bold text-purple-600">285,450</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-gray-600">System Uptime</span>
                <span className="font-bold text-green-600">99.8%</span>
              </div>
            </CardContent>
          </Card>
        </div>
          </div>
        </TabsContent>

        {/* Collector Management Tab */}
        <TabsContent value="collectors" className="flex-1 m-0 p-6 overflow-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">Collector Management</h3>
                <p className="text-gray-600 text-sm mt-1">Manage collectors and view performance metrics</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCollectorCSVExport}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleCollectorPDFExport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Collectors ({filteredCollectors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Zone</th>
                        <th className="text-center py-3 px-4 font-medium text-sm">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Today</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Pending</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">MTD</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Rate %</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Score</th>
                        <th className="text-center py-3 px-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCollectors.map((collector) => (
                        <tr key={collector.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium">{collector.id}</td>
                          <td className="py-3 px-4 text-sm">{collector.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{collector.phone}</td>
                          <td className="py-3 px-4 text-sm">{collector.zone}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={collector.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {collector.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-right">{collector.completedToday}</td>
                          <td className="py-3 px-4 text-sm text-right">{collector.pendingPickups}</td>
                          <td className="py-3 px-4 text-sm text-right font-medium">{collector.completedThisMonth}</td>
                          <td className="py-3 px-4 text-sm text-right">
                            <Badge className="bg-green-100 text-green-800">
                              {collector.completionRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-medium text-green-600">{collector.performanceScore}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Collectors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-blue-600">{filteredCollectors.length}</div>
                  <p className="text-xs text-gray-600 mt-1">Active workforce</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-green-600">
                    {(filteredCollectors.reduce((sum, c) => sum + c.completionRate, 0) / filteredCollectors.length).toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Above target</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Completed Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-purple-600">
                    {filteredCollectors.reduce((sum, c) => sum + c.completedToday, 0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Pickups completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-green-600">
                    {(filteredCollectors.reduce((sum, c) => sum + c.performanceScore, 0) / filteredCollectors.length).toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Performance score</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Collection Management Tab */}
        <TabsContent value="collections" className="flex-1 m-0 p-6 overflow-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">Collection Management</h3>
                <p className="text-gray-600 text-sm mt-1">Manage collection requests and assignments</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCollectionCSVExport}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleCollectionPDFExport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Collection Requests ({filteredRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm">Request ID</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Resident</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Zone</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Type</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Weight (kg)</th>
                        <th className="text-center py-3 px-4 font-medium text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Collector</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Submitted</th>
                        <th className="text-center py-3 px-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium">{request.id}</td>
                          <td className="py-3 px-4 text-sm">{request.residentName}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{request.phone}</td>
                          <td className="py-3 px-4 text-sm">{request.zone}</td>
                          <td className="py-3 px-4 text-sm">
                            <Badge variant="outline">{request.wasteType}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-right">{request.estimatedWeight}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                              request.status === 'missed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {request.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {request.assignedCollector || (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{request.submittedAt}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status === 'pending' && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Collection Summary */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-blue-600">{filteredRequests.length}</div>
                  <p className="text-xs text-gray-600 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-yellow-600">
                    {filteredRequests.filter(r => r.status === 'pending').length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Awaiting assignment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-blue-600">
                    {filteredRequests.filter(r => r.status === 'in-progress' || r.status === 'assigned').length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-green-600">
                    {filteredRequests.filter(r => r.status === 'completed').length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Successfully done</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Missed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl text-red-600">
                    {filteredRequests.filter(r => r.status === 'missed').length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Require action</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
