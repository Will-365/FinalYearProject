import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { 
  Search, Filter, Download, Calendar, MapPin, User, Phone, Package, 
  Clock, AlertTriangle, CheckCircle2, TrendingUp, Plus, RotateCcw,
  FileText, Image as ImageIcon, Check, X, UserPlus, Trash2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

// Mock data for collection requests
const mockRequests = [
  {
    id: 'REQ-2024-001',
    residentName: 'Jean Mutabazi',
    phone: '+250 788 123 456',
    district: 'Gasabo',
    sector: 'Remera',
    cell: 'Rukiri I',
    village: 'Kabeza',
    wasteType: 'Organic',
    estimatedWeight: 25,
    preferredDate: '2026-03-02',
    status: 'pending',
    priority: 'normal',
    submittedAt: '2026-03-01 08:30',
    notes: 'Garden waste from pruning. Located behind main house.',
    assignedCollector: null,
    verificationStatus: 'verified'
  },
  {
    id: 'REQ-2024-002',
    residentName: 'Marie Uwase',
    phone: '+250 788 234 567',
    district: 'Kicukiro',
    sector: 'Gatenga',
    cell: 'Nyanza',
    village: 'Akabahizi',
    wasteType: 'Plastic',
    estimatedWeight: 15,
    preferredDate: '2026-03-02',
    status: 'assigned',
    priority: 'normal',
    submittedAt: '2026-03-01 09:15',
    notes: 'Plastic bottles and containers',
    assignedCollector: 'Jean Baptiste',
    verificationStatus: 'verified'
  },
  {
    id: 'REQ-2024-003',
    residentName: 'Patrick Nkusi',
    phone: '+250 788 345 678',
    district: 'Nyarugenge',
    sector: 'Nyarugenge',
    cell: 'Bibare',
    village: 'Ikinombe',
    wasteType: 'Recyclables',
    estimatedWeight: 65,
    preferredDate: '2026-03-01',
    status: 'in-progress',
    priority: 'high',
    submittedAt: '2026-03-01 07:00',
    notes: 'Large quantity - overflow situation. Need urgent collection.',
    assignedCollector: 'Marie Uwase',
    verificationStatus: 'verified'
  },
  {
    id: 'REQ-2024-004',
    residentName: 'Grace Murekatete',
    phone: '+250 788 456 789',
    district: 'Gasabo',
    sector: 'Kacyiru',
    cell: 'Kamatamu',
    village: 'Kibagabaga',
    wasteType: 'General Waste',
    estimatedWeight: 8,
    preferredDate: '2026-03-03',
    status: 'completed',
    priority: 'normal',
    submittedAt: '2026-02-28 14:20',
    notes: null,
    assignedCollector: 'Emmanuel Habimana',
    verificationStatus: 'verified',
    completedAt: '2026-03-01 10:45',
    actualWeight: 9,
    collectorNotes: 'Collection completed successfully'
  },
  {
    id: 'REQ-2024-005',
    residentName: 'Emmanuel Habimana',
    phone: '+250 788 567 890',
    district: 'Kicukiro',
    sector: 'Niboye',
    cell: 'Nyarurama',
    village: 'Gasharu',
    wasteType: 'Organic',
    estimatedWeight: 55,
    preferredDate: '2026-03-01',
    status: 'missed',
    priority: 'high',
    submittedAt: '2026-02-29 16:45',
    notes: 'Preferred morning collection',
    assignedCollector: 'David Mukasa',
    verificationStatus: 'verified',
    missReason: 'Could not locate address'
  },
];

// Available collectors
const availableCollectors = [
  { id: 'c1', name: 'Jean Baptiste', zone: 'Gasabo', workload: 8 },
  { id: 'c2', name: 'Marie Uwase', zone: 'Kicukiro', workload: 12 },
  { id: 'c3', name: 'Patrick Nkusi', zone: 'Nyarugenge', workload: 5 },
  { id: 'c4', name: 'Emmanuel Habimana', zone: 'Gasabo', workload: 6 },
  { id: 'c5', name: 'Grace Murekatete', zone: 'Kicukiro', workload: 9 },
  { id: 'c6', name: 'David Mukasa', zone: 'Nyarugenge', workload: 3 },
];

export function AdminCollectionManagement() {
  const [selectedRequest, setSelectedRequest] = useState<typeof mockRequests[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredRequests = mockRequests.filter(req => {
    const matchesSearch = searchQuery === '' || 
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesDistrict = districtFilter === 'all' || req.district === districtFilter;
    
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const getTodayStats = () => {
    return {
      total: mockRequests.length,
      pending: mockRequests.filter(r => r.status === 'pending').length,
      missed: mockRequests.filter(r => r.status === 'missed').length,
      avgResponseTime: '2.5 hours'
    };
  };

  const stats = getTodayStats();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Control Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-2xl">Collection Management</h2>
            <p className="text-gray-600 text-sm">Manage and assign collection requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Manual Pickup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Manual Pickup Request</DialogTitle>
                  <DialogDescription>Create a collection request on behalf of a resident</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Resident Name</Label>
                    <Input placeholder="Enter resident name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input placeholder="+250 788 XXX XXX" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>District</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasabo">Gasabo</SelectItem>
                          <SelectItem value="kicukiro">Kicukiro</SelectItem>
                          <SelectItem value="nyarugenge">Nyarugenge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Waste Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="organic">Organic</SelectItem>
                          <SelectItem value="plastic">Plastic</SelectItem>
                          <SelectItem value="recyclables">Recyclables</SelectItem>
                          <SelectItem value="general">General Waste</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Create Request
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
              placeholder="Search by Request ID, Name, or Phone..." 
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              <SelectItem value="Gasabo">Gasabo</SelectItem>
              <SelectItem value="Kicukiro">Kicukiro</SelectItem>
              <SelectItem value="Nyarugenge">Nyarugenge</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
        </div>
      </div>

      {/* 2-Panel Layout */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        
        {/* LEFT PANEL - Collection Requests Table */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Request ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Resident</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Waste Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Weight (kg)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Preferred Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Collector</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Priority</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr 
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">{request.id}</td>
                    <td className="py-3 px-4">{request.residentName}</td>
                    <td className="py-3 px-4 text-gray-600">{request.phone}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {request.district} - {request.sector}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{request.wasteType}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{request.estimatedWeight}</td>
                    <td className="py-3 px-4 text-gray-600">{request.preferredDate}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {request.assignedCollector || <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getPriorityColor(request.priority)} variant="outline">
                        {request.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL - Request Detail & Assignment */}
        <div className="w-96 bg-white rounded-lg border overflow-auto">
          {selectedRequest ? (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div>
                  <h3 className="font-bold text-lg">{selectedRequest.id}</h3>
                  <p className="text-sm text-gray-600">Submitted {selectedRequest.submittedAt}</p>
                </div>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </div>

              {/* Resident Information */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Resident Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedRequest.residentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedRequest.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800">{selectedRequest.verificationStatus}</Badge>
                  </div>
                </div>
              </div>

              {/* Full Address */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Full Address
                </h4>
                <div className="text-sm bg-gray-50 p-3 rounded">
                  <p>{selectedRequest.district} → {selectedRequest.sector}</p>
                  <p>{selectedRequest.cell} → {selectedRequest.village}</p>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Request Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Waste Type:</span>
                    <Badge variant="outline">{selectedRequest.wasteType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Weight:</span>
                    <span className="font-medium">{selectedRequest.estimatedWeight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Date:</span>
                    <span className="font-medium">{selectedRequest.preferredDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <Badge className={getPriorityColor(selectedRequest.priority)} variant="outline">
                      {selectedRequest.priority}
                    </Badge>
                  </div>
                </div>
                {selectedRequest.notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                    <p className="font-medium text-blue-900 mb-1">Notes:</p>
                    <p className="text-blue-800">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>

              {/* Assignment Section - Varies by Status */}
              {selectedRequest.status === 'pending' && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Assign Collector</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Select Collector</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose collector..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCollectors
                            .filter(c => c.zone === selectedRequest.district)
                            .map(collector => (
                              <SelectItem key={collector.id} value={collector.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{collector.name}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({collector.workload} pickups today)
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                      <p className="text-green-800">
                        <strong>Suggested:</strong> David Mukasa (3 pickups today)
                      </p>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Collector
                    </Button>
                  </div>
                </div>
              )}

              {selectedRequest.status === 'assigned' && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Assignment Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div>
                        <p className="font-medium">{selectedRequest.assignedCollector}</p>
                        <p className="text-xs text-gray-600">Assigned Collector</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reassign
                      </Button>
                      <Button variant="outline" size="sm">
                        <Clock className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.status === 'missed' && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Missed Collection
                  </h4>
                  <div className="space-y-3">
                    {selectedRequest.missReason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                        <p className="font-medium text-red-900 mb-1">Reason:</p>
                        <p className="text-red-800">{selectedRequest.missReason}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-xs">Reschedule Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reassign
                      </Button>
                      <Button variant="outline">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Escalate
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.status === 'completed' && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Completion Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium">{selectedRequest.completedAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual Weight:</span>
                      <span className="font-medium">{selectedRequest.actualWeight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collector:</span>
                      <span className="font-medium">{selectedRequest.assignedCollector}</span>
                    </div>
                    {selectedRequest.collectorNotes && (
                      <div className="mt-3 p-3 bg-green-50 rounded">
                        <p className="font-medium text-green-900 mb-1">Collector Notes:</p>
                        <p className="text-green-800">{selectedRequest.collectorNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 p-8 text-center">
              <div>
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a request to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operational Insights Panel */}
      <div className="bg-white border-t px-6 py-4">
        <h3 className="font-semibold mb-3 text-sm">Operational Insights - Today</h3>
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-600 mt-1">Total Requests</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <div className="font-bold text-2xl text-gray-600">{stats.pending}</div>
                <div className="text-xs text-gray-600 mt-1">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <div className="font-bold text-2xl text-red-600">{stats.missed}</div>
                <div className="text-xs text-gray-600 mt-1">Missed Pickups</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <div className="font-bold text-2xl text-green-600">{stats.avgResponseTime}</div>
                <div className="text-xs text-gray-600 mt-1">Avg Response</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-center">
                <div className="font-bold text-lg text-purple-600">Gasabo - Remera</div>
                <div className="text-xs text-gray-600 mt-1">Highest Pending</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
