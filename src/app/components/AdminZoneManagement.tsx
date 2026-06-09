import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { 
  ChevronRight, ChevronDown, MapPin, Users, Trash2, Edit2, Plus,
  AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, UserCheck,
  Package, Calendar, Search, Save, X, MoreVertical, Loader2
} from 'lucide-react';
import { Checkbox } from '@/app/components/ui/checkbox';

// Mock data for zone hierarchy
interface ZoneNode {
  id: string;
  name: string;
  level: 'district' | 'sector' | 'cell' | 'village';
  parentId: string | null;
  isActive: boolean;
  children?: ZoneNode[];
  // Configuration
  collectionFrequency: string;
  allowedWasteTypes: string[];
  priorityLevel: 'high' | 'medium' | 'low';
  // Stats
  registeredResidents: number;
  activeCollectors: number;
  pendingPickups: number;
  monthlyWasteCollected: number;
}

const mockZoneHierarchy: ZoneNode[] = [
  {
    id: 'D1',
    name: 'Gasabo',
    level: 'district',
    parentId: null,
    isActive: true,
    collectionFrequency: '3x per week',
    allowedWasteTypes: ['organic', 'plastic', 'general'],
    priorityLevel: 'high',
    registeredResidents: 12840,
    activeCollectors: 18,
    pendingPickups: 24,
    monthlyWasteCollected: 4200,
    children: [
      {
        id: 'S1',
        name: 'Remera',
        level: 'sector',
        parentId: 'D1',
        isActive: true,
        collectionFrequency: '3x per week',
        allowedWasteTypes: ['organic', 'plastic', 'general'],
        priorityLevel: 'high',
        registeredResidents: 4200,
        activeCollectors: 6,
        pendingPickups: 8,
        monthlyWasteCollected: 1400,
        children: [
          {
            id: 'C1',
            name: 'Rukiri I',
            level: 'cell',
            parentId: 'S1',
            isActive: true,
            collectionFrequency: '3x per week',
            allowedWasteTypes: ['organic', 'plastic', 'general'],
            priorityLevel: 'high',
            registeredResidents: 1200,
            activeCollectors: 2,
            pendingPickups: 3,
            monthlyWasteCollected: 420,
            children: [
              {
                id: 'V1',
                name: 'Akagera',
                level: 'village',
                parentId: 'C1',
                isActive: true,
                collectionFrequency: '3x per week',
                allowedWasteTypes: ['organic', 'plastic', 'general'],
                priorityLevel: 'high',
                registeredResidents: 350,
                activeCollectors: 1,
                pendingPickups: 1,
                monthlyWasteCollected: 140
              },
              {
                id: 'V2',
                name: 'Ubumwe',
                level: 'village',
                parentId: 'C1',
                isActive: true,
                collectionFrequency: '3x per week',
                allowedWasteTypes: ['organic', 'plastic', 'general'],
                priorityLevel: 'medium',
                registeredResidents: 420,
                activeCollectors: 1,
                pendingPickups: 2,
                monthlyWasteCollected: 165
              }
            ]
          },
          {
            id: 'C2',
            name: 'Rukiri II',
            level: 'cell',
            parentId: 'S1',
            isActive: true,
            collectionFrequency: '2x per week',
            allowedWasteTypes: ['organic', 'plastic'],
            priorityLevel: 'medium',
            registeredResidents: 980,
            activeCollectors: 1,
            pendingPickups: 2,
            monthlyWasteCollected: 320
          }
        ]
      },
      {
        id: 'S2',
        name: 'Kacyiru',
        level: 'sector',
        parentId: 'D1',
        isActive: true,
        collectionFrequency: '3x per week',
        allowedWasteTypes: ['organic', 'plastic', 'general'],
        priorityLevel: 'high',
        registeredResidents: 3800,
        activeCollectors: 5,
        pendingPickups: 6,
        monthlyWasteCollected: 1250,
        children: []
      }
    ]
  },
  {
    id: 'D2',
    name: 'Kicukiro',
    level: 'district',
    parentId: null,
    isActive: true,
    collectionFrequency: '2x per week',
    allowedWasteTypes: ['organic', 'plastic', 'general'],
    priorityLevel: 'medium',
    registeredResidents: 9600,
    activeCollectors: 12,
    pendingPickups: 18,
    monthlyWasteCollected: 3200,
    children: [
      {
        id: 'S3',
        name: 'Gatenga',
        level: 'sector',
        parentId: 'D2',
        isActive: true,
        collectionFrequency: '2x per week',
        allowedWasteTypes: ['organic', 'plastic'],
        priorityLevel: 'medium',
        registeredResidents: 2800,
        activeCollectors: 4,
        pendingPickups: 5,
        monthlyWasteCollected: 950
      }
    ]
  },
  {
    id: 'D3',
    name: 'Nyarugenge',
    level: 'district',
    parentId: null,
    isActive: true,
    collectionFrequency: '3x per week',
    allowedWasteTypes: ['organic', 'plastic', 'general'],
    priorityLevel: 'high',
    registeredResidents: 11200,
    activeCollectors: 16,
    pendingPickups: 22,
    monthlyWasteCollected: 3800,
    children: []
  }
];

// Mock data for collectors
const mockCollectors = [
  { id: 'COL1', name: 'Jean Baptiste', status: 'active', workload: 85, performance: 94, zone: 'V1' },
  { id: 'COL2', name: 'Marie Uwase', status: 'active', workload: 72, performance: 89, zone: 'C1' },
  { id: 'COL3', name: 'Emmanuel Habimana', status: 'active', workload: 68, performance: 92, zone: 'S1' },
  { id: 'COL4', name: 'David Mukasa', status: 'offline', workload: 0, performance: 87, zone: null },
  { id: 'COL5', name: 'Grace Murekatete', status: 'active', workload: 90, performance: 96, zone: 'S2' },
  { id: 'COL6', name: 'Patrick Nkusi', status: 'active', workload: 55, performance: 88, zone: 'S3' },
];

const availableCollectors = [
  { id: 'COL7', name: 'Claude Niyonzima', workload: 0, performance: 91 },
  { id: 'COL8', name: 'Aline Mutoni', workload: 0, performance: 89 },
  { id: 'COL9', name: 'Eric Nkunda', workload: 0, performance: 85 },
];

export function AdminZoneManagement() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['D1', 'S1', 'C1']));
  const [selectedZone, setSelectedZone] = useState<ZoneNode | null>(mockZoneHierarchy[0].children![0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignCollectorOpen, setAssignCollectorOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'district':
        return 'bg-purple-100 text-purple-700';
      case 'sector':
        return 'bg-blue-100 text-blue-700';
      case 'cell':
        return 'bg-green-100 text-green-700';
      case 'village':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTreeNode = (node: ZoneNode, depth: number = 0): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedZone?.id === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
            isSelected ? 'bg-green-100 border-l-4 border-green-600' : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => setSelectedZone(node)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleNode(node.id);
            }}
            className="p-0 h-4 w-4"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-sm flex-1">{node.name}</span>
          <Badge className={`${getLevelColor(node.level)} text-xs px-2 py-0`}>
            {node.level}
          </Badge>
          {!node.isActive && (
            <Badge variant="outline" className="text-xs">Inactive</Badge>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getAssignedCollectors = () => {
    if (!selectedZone) return [];
    return mockCollectors.filter(c => c.zone === selectedZone.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl">Zone & Route Management</h2>
        <p className="text-gray-600 text-sm mt-1">Configure service areas, assign collectors, and monitor zone performance</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)]">
        {/* LEFT PANEL - Zone Hierarchy Tree */}
        <div className="col-span-3 bg-white rounded-lg border overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Zone Hierarchy</h3>
              <Button size="sm" variant="outline" className="h-8">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {mockZoneHierarchy.map((node) => renderTreeNode(node))}
            </div>
          </div>

          <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
            <div className="flex items-center justify-between mb-1">
              <span>Total Zones</span>
              <span className="font-semibold">18</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Active</span>
              <span className="font-semibold text-green-600">17</span>
            </div>
          </div>
        </div>

        {/* CENTER PANEL - Zone Details & Configuration */}
        <div className="col-span-5 bg-white rounded-lg border overflow-hidden flex flex-col">
          {selectedZone ? (
            <>
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-xl">{selectedZone.name}</h3>
                      <Badge className={getLevelColor(selectedZone.level)}>
                        {selectedZone.level}
                      </Badge>
                      <Badge className={getPriorityColor(selectedZone.priorityLevel)}>
                        {selectedZone.priorityLevel} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">ID: {selectedZone.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={isEditing ? 'default' : 'outline'}
                      onClick={() => setIsEditing(!isEditing)}
                      className={isEditing ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                    {isEditing && (
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="zone-status"
                    checked={selectedZone.isActive}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="zone-status" className="text-sm cursor-pointer">
                    {selectedZone.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase text-gray-600">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Zone Name</Label>
                      {isEditing ? (
                        <Input value={selectedZone.name} className="mt-1" />
                      ) : (
                        <p className="font-medium mt-1">{selectedZone.name}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Parent Zone</Label>
                      <p className="font-medium mt-1">
                        {selectedZone.parentId ? 
                          mockZoneHierarchy.find(d => d.id === selectedZone.parentId)?.name || 'N/A' 
                          : 'Root Level'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Configuration */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase text-gray-600">Service Configuration</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">Collection Frequency</Label>
                      {isEditing ? (
                        <Select defaultValue="3x">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1x">1x per week</SelectItem>
                            <SelectItem value="2x">2x per week</SelectItem>
                            <SelectItem value="3x">3x per week</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium">{selectedZone.collectionFrequency}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">Allowed Waste Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Checkbox id="organic" defaultChecked={selectedZone.allowedWasteTypes.includes('organic')} />
                              <label htmlFor="organic" className="text-sm">Organic</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="plastic" defaultChecked={selectedZone.allowedWasteTypes.includes('plastic')} />
                              <label htmlFor="plastic" className="text-sm">Plastic</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox id="general" defaultChecked={selectedZone.allowedWasteTypes.includes('general')} />
                              <label htmlFor="general" className="text-sm">General</label>
                            </div>
                          </>
                        ) : (
                          selectedZone.allowedWasteTypes.map((type) => (
                            <Badge key={type} variant="outline" className="capitalize">
                              {type}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">Priority Level</Label>
                      {isEditing ? (
                        <Select defaultValue={selectedZone.priorityLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getPriorityColor(selectedZone.priorityLevel)}>
                          {selectedZone.priorityLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Coverage Summary */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase text-gray-600">Coverage Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-gray-600">Registered Residents</span>
                      </div>
                      <p className="font-bold text-2xl text-blue-700">{selectedZone.registeredResidents.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-gray-600">Active Collectors</span>
                      </div>
                      <p className="font-bold text-2xl text-green-700">{selectedZone.activeCollectors}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-yellow-600" />
                        <span className="text-xs text-gray-600">Pending Pickups</span>
                      </div>
                      <p className="font-bold text-2xl text-yellow-700">{selectedZone.pendingPickups}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-purple-600" />
                        <span className="text-xs text-gray-600">Monthly Waste (kg)</span>
                      </div>
                      <p className="font-bold text-2xl text-purple-700">{selectedZone.monthlyWasteCollected.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Operational Warnings */}
                {(selectedZone.activeCollectors === 0 || selectedZone.pendingPickups > 10) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-red-800 mb-1">Operational Alerts</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          {selectedZone.activeCollectors === 0 && (
                            <li>⚠️ No collectors assigned to this zone</li>
                          )}
                          {selectedZone.pendingPickups > 10 && (
                            <li>⚠️ High number of pending pickups ({selectedZone.pendingPickups})</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Select a zone to view details</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - Collector Assignment & Performance */}
        <div className="col-span-4 space-y-4 overflow-y-auto">
          {selectedZone ? (
            <>
              {/* Assigned Collectors */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Assigned Collectors</CardTitle>
                    <Dialog open={assignCollectorOpen} onOpenChange={setAssignCollectorOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Plus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Collector to {selectedZone.name}</DialogTitle>
                          <DialogDescription>
                            Select an available collector to assign to this zone
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label className="mb-2 block">Available Collectors</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a collector" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableCollectors.map((collector) => (
                                  <SelectItem key={collector.id} value={collector.id}>
                                    {collector.name} - {collector.performance}% performance
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                            💡 Consider workload balance when assigning collectors
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700">
                              Confirm Assignment
                            </Button>
                            <Button variant="outline" onClick={() => setAssignCollectorOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {getAssignedCollectors().length > 0 ? (
                    <div className="space-y-3">
                      {getAssignedCollectors().map((collector) => (
                        <div key={collector.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium">{collector.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  className={collector.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'}
                                >
                                  {collector.status}
                                </Badge>
                                <span className="text-xs text-gray-600">ID: {collector.id}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">Workload</span>
                                <span className="font-semibold">{collector.workload}%</span>
                              </div>
                              <Progress value={collector.workload} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">Performance</span>
                                <span className="font-semibold text-green-600">{collector.performance}%</span>
                              </div>
                              <Progress value={collector.performance} className="h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">No collectors assigned</p>
                      <p className="text-xs text-gray-400 mt-1">Click "Assign" to add collectors</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Zone Performance Snapshot */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Zone Performance (This Week)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="font-bold text-2xl text-blue-700">42</div>
                      <div className="text-xs text-gray-600 mt-1">Total Requests</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="font-bold text-2xl text-green-700">38</div>
                      <div className="text-xs text-gray-600 mt-1">Completed</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <div className="font-bold text-2xl text-red-700">4</div>
                      <div className="text-xs text-gray-600 mt-1">Missed</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="font-bold text-2xl text-purple-700">90%</div>
                      <div className="text-xs text-gray-600 mt-1">Efficiency</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Completion Rate</Label>
                    <Progress value={90} className="h-3" />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">38 of 42 requests</span>
                      <span className="text-xs font-semibold text-green-600">90%</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Trend vs Last Week</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-semibold">+5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Collection Schedule
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Review Pending Pickups
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Residents
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a zone to view collector assignments</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
