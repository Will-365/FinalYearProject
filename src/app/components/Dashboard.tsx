import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import { 
  TrendingUp, Users, Truck, Recycle, Download, Calendar, 
  MapPin, Phone, CheckCircle2, Clock, AlertTriangle, Camera,
  Navigation, Image as ImageIcon, XCircle, PlayCircle, Flag,
  MessageSquare, Bell, Home, User, Package, Radio, QrCode,
  Route
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Resident dashboard data
const collectionData = [
  { month: 'Jul', collections: 820 },
  { month: 'Aug', collections: 950 },
  { month: 'Sep', collections: 1100 },
  { month: 'Oct', collections: 1250 },
  { month: 'Nov', collections: 1180 },
  { month: 'Dec', collections: 1420 },
  { month: 'Jan', collections: 1500 },
];

const wasteComposition = [
  { name: 'Plastic', value: 35, color: '#3b82f6' },
  { name: 'Paper', value: 25, color: '#f59e0b' },
  { name: 'Organic', value: 20, color: '#10b981' },
  { name: 'Glass', value: 12, color: '#06b6d4' },
  { name: 'Metal', value: 8, color: '#6b7280' },
];

const recyclingTrend = [
  { month: 'Jul', rate: 62 },
  { month: 'Aug', rate: 65 },
  { month: 'Sep', rate: 68 },
  { month: 'Oct', rate: 71 },
  { month: 'Nov', rate: 69 },
  { month: 'Dec', rate: 74 },
  { month: 'Jan', rate: 78 },
];

// Collector dashboard data
const mockPickups = [
  {
    id: 'PU-2024-145',
    residentName: 'Marie Uwase',
    phone: '+250 788 123 456',
    location: 'Gasabo → Remera → Rukiri I',
    fullAddress: 'Gasabo → Remera → Rukiri I → Akagera',
    wasteType: 'Organic',
    estimatedWeight: 15,
    scheduledTime: '08:00 AM',
    status: 'pending',
    notes: 'Please ring the doorbell. Gate might be closed.',
    preferredTime: '8:00 AM - 10:00 AM'
  },
  {
    id: 'PU-2024-146',
    residentName: 'Patrick Nkusi',
    phone: '+250 788 234 567',
    location: 'Gasabo → Remera → Rukiri I',
    fullAddress: 'Gasabo → Remera → Rukiri I → Ubumwe',
    wasteType: 'Plastic',
    estimatedWeight: 8,
    scheduledTime: '08:30 AM',
    status: 'pending',
    notes: 'Bags are in front of the house',
    preferredTime: '8:30 AM - 9:00 AM'
  },
  {
    id: 'PU-2024-147',
    residentName: 'Jean Mutabazi',
    phone: '+250 788 345 678',
    location: 'Gasabo → Remera → Rukiri II',
    fullAddress: 'Gasabo → Remera → Rukiri II',
    wasteType: 'General',
    estimatedWeight: 12,
    scheduledTime: '09:00 AM',
    status: 'in-progress',
    notes: 'N/A',
    preferredTime: '9:00 AM - 10:00 AM'
  },
  {
    id: 'PU-2024-148',
    residentName: 'Grace Murekatete',
    phone: '+250 788 456 789',
    location: 'Gasabo → Kacyiru',
    fullAddress: 'Gasabo → Kacyiru → Kamatamu',
    wasteType: 'Organic',
    estimatedWeight: 20,
    scheduledTime: '10:00 AM',
    status: 'pending',
    notes: 'Call before arrival',
    preferredTime: '10:00 AM - 11:00 AM'
  },
  {
    id: 'PU-2024-149',
    residentName: 'Claude Niyonzima',
    phone: '+250 788 567 890',
    location: 'Gasabo → Remera → Rukiri I',
    fullAddress: 'Gasabo → Remera → Rukiri I → Akagera',
    wasteType: 'Plastic',
    estimatedWeight: 6,
    scheduledTime: '11:00 AM',
    status: 'completed',
    notes: 'N/A',
    preferredTime: '11:00 AM - 12:00 PM'
  },
  {
    id: 'PU-2024-150',
    residentName: 'Aline Mutoni',
    phone: '+250 788 678 901',
    location: 'Gasabo → Kacyiru',
    fullAddress: 'Gasabo → Kacyiru → Kamatamu',
    wasteType: 'General',
    estimatedWeight: 18,
    scheduledTime: '02:00 PM',
    status: 'pending',
    notes: 'Multiple bags - organic and general',
    preferredTime: '2:00 PM - 3:00 PM'
  },
];

const completedPickups = [
  {
    id: 'PU-2024-142',
    residentName: 'Eric Nkunda',
    location: 'Gasabo → Remera',
    wasteType: 'Plastic',
    weight: 7,
    completedAt: '2026-03-28 07:30 AM',
    status: 'completed'
  },
  {
    id: 'PU-2024-143',
    residentName: 'Sarah Ishimwe',
    location: 'Gasabo → Remera',
    wasteType: 'Organic',
    weight: 14,
    completedAt: '2026-03-27 04:15 PM',
    status: 'completed'
  },
  {
    id: 'PU-2024-144',
    residentName: 'David Habimana',
    location: 'Gasabo → Kacyiru',
    wasteType: 'General',
    weight: 11,
    completedAt: '2026-03-27 02:45 PM',
    status: 'completed'
  },
  {
    id: 'PU-2024-141',
    residentName: 'Josephine Uwera',
    location: 'Gasabo → Remera',
    wasteType: 'Plastic',
    weight: 0,
    completedAt: '2026-03-27 10:30 AM',
    status: 'missed'
  },
];

interface DashboardProps {
  userRole?: string;
}

export function Dashboard({ userRole }: DashboardProps) {
  // Collector-specific state
  const [pickups, setPickups] = useState(mockPickups);
  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [issueNote, setIssueNote] = useState('');
  const [proofPhoto, setProofPhoto] = useState<File | null>(null);
  const [collectionNote, setCollectionNote] = useState('');

  // If user is a collector, show the collector dashboard
  if (userRole === 'collector') {
    const todaysDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const totalPickups = pickups.length;
    const completedCount = pickups.filter(p => p.status === 'completed').length;
    const remainingPickups = totalPickups - completedCount;
    const progressPercentage = (completedCount / totalPickups) * 100;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'in-progress':
          return 'bg-blue-100 text-blue-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'missed':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'completed':
          return CheckCircle2;
        case 'in-progress':
          return Clock;
        case 'pending':
          return Flag;
        case 'missed':
          return XCircle;
        default:
          return Clock;
      }
    };

    const handleStartPickup = (pickup: any) => {
      setSelectedPickup(pickup);
      setPickupDialogOpen(true);
    };

    const handleReportIssue = () => {
      setPickupDialogOpen(false);
      setIssueDialogOpen(true);
    };

    return (
      <div className="space-y-4 max-w-6xl mx-auto pb-20">
        {/* Top Section - Daily Summary */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm">{todaysDate}</p>
              <h2 className="font-bold text-2xl mt-1">Jean Baptiste</h2>
              <div className="flex items-center gap-2 mt-2 text-green-100">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Gasabo → Remera</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{completedCount}/{totalPickups}</div>
              <p className="text-green-100 text-sm mt-1">Pickups Completed</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Daily Progress</span>
              <span className="font-semibold">{remainingPickups} remaining</span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-green-500" />
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Today's Tasks
            </TabsTrigger>
            <TabsTrigger value="route" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Route Map
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Today's Tasks Tab */}
          <TabsContent value="tasks" className="space-y-3">
            {pickups.map((pickup) => {
              const StatusIcon = getStatusIcon(pickup.status);
              return (
                <Card 
                  key={pickup.id} 
                  className={`border-l-4 ${
                    pickup.status === 'completed' ? 'border-l-green-500' :
                    pickup.status === 'in-progress' ? 'border-l-blue-500' :
                    pickup.status === 'missed' ? 'border-l-red-500' :
                    'border-l-yellow-500'
                  } hover:shadow-md transition-shadow`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{pickup.residentName}</h3>
                          <Badge className={getStatusColor(pickup.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {pickup.status}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{pickup.location}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-600" />
                              <Badge variant="outline">{pickup.wasteType}</Badge>
                            </div>
                            <div className="text-gray-600">
                              Est. {pickup.estimatedWeight} kg
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Scheduled: {pickup.scheduledTime}</span>
                          </div>
                        </div>

                        {pickup.notes !== 'N/A' && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2 text-sm text-blue-800">
                            <strong>Note:</strong> {pickup.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {pickup.status === 'pending' && (
                          <Button 
                            className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                            onClick={() => handleStartPickup(pickup)}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start Pickup
                          </Button>
                        )}
                        {pickup.status === 'in-progress' && (
                          <>
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                              onClick={() => handleStartPickup(pickup)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                            <Button 
                              variant="outline"
                              className="whitespace-nowrap"
                              onClick={handleReportIssue}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Report Issue
                            </Button>
                          </>
                        )}
                        {pickup.status === 'completed' && (
                          <Button variant="outline" className="whitespace-nowrap" disabled>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Completed
                          </Button>
                        )}
                        {pickup.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Route Map Tab */}
          <TabsContent value="route">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Route</CardTitle>
                    <CardDescription>Optimized pickup sequence</CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Route Navigation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Route className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="font-medium">Interactive Route Map</p>
                    <p className="text-sm mt-1">Map showing pickup locations and optimized route path</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold">Route Stops</h4>
                  {pickups.filter(p => p.status !== 'completed').map((pickup, index) => (
                    <div key={pickup.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="bg-green-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{pickup.residentName}</p>
                        <p className="text-sm text-gray-600">{pickup.location}</p>
                      </div>
                      <Badge variant="outline">{pickup.scheduledTime}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Pickups</CardTitle>
                <CardDescription>Your collection history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedPickups.map((pickup) => (
                    <div key={pickup.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{pickup.residentName}</h4>
                            <Badge className={getStatusColor(pickup.status)}>
                              {pickup.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{pickup.location}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                <span>{pickup.wasteType}</span>
                              </div>
                              {pickup.weight > 0 && (
                                <span>{pickup.weight} kg</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>{pickup.completedAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pickup Detail Dialog */}
        <Dialog open={pickupDialogOpen} onOpenChange={setPickupDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pickup Details</DialogTitle>
              <DialogDescription>{selectedPickup?.id}</DialogDescription>
            </DialogHeader>
            {selectedPickup && (
              <div className="space-y-6 py-4">
                {/* Pickup Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-gray-600">Resident Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Resident Name</Label>
                      <p className="font-medium">{selectedPickup.residentName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Phone Number</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedPickup.phone}</p>
                        <Button size="sm" variant="outline" className="h-7">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600">Full Address</Label>
                      <p className="font-medium">{selectedPickup.fullAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <h4 className="font-semibold text-sm uppercase text-gray-600">Collection Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Waste Type</Label>
                      <Badge variant="outline" className="mt-1">{selectedPickup.wasteType}</Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Estimated Weight</Label>
                      <p className="font-medium">{selectedPickup.estimatedWeight} kg</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Preferred Time</Label>
                      <p className="font-medium">{selectedPickup.preferredTime}</p>
                    </div>
                  </div>
                  {selectedPickup.notes !== 'N/A' && (
                    <div>
                      <Label className="text-xs text-gray-600">Notes from Resident</Label>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-1 text-sm">
                        {selectedPickup.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-3 border-t">
                  <h4 className="font-semibold text-sm uppercase text-gray-600">Actions</h4>
                  
                  {selectedPickup.status === 'pending' && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                      <Clock className="h-4 w-4 mr-2" />
                      Mark as In Progress
                    </Button>
                  )}

                  {selectedPickup.status === 'in-progress' && (
                    <>
                      <div>
                        <Label className="mb-2 block">Upload Proof of Collection *</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Take a photo of collected waste</p>
                          <Button variant="outline" size="sm">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Actual Weight (kg)</Label>
                        <Input type="number" placeholder="Enter actual weight" />
                      </div>

                      <div>
                        <Label className="mb-2 block">Collection Notes (Optional)</Label>
                        <Textarea
                          placeholder="Any additional notes..."
                          rows={3}
                          value={collectionNote}
                          onChange={(e) => setCollectionNote(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1" 
                          size="lg"
                          onClick={handleReportIssue}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Report Issue
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Report Issue Dialog */}
        <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Issue</DialogTitle>
              <DialogDescription>
                {selectedPickup?.id} - {selectedPickup?.residentName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="mb-2 block">Issue Type *</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-available">Resident not available</SelectItem>
                    <SelectItem value="not-ready">Waste not ready</SelectItem>
                    <SelectItem value="access-blocked">Access blocked</SelectItem>
                    <SelectItem value="wrong-type">Wrong waste type</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Description *</Label>
                <Textarea
                  placeholder="Describe the issue..."
                  rows={4}
                  value={issueNote}
                  onChange={(e) => setIssueNote(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block">Upload Photo (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                <strong>Note:</strong> This pickup will be marked for rescheduling. Admin will be notified.
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIssueDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Submit Issue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Floating Quick Actions */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-green-600 hover:bg-green-700"
            title="Scan QR Code"
          >
            <QrCode className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-14 w-14 shadow-lg bg-white"
            title="Contact Admin"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-14 w-14 shadow-lg bg-white"
            title="Notifications"
          >
            <Bell className="h-6 w-6" />
          </Button>
        </div>
      </div>
    );
  }

  // Default resident dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Dashboard</h2>
          <p className="text-gray-600 mt-1">Overview of waste management operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">1,500</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">3,245</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recycling Rate</CardTitle>
            <Recycle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">78%</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +6% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Waste (tons)</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">234</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +15% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection Trends</CardTitle>
            <CardDescription>Monthly collection volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={collectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="collections" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waste Composition</CardTitle>
            <CardDescription>By material type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteComposition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteComposition.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recycling Rate Trend</CardTitle>
            <CardDescription>Monthly recycling percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recyclingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}