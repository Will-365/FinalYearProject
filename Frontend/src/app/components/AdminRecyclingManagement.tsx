import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import {
  Package, CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  Factory, Leaf, Loader2, Calendar, Download, FileText,
  Eye, ArrowRight, Box, DollarSign, BarChart3, Filter,
  ThumbsUp, ThumbsDown, Image as ImageIcon, MapPin, User,
  Activity, Clock, ChevronRight, Archive, Timer, Zap,
  AlertCircle, TrendingDown, RefreshCw, Thermometer, Droplets, Wind,
  ChevronDown, ChevronUp, Users, UserPlus, Plus, Move
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';

// Mock data for waste intake
const mockWasteIntake = [
  {
    id: 'COL-2024-145',
    wasteType: 'Organic',
    actualWeight: 28,
    zone: 'Gasabo - Remera',
    dateCollected: '2026-03-24',
    collector: 'Jean Baptiste',
    qualityStatus: 'pending',
    proofPhoto: true,
    collectorNotes: 'Garden waste, well sorted',
    residentName: 'Marie Uwase'
  },
  {
    id: 'COL-2024-146',
    wasteType: 'Plastic',
    actualWeight: 18,
    zone: 'Kicukiro - Gatenga',
    dateCollected: '2026-03-24',
    collector: 'Emmanuel Habimana',
    qualityStatus: 'approved',
    proofPhoto: true,
    collectorNotes: 'Clean plastic bottles and containers',
    residentName: 'Patrick Nkusi'
  },
  {
    id: 'COL-2024-147',
    wasteType: 'Organic',
    actualWeight: 45,
    zone: 'Nyarugenge - Nyarugenge',
    dateCollected: '2026-03-23',
    collector: 'Marie Uwase',
    qualityStatus: 'pending',
    proofPhoto: true,
    collectorNotes: 'Market waste - fruits and vegetables',
    residentName: 'Jean Mutabazi'
  },
  {
    id: 'COL-2024-148',
    wasteType: 'Plastic',
    actualWeight: 22,
    zone: 'Gasabo - Kacyiru',
    dateCollected: '2026-03-23',
    collector: 'David Mukasa',
    qualityStatus: 'rejected',
    proofPhoto: true,
    collectorNotes: 'Mixed with non-recyclables - requires re-sorting',
    residentName: 'Grace Murekatete'
  },
  {
    id: 'COL-2024-149',
    wasteType: 'Organic',
    actualWeight: 32,
    zone: 'Gasabo - Remera',
    dateCollected: '2026-03-22',
    collector: 'Jean Baptiste',
    qualityStatus: 'pending',
    proofPhoto: true,
    collectorNotes: 'Household organic waste, good quality',
    residentName: 'Claude Niyonzima'
  },
];

// Mock data for compost batches
const mockCompostBatches = [
  {
    id: 'COMP-2024-012',
    sourceWeight: 450,
    startDate: '2026-02-26',
    currentStage: 'Curing',
    expectedCompletion: '2026-03-26',
    outputWeight: null,
    status: 'in-progress',
    daysInProduction: 26,
    moistureLevel: 65,
    temperature: 58,
    assignedTeam: 'Team B'
  },
  {
    id: 'COMP-2024-013',
    sourceWeight: 380,
    startDate: '2026-03-04',
    currentStage: 'Active Processing',
    expectedCompletion: '2026-04-01',
    outputWeight: null,
    status: 'in-progress',
    daysInProduction: 20,
    moistureLevel: 72,
    temperature: 62,
    assignedTeam: 'Team A'
  },
  {
    id: 'COMP-2024-011',
    sourceWeight: 520,
    startDate: '2026-02-01',
    currentStage: 'Finished',
    expectedCompletion: '2026-03-01',
    outputWeight: 185,
    status: 'completed',
    daysInProduction: 28,
    moistureLevel: 45,
    temperature: 24,
    assignedTeam: null
  },
  {
    id: 'COMP-2024-010',
    sourceWeight: 400,
    startDate: '2026-01-20',
    currentStage: 'Finished',
    expectedCompletion: '2026-02-20',
    outputWeight: 145,
    status: 'completed',
    daysInProduction: 31,
    moistureLevel: 42,
    temperature: 22,
    assignedTeam: null
  },
  {
    id: 'COMP-2024-014',
    sourceWeight: 290,
    startDate: '2026-03-10',
    currentStage: 'Active Processing',
    expectedCompletion: '2026-04-07',
    outputWeight: null,
    status: 'in-progress',
    daysInProduction: 14,
    moistureLevel: 68,
    temperature: 59,
    assignedTeam: 'Team C'
  },
];

// Available packing teams
const availableTeams = ['Team A', 'Team B', 'Team C'];

// Mock data for team members
const initialTeamsData = [
  {
    id: 'team-a',
    name: 'Team A',
    role: 'Processing & Sorting',
    members: [
      { id: 'emp-001', name: 'Jean Baptiste', position: 'Team Lead' },
      { id: 'emp-002', name: 'Marie Uwase', position: 'Sorter' },
      { id: 'emp-003', name: 'Patrick Nkusi', position: 'Sorter' }
    ]
  },
  {
    id: 'team-b',
    name: 'Team B',
    role: 'Composting & Curing',
    members: [
      { id: 'emp-004', name: 'Emmanuel Habimana', position: 'Team Lead' },
      { id: 'emp-005', name: 'Grace Murekatete', position: 'Compost Monitor' },
      { id: 'emp-006', name: 'Claude Niyonzima', position: 'Turner' }
    ]
  },
  {
    id: 'team-c',
    name: 'Team C',
    role: 'Packing & Quality Control',
    members: [
      { id: 'emp-007', name: 'David Mukasa', position: 'Team Lead' },
      { id: 'emp-008', name: 'Jean Mutabazi', position: 'Packer' },
      { id: 'emp-009', name: 'Alice Umutoni', position: 'QC Inspector' }
    ]
  }
];

// Mock data for plastic paver production
const mockPaverBatches = [
  {
    id: 'PAV-2024-008',
    plasticUsed: 125,
    unitsProduced: 85,
    productionDate: '2026-03-20',
    currentStage: 'Molding',
    status: 'in-progress',
    qualityGrade: 'A'
  },
  {
    id: 'PAV-2024-007',
    plasticUsed: 150,
    unitsProduced: 102,
    productionDate: '2026-03-18',
    currentStage: 'Ready for Sale',
    status: 'completed',
    qualityGrade: 'A'
  },
  {
    id: 'PAV-2024-006',
    plasticUsed: 140,
    unitsProduced: 95,
    productionDate: '2026-03-15',
    currentStage: 'Sold',
    status: 'sold',
    qualityGrade: 'B'
  },
  {
    id: 'PAV-2024-009',
    plasticUsed: 110,
    unitsProduced: 75,
    productionDate: '2026-03-22',
    currentStage: 'Shredding',
    status: 'in-progress',
    qualityGrade: 'A'
  },
];

// Mock data for daily temperature and humidity (Rwanda climate)
const mockWeatherData = [
  {
    day: 'Monday',
    temperature: 24,
    humidity: 68,
    windSpeed: 12,
    recommendations: [
      'Optimal temperature for active composting',
      'Continue regular turning schedule for all batches',
      'Monitor moisture levels - humidity is ideal'
    ]
  },
  {
    day: 'Tuesday',
    temperature: 28,
    humidity: 72,
    windSpeed: 8,
    recommendations: [
      'Higher temperature detected - excellent for decomposition',
      'Increase aeration to prevent overheating',
      'High humidity may require drainage check'
    ]
  },
  {
    day: 'Wednesday',
    temperature: 22,
    humidity: 65,
    windSpeed: 15,
    recommendations: [
      'Temperature slightly lower - decomposition may slow',
      'Consider moving batches to warmer area',
      'Good ventilation conditions with moderate wind'
    ]
  },
  {
    day: 'Thursday',
    temperature: 26,
    humidity: 70,
    windSpeed: 10,
    recommendations: [
      'Ideal composting conditions detected',
      'Perfect time to start new batches',
      'Maintain current moisture levels'
    ]
  },
  {
    day: 'Friday',
    temperature: 30,
    humidity: 78,
    windSpeed: 6,
    recommendations: [
      'High temperature and humidity - risk of anaerobic conditions',
      'Increase turning frequency to 2x daily',
      'Move sorted batches to shredding immediately',
      'Monitor for ammonia smell indicating overheating'
    ]
  },
  {
    day: 'Saturday',
    temperature: 25,
    humidity: 66,
    windSpeed: 14,
    recommendations: [
      'Excellent conditions for curing stage',
      'Move batches from active processing to curing',
      'Good day for quality testing'
    ]
  },
  {
    day: 'Sunday',
    temperature: 23,
    humidity: 64,
    windSpeed: 11,
    recommendations: [
      'Cooler temperature - slow decomposition expected',
      'Optimal for final curing and packaging',
      'Low risk conditions - minimal monitoring needed'
    ]
  }
];

export function AdminRecyclingManagement() {
  const [selectedIntake, setSelectedIntake] = useState<typeof mockWasteIntake[0] | null>(null);
  const [selectedCompostBatch, setSelectedCompostBatch] = useState<typeof mockCompostBatches[0] | null>(null);
  const [selectedPaverBatch, setSelectedPaverBatch] = useState<typeof mockPaverBatches[0] | null>(null);
  const [compostStatusFilter, setCompostStatusFilter] = useState<string>('all');
  const [paverStatusFilter, setPaverStatusFilter] = useState<string>('all');
  const [temperatureDialogOpen, setTemperatureDialogOpen] = useState(false);
  const [selectedWeatherDay, setSelectedWeatherDay] = useState('Monday');
  const [teamAssignDialogOpen, setTeamAssignDialogOpen] = useState(false);
  const [batchToAssign, setBatchToAssign] = useState<typeof mockCompostBatches[0] | null>(null);
  const [assignedTeams, setAssignedTeams] = useState<Record<string, string>>({});
  const [teams, setTeams] = useState(initialTeamsData);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [moveMemberDialogOpen, setMoveMemberDialogOpen] = useState(false);
  const [memberToMove, setMemberToMove] = useState<{ member: typeof initialTeamsData[0]['members'][0], fromTeam: string } | null>(null);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamRole, setNewTeamRole] = useState('');

  const handleTeamAssignment = (team: string) => {
    if (batchToAssign) {
      setAssignedTeams({
        ...assignedTeams,
        [batchToAssign.id]: team
      });
      toast.success(`${team} assigned to batch ${batchToAssign.id}`);
      setTeamAssignDialogOpen(false);
      setBatchToAssign(null);
    }
  };

  const getAssignedTeam = (batchId: string) => {
    return assignedTeams[batchId] || mockCompostBatches.find(b => b.id === batchId)?.assignedTeam || null;
  };

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleMoveMember = (targetTeamId: string) => {
    if (!memberToMove) return;

    setTeams(prev => {
      const fromTeam = prev.find(t => t.id === memberToMove.fromTeam);
      const toTeam = prev.find(t => t.id === targetTeamId);

      if (!fromTeam || !toTeam) return prev;

      return prev.map(team => {
        if (team.id === memberToMove.fromTeam) {
          return {
            ...team,
            members: team.members.filter(m => m.id !== memberToMove.member.id)
          };
        }
        if (team.id === targetTeamId) {
          return {
            ...team,
            members: [...team.members, memberToMove.member]
          };
        }
        return team;
      });
    });

    toast.success(`${memberToMove.member.name} moved to ${teams.find(t => t.id === targetTeamId)?.name}`);
    setMoveMemberDialogOpen(false);
    setMemberToMove(null);
  };

  const handleCreateTeam = () => {
    if (!newTeamName || !newTeamRole) {
      toast.error('Please fill in all fields');
      return;
    }

    const newTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      role: newTeamRole,
      members: []
    };

    setTeams(prev => [...prev, newTeam]);
    toast.success(`Team "${newTeamName}" created successfully`);
    setCreateTeamDialogOpen(false);
    setNewTeamName('');
    setNewTeamRole('');
  };

  const getQualityStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Finished':
      case 'Ready for Sale':
      case 'Sold':
        return 'bg-green-100 text-green-800';
      case 'Curing':
      case 'Molding':
        return 'bg-blue-100 text-blue-800';
      case 'Active Processing':
      case 'Shredding':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter compost batches based on status
  const filteredCompostBatches = mockCompostBatches.filter(batch => {
    if (compostStatusFilter === 'all') return true;
    return batch.status === compostStatusFilter;
  });

  // Filter paver batches based on status
  const filteredPaverBatches = mockPaverBatches.filter(batch => {
    if (paverStatusFilter === 'all') return true;
    return batch.status === paverStatusFilter;
  });

  // Center Creation state
  const [createCenterOpen, setCreateCenterOpen] = useState(false);
  const [creatingCenter, setCreatingCenter] = useState(false);
  const [centerForm, setCenterForm] = useState({ name: '', address: '', latitude: '', longitude: '', district: '', hours: '' });

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerForm.name || !centerForm.address || !centerForm.latitude || !centerForm.longitude) {
      toast.error('Please fill all required fields.');
      return;
    }
    setCreatingCenter(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recycling/centers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(centerForm),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Recycling center created successfully!');
        setCreateCenterOpen(false);
        setCenterForm({ name: '', address: '', latitude: '', longitude: '', district: '', hours: '' });
      } else {
        toast.error(data.message || 'Failed to create center');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error');
    } finally {
      setCreatingCenter(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl">Recycling & Processing Management</h2>
          <p className="text-gray-600 text-sm mt-1">Manage waste processing, production, and circular economy outputs</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={createCenterOpen} onOpenChange={setCreateCenterOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <MapPin className="h-4 w-4 mr-2" />
                Add Center
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Recycling Center</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCenter} className="space-y-4">
                <div>
                  <Label>Center Name *</Label>
                  <Input required value={centerForm.name} onChange={e => setCenterForm({ ...centerForm, name: e.target.value })} placeholder="e.g. Kicukiro Central Hub" className="mt-1" />
                </div>
                <div>
                  <Label>Address *</Label>
                  <Input required value={centerForm.address} onChange={e => setCenterForm({ ...centerForm, address: e.target.value })} placeholder="123 Main St" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Latitude *</Label>
                    <Input required type="number" step="any" value={centerForm.latitude} onChange={e => setCenterForm({ ...centerForm, latitude: e.target.value })} placeholder="-1.9441" className="mt-1" />
                  </div>
                  <div>
                    <Label>Longitude *</Label>
                    <Input required type="number" step="any" value={centerForm.longitude} onChange={e => setCenterForm({ ...centerForm, longitude: e.target.value })} placeholder="30.0619" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>District</Label>
                  <Input value={centerForm.district} onChange={e => setCenterForm({ ...centerForm, district: e.target.value })} placeholder="Kigali" className="mt-1" />
                </div>
                <div>
                  <Label>Operating Hours</Label>
                  <Input value={centerForm.hours} onChange={e => setCenterForm({ ...centerForm, hours: e.target.value })} placeholder="Mon-Sat 8AM - 6PM" className="mt-1" />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={creatingCenter}>
                  {creatingCenter ? 'Creating...' : 'Create Center'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => setTemperatureDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Thermometer className="h-4 w-4 mr-2" />
            Temperatures
          </Button>
        </div>
      </div>

      <Tabs defaultValue="intake" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full max-w-5xl">
          <TabsTrigger value="intake">Waste Intake</TabsTrigger>
          <TabsTrigger value="compost">Compost Production</TabsTrigger>
          <TabsTrigger value="pavers">Plastic Pavers</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* TAB 1: Waste Intake Management */}
        <TabsContent value="intake" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Waste Intake Quality Control</h3>
              <p className="text-sm text-gray-600">Review and approve collected waste for processing</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                {mockWasteIntake.filter(w => w.qualityStatus === 'pending').length} Pending Review
              </Badge>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Intake Table */}
            <div className={`${selectedIntake ? 'flex-1' : 'flex-1'} bg-white rounded-lg border overflow-hidden`}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Collection ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Waste Type</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Weight (kg)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Zone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Collector</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Quality Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWasteIntake.map((intake) => (
                    <tr 
                      key={intake.id}
                      onClick={() => setSelectedIntake(intake)}
                      className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedIntake?.id === intake.id ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium">{intake.id}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{intake.wasteType}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">{intake.actualWeight}</td>
                      <td className="py-3 px-4 text-gray-600">{intake.zone}</td>
                      <td className="py-3 px-4 text-gray-600">{intake.dateCollected}</td>
                      <td className="py-3 px-4 text-gray-600">{intake.collector}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getQualityStatusColor(intake.qualityStatus)}>
                          {intake.qualityStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIntake(intake);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Detail Panel */}
            {selectedIntake && (
              <div className="w-80 bg-white rounded-lg border p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h4 className="font-bold">{selectedIntake.id}</h4>
                  <Badge className={getQualityStatusColor(selectedIntake.qualityStatus)}>
                    {selectedIntake.qualityStatus}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Resident</Label>
                    <p className="font-medium">{selectedIntake.residentName}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-600">Waste Type & Weight</Label>
                    <p className="font-medium">{selectedIntake.wasteType} - {selectedIntake.actualWeight} kg</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Collection Zone</Label>
                    <p className="font-medium">{selectedIntake.zone}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Collector</Label>
                    <p className="font-medium">{selectedIntake.collector}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Collector Notes</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedIntake.collectorNotes}</p>
                  </div>

                  {selectedIntake.proofPhoto && (
                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">Proof Photo</Label>
                      <div className="border rounded-lg p-8 bg-gray-50 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Photo available for review</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedIntake.qualityStatus === 'pending' && (
                  <div className="pt-4 border-t space-y-2">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve for Processing
                    </Button>
                    <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject Intake
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: Compost Production */}
        <TabsContent value="compost" className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-1">Compost Production Pipeline</h3>
            <p className="text-sm text-gray-600">Track organic waste transformation into compost</p>
          </div>

          {/* Pipeline Visualization */}
          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                  <div className="font-bold text-2xl text-gray-900">890</div>
                  <div className="text-xs text-gray-600 mt-1">Awaiting Processing (kg)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="font-bold text-2xl text-orange-600">2</div>
                  <div className="text-xs text-gray-600 mt-1">Active Batches</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="font-bold text-2xl text-blue-600">1</div>
                  <div className="text-xs text-gray-600 mt-1">Curing Stage</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="font-bold text-2xl text-green-600">330</div>
                  <div className="text-xs text-gray-600 mt-1">Finished Inventory (kg)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="font-bold text-2xl text-purple-600">2,450</div>
                  <div className="text-xs text-gray-600 mt-1">Sold This Month (kg)</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compost Batch Table */}
          <div className="flex gap-4">
            <div className={`${selectedCompostBatch ? 'flex-1' : 'flex-1'} bg-white rounded-lg border overflow-hidden`}>
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h4 className="font-semibold">Compost Batches</h4>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <Select value={compostStatusFilter} onValueChange={setCompostStatusFilter}>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Batch ID</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Source Weight (kg)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Start Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Current Stage</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Expected Completion</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Output (kg)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompostBatches.map((batch) => (
                    <tr
                      key={batch.id}
                      onClick={() => setSelectedCompostBatch(batch)}
                      className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedCompostBatch?.id === batch.id ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium">{batch.id}</td>
                      <td className="py-3 px-4 text-center font-medium">{batch.sourceWeight}</td>
                      <td className="py-3 px-4 text-gray-600">{batch.startDate}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStageColor(batch.currentStage)}>
                          {batch.currentStage}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{batch.expectedCompletion}</td>
                      <td className="py-3 px-4 text-center font-medium">
                        {batch.outputWeight ? batch.outputWeight : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={
                          batch.status === 'completed' ? 'border-green-600 text-green-700' : 'border-blue-600 text-blue-700'
                        }>
                          {batch.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {batch.status === 'completed' && !getAssignedTeam(batch.id) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBatchToAssign(batch);
                              setTeamAssignDialogOpen(true);
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <User className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompostBatch(batch);
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Compost Batch Detail Panel */}
            {selectedCompostBatch && (
              <div className="w-80 bg-white rounded-lg border p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h4 className="font-bold">{selectedCompostBatch.id}</h4>
                  <Badge className={getStageColor(selectedCompostBatch.currentStage)}>
                    {selectedCompostBatch.currentStage}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Source Material Weight</Label>
                    <p className="font-bold text-2xl">{selectedCompostBatch.sourceWeight} kg</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Start Date</Label>
                      <p className="font-medium">{selectedCompostBatch.startDate}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Days Active</Label>
                      <p className="font-medium">{selectedCompostBatch.daysInProduction} days</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Expected Completion</Label>
                    <p className="font-medium">{selectedCompostBatch.expectedCompletion}</p>
                  </div>

                  {getAssignedTeam(selectedCompostBatch.id) && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <Label className="text-xs text-blue-700">Assigned Team</Label>
                      <p className="font-bold text-lg text-blue-800 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {getAssignedTeam(selectedCompostBatch.id)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {selectedCompostBatch.status === 'completed' ? 'Packing team assigned' : 'Processing team'}
                      </p>
                    </div>
                  )}

                  {selectedCompostBatch.outputWeight && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <Label className="text-xs text-green-700">Output Weight</Label>
                      <p className="font-bold text-xl text-green-800">{selectedCompostBatch.outputWeight} kg</p>
                      <p className="text-xs text-green-600 mt-1">
                        {((selectedCompostBatch.outputWeight / selectedCompostBatch.sourceWeight) * 100).toFixed(1)}% conversion rate
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Production Progress</Label>
                    <Progress 
                      value={(selectedCompostBatch.daysInProduction / 28) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedCompostBatch.daysInProduction} of ~28 days
                    </p>
                  </div>
                </div>

                {selectedCompostBatch.status === 'in-progress' && (
                  <div className="pt-4 border-t space-y-2">
                    {selectedCompostBatch.currentStage === 'Curing' && (
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve Completion
                      </Button>
                    )}
                    {selectedCompostBatch.currentStage === 'Active Processing' && (
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Move to Curing Stage
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: Plastic Paver Production */}
        <TabsContent value="pavers" className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-1">Plastic Paver Production Pipeline</h3>
            <p className="text-sm text-gray-600">Transform plastic waste into construction pavers</p>
          </div>

          {/* Production Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                  <div className="font-bold text-2xl text-gray-900">415</div>
                  <div className="text-xs text-gray-600 mt-1">Plastic Stock (kg)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Factory className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <div className="font-bold text-2xl text-orange-600">85</div>
                  <div className="text-xs text-gray-600 mt-1">Units in Production</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Box className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="font-bold text-2xl text-green-600">197</div>
                  <div className="text-xs text-gray-600 mt-1">Ready for Sale</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="font-bold text-2xl text-blue-600">95%</div>
                  <div className="text-xs text-gray-600 mt-1">Production Efficiency</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Production Pipeline Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="bg-gray-100 rounded-lg p-4 mb-2">
                    <p className="font-bold text-xl">415 kg</p>
                  </div>
                  <p className="text-xs text-gray-600">Plastic Stock</p>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
                <div className="text-center flex-1">
                  <div className="bg-yellow-100 rounded-lg p-4 mb-2">
                    <p className="font-bold text-xl">125 kg</p>
                  </div>
                  <p className="text-xs text-gray-600">In Shredding</p>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
                <div className="text-center flex-1">
                  <div className="bg-orange-100 rounded-lg p-4 mb-2">
                    <p className="font-bold text-xl">85 units</p>
                  </div>
                  <p className="text-xs text-gray-600">In Molding</p>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
                <div className="text-center flex-1">
                  <div className="bg-green-100 rounded-lg p-4 mb-2">
                    <p className="font-bold text-xl">197 units</p>
                  </div>
                  <p className="text-xs text-gray-600">Ready for Sale</p>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
                <div className="text-center flex-1">
                  <div className="bg-blue-100 rounded-lg p-4 mb-2">
                    <p className="font-bold text-xl">1,240</p>
                  </div>
                  <p className="text-xs text-gray-600">Units Sold (MTD)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Batch Table */}
          <div className="flex gap-4">
            <div className={`${selectedPaverBatch ? 'flex-1' : 'flex-1'} bg-white rounded-lg border overflow-hidden`}>
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <h4 className="font-semibold">Production Batches</h4>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <Select value={paverStatusFilter} onValueChange={setPaverStatusFilter}>
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Batch ID</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Plastic Used (kg)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Units Produced</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Production Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Current Stage</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaverBatches.map((batch) => (
                    <tr
                      key={batch.id}
                      onClick={() => setSelectedPaverBatch(batch)}
                      className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedPaverBatch?.id === batch.id ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium">{batch.id}</td>
                      <td className="py-3 px-4 text-center font-medium">{batch.plasticUsed}</td>
                      <td className="py-3 px-4 text-center font-medium">{batch.unitsProduced}</td>
                      <td className="py-3 px-4 text-gray-600">{batch.productionDate}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStageColor(batch.currentStage)}>
                          {batch.currentStage}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={
                          batch.status === 'sold' ? 'border-purple-600 text-purple-700' :
                          batch.status === 'completed' ? 'border-green-600 text-green-700' :
                          'border-orange-600 text-orange-700'
                        }>
                          {batch.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {batch.status === 'in-progress' && (
                          <Button size="sm" variant="outline">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paver Batch Detail Panel */}
            {selectedPaverBatch && (
              <div className="w-80 bg-white rounded-lg border p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h4 className="font-bold">{selectedPaverBatch.id}</h4>
                  <Badge className={getStageColor(selectedPaverBatch.currentStage)}>
                    {selectedPaverBatch.currentStage}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Plastic Material Used</Label>
                    <p className="font-bold text-2xl">{selectedPaverBatch.plasticUsed} kg</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Production Date</Label>
                      <p className="font-medium">{selectedPaverBatch.productionDate}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Quality Grade</Label>
                      <Badge className="bg-green-100 text-green-800">{selectedPaverBatch.qualityGrade}</Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Units Produced</Label>
                    <p className="font-bold text-xl text-green-800">{selectedPaverBatch.unitsProduced} pavers</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {(selectedPaverBatch.plasticUsed / selectedPaverBatch.unitsProduced).toFixed(2)} kg/paver
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-600">Status</Label>
                    <Badge variant="outline" className={
                      selectedPaverBatch.status === 'sold' ? 'border-purple-600 text-purple-700' :
                      selectedPaverBatch.status === 'completed' ? 'border-green-600 text-green-700' :
                      'border-orange-600 text-orange-700'
                    }>
                      {selectedPaverBatch.status}
                    </Badge>
                  </div>
                </div>

                {selectedPaverBatch.status === 'in-progress' && (
                  <div className="pt-4 border-t space-y-2">
                    {selectedPaverBatch.currentStage === 'Molding' && (
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    )}
                    {selectedPaverBatch.currentStage === 'Shredding' && (
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Move to Molding
                      </Button>
                    )}
                  </div>
                )}

                {selectedPaverBatch.status === 'completed' && (
                  <div className="pt-4 border-t">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Mark as Sold
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 4: Teams Management */}
        <TabsContent value="teams" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Team Management</h3>
              <p className="text-sm text-gray-600">Manage processing teams and assign members</p>
            </div>
            <Button
              onClick={() => setCreateTeamDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Team
            </Button>
          </div>

          <div className="grid gap-4">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-green-700" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{team.name}</CardTitle>
                        <p className="text-sm text-gray-600">{team.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-700 border-blue-600">
                        {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTeamExpansion(team.id)}
                      >
                        {expandedTeams.includes(team.id) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedTeams.includes(team.id) && (
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600 font-semibold">Team Members</Label>
                      {team.members.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                          <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">No members in this team yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {team.members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full border">
                                  <User className="h-4 w-4 text-gray-700" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{member.name}</p>
                                  <p className="text-xs text-gray-600">{member.position}</p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMemberToMove({ member, fromTeam: team.id });
                                  setMoveMemberDialogOpen(true);
                                }}
                              >
                                <Move className="h-4 w-4 mr-1" />
                                Move
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 5: Inventory & Output */}
        <TabsContent value="inventory" className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-1">Inventory & Output Overview</h3>
            <p className="text-sm text-gray-600">Monitor stock levels and sales performance</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Compost Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Compost Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="font-bold text-3xl text-green-700">330</div>
                    <div className="text-xs text-gray-600 mt-1">Available (kg)</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="font-bold text-3xl text-purple-700">2,450</div>
                    <div className="text-xs text-gray-600 mt-1">Sold MTD (kg)</div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      <strong>Low Stock Warning:</strong> Inventory below 500kg threshold
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600 mb-2 block">Stock Level</Label>
                  <Progress value={33} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">330 kg / 1,000 kg capacity</p>
                </div>
              </CardContent>
            </Card>

            {/* Paver Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5 text-blue-600" />
                  Plastic Paver Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-2xl text-blue-700">197</div>
                    <div className="text-xs text-gray-600 mt-1">Available</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-2xl text-yellow-700">45</div>
                    <div className="text-xs text-gray-600 mt-1">Reserved</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="font-bold text-2xl text-purple-700">1,240</div>
                    <div className="text-xs text-gray-600 mt-1">Sold MTD</div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <Label className="text-xs text-green-700">Revenue Generated (MTD)</Label>
                  <p className="font-bold text-2xl text-green-800">RWF 6,200,000</p>
                  <p className="text-xs text-green-600 mt-1">Average: RWF 5,000 per unit</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Production Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[65, 78, 82, 90, 85, 95, 88].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs text-gray-600">W{i + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Sales Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[70, 65, 88, 92, 78, 95, 85].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs text-gray-600">W{i + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 6: Production Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-1">Production Reports & Analytics</h3>
            <p className="text-sm text-gray-600">Generate comprehensive reports and track environmental impact</p>
          </div>

          {/* Report Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm mb-2 block">Date Range</Label>
                  <Select defaultValue="this-month">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Waste Type</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="plastic">Plastic</SelectItem>
                      <SelectItem value="recyclables">Recyclables</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Production Type</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="compost">Compost</SelectItem>
                      <SelectItem value="pavers">Plastic Pavers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate PDF Report
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                  <div className="font-bold text-2xl text-gray-900">3,420</div>
                  <div className="text-xs text-gray-600 mt-1">Total Waste Processed (kg)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Leaf className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="font-bold text-2xl text-green-600">2,780</div>
                  <div className="text-xs text-gray-600 mt-1">Compost Produced (kg)</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Box className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="font-bold text-2xl text-blue-600">1,437</div>
                  <div className="text-xs text-gray-600 mt-1">Pavers Produced</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="font-bold text-2xl text-purple-600">8.2M</div>
                  <div className="text-xs text-gray-600 mt-1">Revenue Generated (RWF)</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Impact Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Environmental Impact Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="font-bold text-4xl text-green-700">8.5</div>
                  <div className="text-sm text-gray-600 mt-2">Tonnes CO₂ Saved</div>
                  <p className="text-xs text-gray-500 mt-1">vs. landfill disposal</p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="font-bold text-4xl text-blue-700">94%</div>
                  <div className="text-sm text-gray-600 mt-2">Landfill Diversion Rate</div>
                  <p className="text-xs text-gray-500 mt-1">of collected waste</p>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="font-bold text-4xl text-purple-700">1,240</div>
                  <div className="text-sm text-gray-600 mt-2">Plastic Bottles Recycled</div>
                  <p className="text-xs text-gray-500 mt-1">equivalent units</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Move Member Dialog */}
      <Dialog open={moveMemberDialogOpen} onOpenChange={setMoveMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Move className="h-5 w-5 text-blue-600" />
              Move Team Member
            </DialogTitle>
            <DialogDescription>
              {memberToMove && `Select a team to move ${memberToMove.member.name} to`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Label className="text-sm">Available Teams</Label>
            <div className="space-y-2">
              {teams
                .filter(t => memberToMove && t.id !== memberToMove.fromTeam)
                .map((team) => (
                  <Button
                    key={team.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-4 hover:bg-blue-50 hover:border-blue-600"
                    onClick={() => handleMoveMember(team.id)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{team.name}</p>
                        <p className="text-xs text-gray-600">{team.role} • {team.members.length} members</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              Create New Team
            </DialogTitle>
            <DialogDescription>
              Add a new processing team to your organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="e.g., Team D"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-role">Team Role</Label>
              <Input
                id="team-role"
                placeholder="e.g., Plastic Processing"
                value={newTeamRole}
                onChange={(e) => setNewTeamRole(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCreateTeamDialogOpen(false);
                  setNewTeamName('');
                  setNewTeamRole('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleCreateTeam}
              >
                Create Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Assignment Dialog */}
      <Dialog open={teamAssignDialogOpen} onOpenChange={setTeamAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Assign Packing Team
            </DialogTitle>
            <DialogDescription>
              {batchToAssign && `Select a team to handle packing for batch ${batchToAssign.id}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Label className="text-sm">Available Teams for Packing</Label>
            <div className="space-y-2">
              {availableTeams.map((team) => (
                <Button
                  key={team}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4 hover:bg-green-50 hover:border-green-600"
                  onClick={() => handleTeamAssignment(team)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="bg-green-100 p-2 rounded-full">
                      <User className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{team}</p>
                      <p className="text-xs text-gray-600">Click to assign this team</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Temperature & Weather Dialog */}
      <Dialog open={temperatureDialogOpen} onOpenChange={setTemperatureDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              Regional Temperature & Humidity Data
            </DialogTitle>
            <DialogDescription>
              Daily weather conditions and composting recommendations for Kigali region
            </DialogDescription>
          </DialogHeader>

          <Tabs value={selectedWeatherDay} onValueChange={setSelectedWeatherDay} className="mt-4">
            <TabsList className="grid grid-cols-7 w-full">
              {mockWeatherData.map((data) => (
                <TabsTrigger key={data.day} value={data.day} className="text-xs">
                  {data.day.substring(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            {mockWeatherData.map((dayData) => (
              <TabsContent key={dayData.day} value={dayData.day} className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Temperature Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Thermometer className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                        <div className="font-bold text-3xl text-gray-900">{dayData.temperature}°C</div>
                        <div className="text-xs text-gray-600 mt-1">Temperature</div>
                        <Badge className={
                          dayData.temperature >= 28 ? 'bg-red-100 text-red-800 mt-2' :
                          dayData.temperature >= 24 ? 'bg-green-100 text-green-800 mt-2' :
                          'bg-blue-100 text-blue-800 mt-2'
                        }>
                          {dayData.temperature >= 28 ? 'High' : dayData.temperature >= 24 ? 'Optimal' : 'Cool'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Humidity Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Droplets className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <div className="font-bold text-3xl text-gray-900">{dayData.humidity}%</div>
                        <div className="text-xs text-gray-600 mt-1">Humidity</div>
                        <Badge className={
                          dayData.humidity >= 75 ? 'bg-blue-100 text-blue-800 mt-2' :
                          dayData.humidity >= 60 ? 'bg-green-100 text-green-800 mt-2' :
                          'bg-yellow-100 text-yellow-800 mt-2'
                        }>
                          {dayData.humidity >= 75 ? 'High' : dayData.humidity >= 60 ? 'Good' : 'Low'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Wind Speed Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Wind className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                        <div className="font-bold text-3xl text-gray-900">{dayData.windSpeed}</div>
                        <div className="text-xs text-gray-600 mt-1">Wind Speed (km/h)</div>
                        <Badge className={
                          dayData.windSpeed >= 15 ? 'bg-gray-100 text-gray-800 mt-2' :
                          dayData.windSpeed >= 10 ? 'bg-green-100 text-green-800 mt-2' :
                          'bg-yellow-100 text-yellow-800 mt-2'
                        }>
                          {dayData.windSpeed >= 15 ? 'Breezy' : dayData.windSpeed >= 10 ? 'Moderate' : 'Light'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      Composting Recommendations for {dayData.day}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dayData.recommendations.map((recommendation, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg ${
                            recommendation.includes('risk') || recommendation.includes('High temperature')
                              ? 'bg-red-50 border border-red-200'
                              : recommendation.includes('Optimal') || recommendation.includes('Ideal') || recommendation.includes('Excellent')
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          {recommendation.includes('risk') || recommendation.includes('High temperature') ? (
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          ) : recommendation.includes('Optimal') || recommendation.includes('Ideal') || recommendation.includes('Excellent') ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Activity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          )}
                          <p className={`text-sm ${
                            recommendation.includes('risk') || recommendation.includes('High temperature')
                              ? 'text-red-800'
                              : recommendation.includes('Optimal') || recommendation.includes('Ideal') || recommendation.includes('Excellent')
                              ? 'text-green-800'
                              : 'text-blue-800'
                          }`}>
                            {recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}