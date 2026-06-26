import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Recycle, MapPin, Award, TrendingUp, Leaf, Trash2, Package, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { WasteIntakeTab } from '@/app/components/admin/WasteIntakeTab';

interface RecyclingModuleProps {
  userRole?: string;
}

interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  distance: string;
  acceptedMaterials: string[];
  status: 'open' | 'closed';
  hours: string;
}

interface RecyclingRecord {
  id: string;
  date: string;
  material: string;
  weight: number;
  points: number;
  status: 'processed' | 'pending' | 'verified';
}

const mockCenters: RecyclingCenter[] = [
  {
    id: '1',
    name: 'Kigali Recycling Hub',
    address: 'KG 5 Ave, Kigali',
    distance: '2.3 km',
    acceptedMaterials: ['Plastic', 'Paper', 'Metal', 'Glass'],
    status: 'open',
    hours: '7:00 AM - 6:00 PM',
  },
  {
    id: '2',
    name: 'Green Care Processing Center',
    address: 'Kimihurura, Gasabo',
    distance: '4.7 km',
    acceptedMaterials: ['Plastic', 'Paper', 'Electronics', 'Textiles'],
    status: 'open',
    hours: '8:00 AM - 5:00 PM',
  },
  {
    id: '3',
    name: 'Nyarutarama Eco Station',
    address: 'KG 578 St, Gasabo',
    distance: '5.1 km',
    acceptedMaterials: ['Organic', 'Plastic', 'Paper'],
    status: 'closed',
    hours: '8:00 AM - 4:00 PM',
  },
];

const mockRecords: RecyclingRecord[] = [
  { id: '1', date: '2026-01-18', material: 'Plastic Bottles', weight: 5.2, points: 52, status: 'verified' },
  { id: '2', date: '2026-01-15', material: 'Paper/Cardboard', weight: 8.5, points: 85, status: 'verified' },
  { id: '3', date: '2026-01-12', material: 'Metal Cans', weight: 3.0, points: 45, status: 'processed' },
  { id: '4', date: '2026-01-20', material: 'Glass Bottles', weight: 4.5, points: 60, status: 'pending' },
];

const wasteCategories = [
  { name: 'Plastic', icon: '♻️', color: 'bg-blue-100 text-blue-800', tips: 'Clean and dry bottles, containers' },
  { name: 'Paper', icon: '📄', color: 'bg-amber-100 text-amber-800', tips: 'Flatten boxes, remove staples' },
  { name: 'Glass', icon: '🥤', color: 'bg-green-100 text-green-800', tips: 'Rinse bottles and jars' },
  { name: 'Metal', icon: '🥫', color: 'bg-gray-100 text-gray-800', tips: 'Clean cans and metal items' },
  { name: 'Organic', icon: '🌱', color: 'bg-emerald-100 text-emerald-800', tips: 'Food scraps, yard waste' },
  { name: 'Electronics', icon: '💻', color: 'bg-purple-100 text-purple-800', tips: 'Phones, computers, batteries' },
];

export function RecyclingModule({ userRole }: RecyclingModuleProps) {
  if (userRole === 'admin') {
    return <WasteIntakeTab />;
  }

  // Otherwise, show resident view
  const [selectedTab, setSelectedTab] = useState('centers');
  const totalPoints = mockRecords.reduce((acc, record) => acc + record.points, 0);

  const getStatusBadge = (status: string) => {
    const variants = {
      verified: 'bg-green-100 text-green-800',
      processed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Recycling & Processing</h2>
          <p className="text-gray-600 mt-1">Track your recycling activities and earn rewards</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Package className="h-4 w-4 mr-2" />
              Log Recycling
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Recycling Activity</DialogTitle>
              <DialogDescription>
                Log your recycled materials to track your environmental impact
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Material Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {wasteCategories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name.toLowerCase()}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.1" placeholder="0.0" />
              </div>
              <div className="space-y-2">
                <Label>Drop-off Location</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select center" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCenters.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" defaultValue="2026-01-20" />
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">Submit Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalPoints}</div>
            <p className="text-gray-600 text-sm">+52 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Recycle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">21.2 kg</div>
            <p className="text-gray-600 text-sm">Materials recycled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">45.6 kg</div>
            <p className="text-gray-600 text-sm">Carbon offset</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">#23</div>
            <p className="text-gray-600 text-sm">In your district</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="centers">
            <MapPin className="h-4 w-4 mr-2" />
            Centers
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Trash2 className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Award className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recycling Centers Near You</CardTitle>
              <CardDescription>Find drop-off locations for your recyclables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCenters.map((center) => (
                  <div key={center.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium text-lg">{center.name}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {center.address} • {center.distance}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Hours: {center.hours}
                        </div>
                      </div>
                      <Badge className={center.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {center.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {center.acceptedMaterials.map((material) => (
                        <Badge key={material} variant="outline" className="bg-blue-50">
                          {material}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        Get Directions
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule Drop-off
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Waste Categories Guide</CardTitle>
              <CardDescription>Learn how to properly sort your recyclables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wasteCategories.map((category) => (
                  <div key={category.name} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-3xl">{category.icon}</div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <Badge className={category.color}>Recyclable</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Tips:</strong> {category.tips}
                    </p>
                    <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                      View detailed guidelines →
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recycling History</CardTitle>
              <CardDescription>Your recycling activity and processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Recycle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{record.material}</div>
                        <div className="text-sm text-gray-600">
                          {record.date} • {record.weight} kg
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="font-bold text-green-600">+{record.points} points</div>
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Rewards Progress</CardTitle>
              <CardDescription>Earn points and unlock rewards for recycling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <Award className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
                <div className="font-bold text-3xl text-green-600">{totalPoints}</div>
                <div className="text-gray-600 mt-1">Total Points Earned</div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Bronze Level</span>
                    <span className="text-gray-600">500 points to Silver</span>
                  </div>
                  <Progress value={(totalPoints / 1000) * 100} className="h-3" />
                </div>

                <div className="space-y-3 pt-4">
                  <h4 className="font-medium">Available Rewards</h4>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">500 RWF Mobile Credit</div>
                        <div className="text-sm text-gray-600">Redeem with 100 points</div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Redeem
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Reusable Shopping Bag</div>
                        <div className="text-sm text-gray-600">Redeem with 200 points</div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Redeem
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-500">Tree Planting Sponsorship</div>
                        <div className="text-sm text-gray-400">Requires 500 points</div>
                      </div>
                      <Button size="sm" disabled>
                        Locked
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}