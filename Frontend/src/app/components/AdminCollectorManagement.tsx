import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Switch } from '@/app/components/ui/switch';
import { 
  Search, Filter, Download, Plus, User, Phone, MapPin, TrendingUp,
  CheckCircle2, AlertTriangle, Clock, Calendar, Shield, Bell,
  RotateCcw, Key, Send, FileText, Edit, Eye, Circle, X,
  UserMinus, Activity
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';

// Mock data for collectors
const mockCollectors = [
  {
    id: 'COL-001',
    name: 'Jean Baptiste Uwimana',
    phone: '+250 788 123 456',
    nationalId: '1199012345678901',
    zone: 'Gasabo - Remera',
    status: 'active',
    dateJoined: '2024-01-15',
    assignmentsToday: 8,
    completedToday: 6,
    pendingPickups: 2,
    completedThisMonth: 124,
    missedThisMonth: 3,
    performanceScore: 97,
    availability: 'on-route',
    completionRate: 97.6,
    avgResponseTime: '18 min',
    avgPickupDuration: '12 min',
    missedRatio: 2.4,
    residentRating: 4.8
  },
  {
    id: 'COL-002',
    name: 'Marie Uwase Kamanzi',
    phone: '+250 788 234 567',
    nationalId: '1198511234567890',
    zone: 'Kicukiro - Gatenga',
    status: 'active',
    dateJoined: '2024-02-10',
    assignmentsToday: 12,
    completedToday: 10,
    pendingPickups: 2,
    completedThisMonth: 156,
    missedThisMonth: 8,
    performanceScore: 95,
    availability: 'on-route',
    completionRate: 95.1,
    avgResponseTime: '22 min',
    avgPickupDuration: '15 min',
    missedRatio: 4.9,
    residentRating: 4.6
  },
  {
    id: 'COL-003',
    name: 'Patrick Nkusi Mugabo',
    phone: '+250 788 345 678',
    nationalId: '1197612345678902',
    zone: 'Nyarugenge - Nyarugenge',
    status: 'active',
    dateJoined: '2023-11-05',
    assignmentsToday: 5,
    completedToday: 5,
    pendingPickups: 0,
    completedThisMonth: 98,
    missedThisMonth: 2,
    performanceScore: 98,
    availability: 'available',
    completionRate: 98.0,
    avgResponseTime: '15 min',
    avgPickupDuration: '10 min',
    missedRatio: 2.0,
    residentRating: 4.9
  },
  {
    id: 'COL-004',
    name: 'Emmanuel Habimana',
    phone: '+250 788 456 789',
    nationalId: '1199212345678903',
    zone: 'Gasabo - Kacyiru',
    status: 'active',
    dateJoined: '2024-03-01',
    assignmentsToday: 6,
    completedToday: 5,
    pendingPickups: 1,
    completedThisMonth: 82,
    missedThisMonth: 1,
    performanceScore: 99,
    availability: 'on-route',
    completionRate: 98.8,
    avgResponseTime: '16 min',
    avgPickupDuration: '11 min',
    missedRatio: 1.2,
    residentRating: 4.9
  },
  {
    id: 'COL-005',
    name: 'Grace Murekatete',
    phone: '+250 788 567 890',
    nationalId: '1198812345678904',
    zone: 'Kicukiro - Niboye',
    status: 'suspended',
    dateJoined: '2024-01-20',
    assignmentsToday: 0,
    completedToday: 0,
    pendingPickups: 0,
    completedThisMonth: 45,
    missedThisMonth: 18,
    performanceScore: 71,
    availability: 'offline',
    completionRate: 71.4,
    avgResponseTime: '35 min',
    avgPickupDuration: '20 min',
    missedRatio: 28.6,
    residentRating: 3.8
  },
  {
    id: 'COL-006',
    name: 'David Mukasa',
    phone: '+250 788 678 901',
    nationalId: '1197512345678905',
    zone: 'Nyarugenge - Muhima',
    status: 'inactive',
    dateJoined: '2023-10-15',
    assignmentsToday: 0,
    completedToday: 0,
    pendingPickups: 0,
    completedThisMonth: 0,
    missedThisMonth: 0,
    performanceScore: 0,
    availability: 'offline',
    completionRate: 0,
    avgResponseTime: 'N/A',
    avgPickupDuration: 'N/A',
    missedRatio: 0,
    residentRating: 4.2
  }
];

// Mock activity log data
const mockActivityLog = [
  { id: 1, time: '10:45 AM', date: '2026-03-03', type: 'completed', description: 'Completed pickup REQ-2024-145' },
  { id: 2, time: '10:20 AM', date: '2026-03-03', type: 'assigned', description: 'Assigned to pickup REQ-2024-148' },
  { id: 3, time: '09:55 AM', date: '2026-03-03', type: 'completed', description: 'Completed pickup REQ-2024-142' },
  { id: 4, time: '09:30 AM', date: '2026-03-03', type: 'login', description: 'Logged into mobile app' },
  { id: 5, time: '08:45 AM', date: '2026-03-03', type: 'assigned', description: 'Assigned to pickup REQ-2024-138' },
  { id: 6, time: '05:20 PM', date: '2026-03-02', type: 'missed', description: 'Missed pickup REQ-2024-132 - Could not locate' },
  { id: 7, time: '04:15 PM', date: '2026-03-02', type: 'report', description: 'Submitted daily report' },
];

export function AdminCollectorManagement() {
  const [selectedCollector, setSelectedCollector] = useState<typeof mockCollectors[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'on-route':
        return 'bg-blue-100 text-blue-800';
      case 'offline':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-blue-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const hasWarning = (collector: typeof mockCollectors[0]) => {
    return collector.missedThisMonth > 5 || collector.completionRate < 80 || collector.assignmentsToday > 10;
  };

  const filteredCollectors = mockCollectors.filter(collector => {
    const matchesSearch = searchQuery === '' || 
      collector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collector.phone.includes(searchQuery) ||
      collector.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || collector.status === statusFilter;
    const matchesZone = zoneFilter === 'all' || collector.zone.includes(zoneFilter);
    const matchesAvailability = availabilityFilter === 'all' || collector.availability === availabilityFilter;
    
    return matchesSearch && matchesStatus && matchesZone && matchesAvailability;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'missed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'assigned':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'report':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'login':
        return <Activity className="h-4 w-4 text-gray-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Control Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-2xl">Collector Management</h2>
            <p className="text-gray-600 text-sm">Manage workforce and monitor collector performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export List
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Collector
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Collector</DialogTitle>
                  <DialogDescription>Register a new waste collector in the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input placeholder="Enter full name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input placeholder="+250 788 XXX XXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>National ID *</Label>
                    <Input placeholder="1XXXXXXXXXXXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Zone *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasabo-remera">Gasabo - Remera</SelectItem>
                        <SelectItem value="gasabo-kacyiru">Gasabo - Kacyiru</SelectItem>
                        <SelectItem value="kicukiro-gatenga">Kicukiro - Gatenga</SelectItem>
                        <SelectItem value="kicukiro-niboye">Kicukiro - Niboye</SelectItem>
                        <SelectItem value="nyarugenge-nyarugenge">Nyarugenge - Nyarugenge</SelectItem>
                        <SelectItem value="nyarugenge-muhima">Nyarugenge - Muhima</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Add Collector
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by Name, Phone, or ID..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              <SelectItem value="Gasabo">Gasabo</SelectItem>
              <SelectItem value="Kicukiro">Kicukiro</SelectItem>
              <SelectItem value="Nyarugenge">Nyarugenge</SelectItem>
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="on-route">On Route</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content - Table + Detail Panel */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        
        {/* Collectors Table */}
        <div className={`${selectedCollector ? 'flex-1' : 'flex-1'} flex flex-col bg-white rounded-lg border overflow-hidden transition-all`}>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Collector ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Full Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Zone</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Assignments</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Completed</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Missed</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Performance</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Availability</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCollectors.map((collector) => (
                  <tr 
                    key={collector.id}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      selectedCollector?.id === collector.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">{collector.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {collector.name}
                        {hasWarning(collector) && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{collector.phone}</td>
                    <td className="py-3 px-4 text-gray-600">{collector.zone}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusColor(collector.status)}>
                        {collector.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{collector.assignmentsToday}</td>
                    <td className="py-3 px-4 text-center text-green-600 font-medium">
                      {collector.completedThisMonth}
                    </td>
                    <td className="py-3 px-4 text-center text-red-600 font-medium">
                      {collector.missedThisMonth}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${getPerformanceColor(collector.performanceScore)}`}>
                        {collector.performanceScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getAvailabilityColor(collector.availability)}>
                        {collector.availability}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedCollector(collector)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Collector Detail Panel (Slide-in) */}
        {selectedCollector && (
          <div className="w-96 bg-white rounded-lg border overflow-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-bold text-lg">Collector Details</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setSelectedCollector(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium">{selectedCollector.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedCollector.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">National ID:</span>
                    <span className="font-medium">{selectedCollector.nationalId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Joined:</span>
                    <span className="font-medium">{selectedCollector.dateJoined}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zone:</span>
                    <span className="font-medium">{selectedCollector.zone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-gray-600">Account Status:</span>
                    <Switch checked={selectedCollector.status === 'active'} />
                  </div>
                </div>
              </div>

              {/* Assignment Overview */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Today's Assignments
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-50 p-3 rounded text-center">
                    <div className="font-bold text-2xl text-blue-600">{selectedCollector.assignmentsToday}</div>
                    <div className="text-xs text-gray-600">Assigned</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-center">
                    <div className="font-bold text-2xl text-green-600">{selectedCollector.completedToday}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded text-center">
                    <div className="font-bold text-2xl text-yellow-600">{selectedCollector.pendingPickups}</div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded text-center">
                    <div className="font-bold text-2xl text-red-600">{selectedCollector.missedThisMonth}</div>
                    <div className="text-xs text-gray-600">Missed (MTD)</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-medium">{selectedCollector.completionRate}%</span>
                  </div>
                  <Progress value={selectedCollector.completionRate} className="h-2" />
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Metrics
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className={`font-bold ${getPerformanceColor(selectedCollector.completionRate)}`}>
                      {selectedCollector.completionRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response Time:</span>
                    <span className="font-medium">{selectedCollector.avgResponseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Pickup Duration:</span>
                    <span className="font-medium">{selectedCollector.avgPickupDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Missed Pickup Ratio:</span>
                    <span className="font-medium text-red-600">{selectedCollector.missedRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resident Rating:</span>
                    <span className="font-medium">⭐ {selectedCollector.residentRating}/5.0</span>
                  </div>
                </div>

                {/* Warning if poor performance */}
                {selectedCollector.completionRate < 80 && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="text-xs text-red-800">
                        <strong>Performance Alert:</strong> Completion rate below 80% threshold
                      </div>
                    </div>
                  </div>
                )}

                {selectedCollector.assignmentsToday > 10 && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-xs text-yellow-800">
                        <strong>Workload Alert:</strong> Collector is overloaded with {selectedCollector.assignmentsToday} assignments today
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Zone Assignment Management */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Zone Assignment
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Current Zone</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded font-medium text-sm">
                      {selectedCollector.zone}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Change Zone</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select new zone..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasabo-remera">Gasabo - Remera</SelectItem>
                        <SelectItem value="gasabo-kacyiru">Gasabo - Kacyiru</SelectItem>
                        <SelectItem value="kicukiro-gatenga">Kicukiro - Gatenga</SelectItem>
                        <SelectItem value="kicukiro-niboye">Kicukiro - Niboye</SelectItem>
                        <SelectItem value="nyarugenge-nyarugenge">Nyarugenge - Nyarugenge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Additional Zone
                  </Button>
                </div>
              </div>

              {/* Activity Log */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Activity
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {mockActivityLog.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.date} at {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Administrative Controls */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Administrative Actions
                </h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    {selectedCollector.status === 'suspended' ? 'Reactivate Collector' : 'Suspend Collector'}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reassign All Pickups
                  </Button>
                  <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Send className="h-4 w-4 mr-2" />
                        Send Notification
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Notification to {selectedCollector.name}</DialogTitle>
                        <DialogDescription>Send a message or alert to this collector</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea 
                            placeholder="Type your message here..."
                            rows={4}
                          />
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Full History
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
