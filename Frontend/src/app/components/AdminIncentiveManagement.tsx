import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Progress } from '@/app/components/ui/progress';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Award, Trophy, Medal, Gift, Target, TrendingUp, Users,
  Edit, Plus, Download, FileText, Calendar, MapPin,
  CheckCircle2, Clock, XCircle, Search, Filter, Star,
  Zap, Leaf, Package, ArrowUp, ArrowDown, Eye, Settings,
  Bell, User, ArrowRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';

// Mock leaderboard data
const mockLeaderboard = [
  {
    rank: 1,
    name: 'Marie Uwase Kamanzi',
    zone: 'Gasabo - Remera',
    organicKg: 245,
    plasticKg: 128,
    totalPoints: 1850,
    participationRate: 98,
    separationQuality: 96,
    status: 'active',
    badge: 'gold'
  },
  {
    rank: 2,
    name: 'Jean Baptiste Uwimana',
    zone: 'Kicukiro - Gatenga',
    organicKg: 220,
    plasticKg: 115,
    totalPoints: 1680,
    participationRate: 95,
    separationQuality: 94,
    status: 'active',
    badge: 'gold'
  },
  {
    rank: 3,
    name: 'Patrick Nkusi Mugabo',
    zone: 'Nyarugenge - Nyarugenge',
    organicKg: 210,
    plasticKg: 105,
    totalPoints: 1575,
    participationRate: 92,
    separationQuality: 93,
    status: 'active',
    badge: 'silver'
  },
  {
    rank: 4,
    name: 'Emmanuel Habimana',
    zone: 'Gasabo - Kacyiru',
    organicKg: 195,
    plasticKg: 98,
    totalPoints: 1465,
    participationRate: 89,
    separationQuality: 91,
    status: 'active',
    badge: 'silver'
  },
  {
    rank: 5,
    name: 'Grace Murekatete',
    zone: 'Kicukiro - Niboye',
    organicKg: 180,
    plasticKg: 92,
    totalPoints: 1360,
    participationRate: 87,
    separationQuality: 89,
    status: 'active',
    badge: 'bronze'
  },
];

// Mock points rules
const mockPointsRules = [
  { id: 1, action: 'Separate Organic Waste', points: 5, unit: 'per kg', status: 'active' },
  { id: 2, action: 'Separate Plastic Waste', points: 7, unit: 'per kg', status: 'active' },
  { id: 3, action: 'On-time Drop-off', points: 10, unit: 'per pickup', status: 'active' },
  { id: 4, action: 'Quality Separation Bonus', points: 20, unit: 'per month', status: 'active' },
  { id: 5, action: 'Missed Pickup Penalty', points: -15, unit: 'per miss', status: 'active' },
  { id: 6, action: 'Community Clean-up Participation', points: 50, unit: 'per event', status: 'active' },
];

// Mock reward campaigns
const mockCampaigns = [
  {
    id: 'RWD-001',
    name: '500 Points Compost Discount',
    type: 'Product Discount',
    pointsRequired: 500,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    active: true,
    totalClaimed: 142
  },
  {
    id: 'RWD-002',
    name: 'Free Waste Pickup',
    type: 'Free Service',
    pointsRequired: 300,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    active: true,
    totalClaimed: 256
  },
  {
    id: 'RWD-003',
    name: 'Eco-friendly Product Voucher',
    type: 'Voucher',
    pointsRequired: 1000,
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    active: true,
    totalClaimed: 48
  },
];

// Mock issued rewards
const mockIssuedRewards = [
  {
    id: 'ISS-2024-345',
    residentName: 'Marie Uwase',
    rewardType: '500 Points Compost Discount',
    pointsUsed: 500,
    dateIssued: '2026-03-01',
    expiryDate: '2026-06-01',
    status: 'redeemed',
    redeemedDate: '2026-03-10'
  },
  {
    id: 'ISS-2024-346',
    residentName: 'Jean Baptiste',
    rewardType: 'Free Waste Pickup',
    pointsUsed: 300,
    dateIssued: '2026-03-02',
    expiryDate: '2026-04-02',
    status: 'pending',
    redeemedDate: null
  },
  {
    id: 'ISS-2024-347',
    residentName: 'Patrick Nkusi',
    rewardType: 'Eco-friendly Product Voucher',
    pointsUsed: 1000,
    dateIssued: '2026-02-20',
    expiryDate: '2026-05-20',
    status: 'expired',
    redeemedDate: null
  },
];

export function AdminIncentiveManagement() {
  const [selectedResident, setSelectedResident] = useState<typeof mockLeaderboard[0] | null>(null);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [issueRewardOpen, setIssueRewardOpen] = useState(false);
  const [adjustPointsOpen, setAdjustPointsOpen] = useState(false);
  const [editRuleOpen, setEditRuleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'gold':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'silver':
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 'bronze':
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'redeemed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeaderboard = mockLeaderboard.filter(resident => {
    const matchesSearch = searchQuery === '' || 
      resident.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = zoneFilter === 'all' || resident.zone.includes(zoneFilter);
    return matchesSearch && matchesZone;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl">Incentive & Rewards Management</h2>
        <p className="text-gray-600 text-sm mt-1">Monitor performance, manage rewards, and encourage sustainable behavior</p>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="points">Points Management</TabsTrigger>
          <TabsTrigger value="campaigns">Reward Campaigns</TabsTrigger>
          <TabsTrigger value="issued">Issued Rewards</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* TAB 1: Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-1">Top Performers Leaderboard</h3>
            <p className="text-sm text-gray-600">Recognize and reward residents with exceptional recycling behavior</p>
          </div>

          {/* Top 3 Highlights */}
          <div className="grid grid-cols-3 gap-4">
            {mockLeaderboard.slice(0, 3).map((resident) => (
              <Card key={resident.rank} className={`${
                resident.rank === 1 ? 'border-yellow-400 border-2' :
                resident.rank === 2 ? 'border-gray-400 border-2' :
                'border-orange-400 border-2'
              }`}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      {getBadgeIcon(resident.badge)}
                    </div>
                    <div>
                      <div className="font-bold text-3xl text-gray-900">#{resident.rank}</div>
                      <div className="font-semibold mt-1">{resident.name}</div>
                      <div className="text-xs text-gray-600">{resident.zone}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-bold text-2xl text-green-600">{resident.totalPoints}</div>
                      <div className="text-xs text-gray-600">Total Points</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded">
                        <div className="font-medium">{resident.organicKg} kg</div>
                        <div className="text-gray-600">Organic</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="font-medium">{resident.plasticKg} kg</div>
                        <div className="text-gray-600">Plastic</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by resident name..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                <SelectItem value="Gasabo">Gasabo</SelectItem>
                <SelectItem value="Kicukiro">Kicukiro</SelectItem>
                <SelectItem value="Nyarugenge">Nyarugenge</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="this-month">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Full Leaderboard Table */}
          <div className="flex gap-4">
            <div className={`${selectedResident ? 'flex-1' : 'flex-1'} bg-white rounded-lg border overflow-hidden`}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Resident Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Zone</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Organic (kg)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Plastic (kg)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Total Points</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Participation</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((resident) => (
                    <tr 
                      key={resident.rank}
                      onClick={() => setSelectedResident(resident)}
                      className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedResident?.rank === resident.rank ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-bold">#{resident.rank}</span>
                          {resident.rank <= 3 && getBadgeIcon(resident.badge)}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{resident.name}</td>
                      <td className="py-3 px-4 text-gray-600">{resident.zone}</td>
                      <td className="py-3 px-4 text-center font-medium text-green-600">{resident.organicKg}</td>
                      <td className="py-3 px-4 text-center font-medium text-blue-600">{resident.plasticKg}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-lg">{resident.totalPoints}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium">{resident.participationRate}%</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(resident.status)}>
                          {resident.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Detail Panel */}
            {selectedResident && (
              <div className="w-80 bg-white rounded-lg border p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h4 className="font-bold">{selectedResident.name}</h4>
                    <p className="text-sm text-gray-600">{selectedResident.zone}</p>
                  </div>
                  {getBadgeIcon(selectedResident.badge)}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="font-bold text-3xl text-green-700">{selectedResident.totalPoints}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Points</div>
                </div>

                <div>
                  <h5 className="font-semibold mb-3">Points Breakdown</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">From Organic Waste:</span>
                      <span className="font-medium text-green-600">+{selectedResident.organicKg * 5}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">From Plastic Waste:</span>
                      <span className="font-medium text-blue-600">+{selectedResident.plasticKg * 7}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bonus Points:</span>
                      <span className="font-medium text-purple-600">+120</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Penalties:</span>
                      <span className="font-medium text-red-600">-15</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold mb-2">Performance Metrics</h5>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Participation Rate</span>
                        <span className="font-medium">{selectedResident.participationRate}%</span>
                      </div>
                      <Progress value={selectedResident.participationRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Separation Quality</span>
                        <span className="font-medium">{selectedResident.separationQuality}%</span>
                      </div>
                      <Progress value={selectedResident.separationQuality} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <strong>Reward Eligible:</strong> This resident qualifies for premium rewards
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Dialog open={issueRewardOpen} onOpenChange={setIssueRewardOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Gift className="h-4 w-4 mr-2" />
                        Issue Reward
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Issue Reward to {selectedResident.name}</DialogTitle>
                        <DialogDescription>Select a reward campaign to issue</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label className="mb-2 block">Select Reward</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose reward..." />
                            </SelectTrigger>
                            <SelectContent>
                              {mockCampaigns.filter(c => c.active).map(campaign => (
                                <SelectItem key={campaign.id} value={campaign.id}>
                                  {campaign.name} ({campaign.pointsRequired} pts)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                          <p className="text-yellow-800">Points will be deducted from resident account upon issuance.</p>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          Issue & Notify Resident
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={adjustPointsOpen} onOpenChange={setAdjustPointsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Adjust Points
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adjust Points for {selectedResident.name}</DialogTitle>
                        <DialogDescription>Add or subtract points manually</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label className="mb-2 block">Points Adjustment</Label>
                          <Input type="number" placeholder="Enter points (use - for deduction)" />
                        </div>
                        <div>
                          <Label className="mb-2 block">Reason</Label>
                          <Textarea placeholder="Explain the reason for adjustment..." rows={3} />
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Apply Adjustment
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: Points Management */}
        <TabsContent value="points" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Points Rules Configuration</h3>
              <p className="text-sm text-gray-600">Define how points are awarded and deducted</p>
            </div>
            <Dialog open={editRuleOpen} onOpenChange={setEditRuleOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Points Rule</DialogTitle>
                  <DialogDescription>Define a new action and point value</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="mb-2 block">Action Name</Label>
                    <Input placeholder="e.g., Separate Glass Waste" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="mb-2 block">Points Value</Label>
                      <Input type="number" placeholder="10" />
                    </div>
                    <div>
                      <Label className="mb-2 block">Unit</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">per kg</SelectItem>
                          <SelectItem value="pickup">per pickup</SelectItem>
                          <SelectItem value="month">per month</SelectItem>
                          <SelectItem value="event">per event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch defaultChecked />
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Create Rule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* System Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="font-bold text-2xl text-gray-900">24,850</div>
                  <div className="text-xs text-gray-600 mt-1">Total Points Issued (MTD)</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="font-bold text-2xl text-gray-900">485</div>
                  <div className="text-xs text-gray-600 mt-1">Average Points per Resident</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="font-bold text-2xl text-gray-900">Gasabo</div>
                  <div className="text-xs text-gray-600 mt-1">Top Performing Zone</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Points Rules Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h4 className="font-semibold">Active Points Rules</h4>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Action Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Points</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Unit</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPointsRules.map((rule) => (
                  <tr key={rule.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{rule.action}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold text-lg ${rule.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {rule.points >= 0 ? '+' : ''}{rule.points}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{rule.unit}</td>
                    <td className="py-3 px-4 text-center">
                      <Switch checked={rule.status === 'active'} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 3: Reward Campaigns */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Reward Campaigns</h3>
              <p className="text-sm text-gray-600">Create and manage incentive campaigns</p>
            </div>
            <Dialog open={createCampaignOpen} onOpenChange={setCreateCampaignOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Reward Campaign</DialogTitle>
                  <DialogDescription>Design a new reward to incentivize recycling behavior</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Campaign Name *</Label>
                      <Input placeholder="e.g., 1000 Points Free Compost" />
                    </div>
                    <div>
                      <Label className="mb-2 block">Reward Type *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">Discount</SelectItem>
                          <SelectItem value="voucher">Voucher</SelectItem>
                          <SelectItem value="free-service">Free Service</SelectItem>
                          <SelectItem value="product">Product Discount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Points Required *</Label>
                      <Input type="number" placeholder="500" />
                    </div>
                    <div>
                      <Label className="mb-2 block">Eligible Zones</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All zones" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Zones</SelectItem>
                          <SelectItem value="gasabo">Gasabo Only</SelectItem>
                          <SelectItem value="kicukiro">Kicukiro Only</SelectItem>
                          <SelectItem value="nyarugenge">Nyarugenge Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Start Date *</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label className="mb-2 block">End Date *</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Description</Label>
                    <Textarea placeholder="Describe the reward and redemption instructions..." rows={3} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch defaultChecked />
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Create Campaign
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Campaign ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Campaign Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Points Required</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Start Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">End Date</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Total Claimed</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{campaign.id}</td>
                    <td className="py-3 px-4">{campaign.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{campaign.type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-green-600">
                      {campaign.pointsRequired}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{campaign.startDate}</td>
                    <td className="py-3 px-4 text-gray-600">{campaign.endDate}</td>
                    <td className="py-3 px-4 text-center font-medium">{campaign.totalClaimed}</td>
                    <td className="py-3 px-4 text-center">
                      <Switch checked={campaign.active} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 4: Issued Rewards */}
        <TabsContent value="issued" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Issued Rewards & Redemption</h3>
              <p className="text-sm text-gray-600">Track rewards given to residents and redemption status</p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="redeemed">Redeemed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Gift className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="font-bold text-2xl text-gray-900">446</div>
                  <div className="text-xs text-gray-600 mt-1">Total Rewards Issued</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="font-bold text-2xl text-green-600">312</div>
                  <div className="text-xs text-gray-600 mt-1">Redeemed</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                  <div className="font-bold text-2xl text-yellow-600">98</div>
                  <div className="text-xs text-gray-600 mt-1">Pending</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                  <div className="font-bold text-2xl text-red-600">36</div>
                  <div className="text-xs text-gray-600 mt-1">Expired</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issued Rewards Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Reward ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Resident Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Reward Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Points Used</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date Issued</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Expiry Date</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Redeemed Date</th>
                </tr>
              </thead>
              <tbody>
                {mockIssuedRewards.map((reward) => (
                  <tr key={reward.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{reward.id}</td>
                    <td className="py-3 px-4">{reward.residentName}</td>
                    <td className="py-3 px-4 text-gray-600">{reward.rewardType}</td>
                    <td className="py-3 px-4 text-center font-bold text-purple-600">
                      {reward.pointsUsed}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{reward.dateIssued}</td>
                    <td className="py-3 px-4 text-gray-600">{reward.expiryDate}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusColor(reward.status)}>
                        {reward.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {reward.redeemedDate || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Process Flow Indicator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reward Lifecycle Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="bg-blue-100 rounded-lg p-4 mb-2 mx-auto w-fit">
                    <Gift className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Issue Reward</p>
                  <p className="text-xs text-gray-600">Admin issues</p>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <div className="text-center flex-1">
                  <div className="bg-purple-100 rounded-lg p-4 mb-2 mx-auto w-fit">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium">Notification</p>
                  <p className="text-xs text-gray-600">Resident notified</p>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <div className="text-center flex-1">
                  <div className="bg-yellow-100 rounded-lg p-4 mb-2 mx-auto w-fit">
                    <User className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-sm font-medium">Resident Account</p>
                  <p className="text-xs text-gray-600">Appears in app</p>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-400" />
                <div className="text-center flex-1">
                  <div className="bg-green-100 rounded-lg p-4 mb-2 mx-auto w-fit">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Redemption</p>
                  <p className="text-xs text-gray-600">Resident redeems</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: Reports */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Incentive Performance Reports</h3>
              <p className="text-sm text-gray-600">Analyze reward effectiveness and program impact</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                  <div className="font-bold text-2xl text-gray-900">24,850</div>
                  <div className="text-xs text-gray-600 mt-1">Total Points Redeemed</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="font-bold text-2xl text-blue-600">78%</div>
                  <div className="text-xs text-gray-600 mt-1">Active Participants</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="font-bold text-2xl text-green-600">+32%</div>
                  <div className="text-xs text-gray-600 mt-1">Recycling Increase</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Gift className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="font-bold text-2xl text-purple-600">446</div>
                  <div className="text-xs text-gray-600 mt-1">Rewards Issued (MTD)</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Points Issued Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[65, 72, 78, 85, 92, 88, 95].map((value, i) => (
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
                <CardTitle className="text-base">Rewards Redeemed Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-2">
                  {[55, 68, 72, 80, 75, 85, 90].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-xs text-gray-600">W{i + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performing Zones by Points Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Gasabo - Remera</span>
                    <span className="font-medium">8,450 points</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Kicukiro - Gatenga</span>
                    <span className="font-medium">7,280 points</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Nyarugenge - Nyarugenge</span>
                    <span className="font-medium">5,920 points</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}