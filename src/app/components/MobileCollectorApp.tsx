import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { 
  Smartphone, 
  QrCode, 
  Camera, 
  MapPin, 
  Navigation,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  Upload,
  Download,
  Bell,
  Package,
  Truck,
  User,
  Calendar,
  AlertCircle,
  DollarSign,
  Star,
  Gift,
  TrendingUp,
  BarChart3,
  Map
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Switch } from '@/app/components/ui/switch';

const collectionRoutes = [
  { id: 1, route: 'Route A - Kigali Central', stops: 24, completed: 18, status: 'in-progress', distance: '12.5 km', estimatedTime: '45 min' },
  { id: 2, route: 'Route B - Gasabo District', stops: 32, completed: 0, status: 'pending', distance: '18.2 km', estimatedTime: '60 min' },
  { id: 3, route: 'Route C - Nyarugenge', stops: 20, completed: 20, status: 'completed', distance: '10.8 km', estimatedTime: '40 min' },
];

const collectionStops = [
  { id: 1, binId: 'BIN-001234', location: 'KG 5 Ave, House #42', resident: 'Jean Mutabazi', wasteType: 'Mixed', weight: '12 kg', status: 'pending', priority: 'high' },
  { id: 2, binId: 'BIN-001235', location: 'KG 7 Ave, House #18', resident: 'Marie Uwase', wasteType: 'Organic', weight: '8 kg', status: 'pending', priority: 'normal' },
  { id: 3, binId: 'BIN-001236', location: 'KG 8 Ave, House #25', resident: 'Patrick Nkusi', wasteType: 'Recyclable', weight: '5 kg', status: 'collected', priority: 'normal' },
  { id: 4, binId: 'BIN-001237', location: 'KG 9 Ave, Apt #12', resident: 'Grace Murekatete', wasteType: 'Mixed', weight: '10 kg', status: 'collected', priority: 'high' },
];

const residentRequests = [
  { id: 1, resident: 'John Doe', location: 'KG 15 Ave, House #88', wasteType: 'Bulk', requestDate: '2026-01-20', status: 'pending', priority: 'high', notes: 'Large furniture items' },
  { id: 2, resident: 'Sarah Mugabo', location: 'KG 12 Ave, Apt #5B', wasteType: 'Electronic', requestDate: '2026-01-20', status: 'pending', priority: 'normal', notes: 'Old TV and computer' },
  { id: 3, resident: 'Emmanuel Habimana', location: 'KG 20 Ave, House #33', wasteType: 'Garden', requestDate: '2026-01-19', status: 'scheduled', priority: 'normal', notes: 'Tree branches' },
];

const notifications = [
  { id: 1, type: 'route', title: 'New Route Assigned', message: 'Route B - Gasabo District assigned for today', time: '8:30 AM', read: false },
  { id: 2, type: 'alert', title: 'Traffic Alert', message: 'Heavy traffic on KG 10 Ave - Consider alternate route', time: '9:15 AM', read: false },
  { id: 3, type: 'request', title: 'Special Collection Request', message: 'Bulk waste pickup at KG 15 Ave, House #88', time: '10:00 AM', read: true },
  { id: 4, type: 'system', title: 'Daily Sync Complete', message: 'All offline data uploaded successfully', time: '7:45 AM', read: true },
];

const walletData = {
  balance: 2450,
  pendingRewards: 350,
  thisMonth: 1800,
  lastMonth: 2100,
  transactions: [
    { id: 1, type: 'earned', amount: 150, description: 'Route completion bonus', date: '2026-01-20' },
    { id: 2, type: 'earned', amount: 200, description: 'Early completion bonus', date: '2026-01-19' },
    { id: 3, type: 'redeemed', amount: -100, description: 'Fuel voucher', date: '2026-01-18' },
    { id: 4, type: 'earned', amount: 180, description: 'Perfect collection score', date: '2026-01-17' },
  ]
};

export function MobileCollectorApp() {
  const [isOffline, setIsOffline] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [scannedBin, setScannedBin] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'collected':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  };

  const handleScanBin = () => {
    // Simulate scanning
    setTimeout(() => {
      setScannedBin('BIN-001234');
      setScanDialogOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Mobile Collector App</h2>
          <p className="text-gray-600 mt-1">Field operations and mobile management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={!isOffline} onCheckedChange={(checked) => setIsOffline(!checked)} />
            <div className="flex items-center gap-1">
              {isOffline ? (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Online</span>
                </>
              )}
            </div>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile View
          </Button>
        </div>
      </div>

      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="font-medium text-yellow-900">Offline Mode Active</p>
            <p className="text-sm text-yellow-800">Data will sync automatically when connection is restored</p>
          </div>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Routes</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">2</div>
            <p className="text-xs text-gray-600 mt-1">1 in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">18/24</div>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{walletData.balance} pts</div>
            <p className="text-xs text-gray-600 mt-1">+{walletData.pendingRewards} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{notifications.filter(n => !n.read).length}</div>
            <p className="text-xs text-gray-600 mt-1">unread messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <QrCode className="h-6 w-6 text-green-600" />
                  <span>Scan Bin</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Scan QR/Barcode</DialogTitle>
                  <DialogDescription>Position the QR code or barcode within the frame</DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Camera scanner would appear here</p>
                      <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={handleScanBin}>
                        Simulate Scan
                      </Button>
                    </div>
                  </div>
                  {scannedBin && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900">Scanned: {scannedBin}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <Camera className="h-6 w-6 text-blue-600" />
                  <span>Take Photo</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Photo Verification</DialogTitle>
                  <DialogDescription>Take a photo to verify collection</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-[250px]">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">Camera view would appear here</p>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="h-24 flex-col gap-2">
              <Navigation className="h-6 w-6 text-purple-600" />
              <span>Navigate</span>
            </Button>

            <Button variant="outline" className="h-24 flex-col gap-2">
              <Upload className="h-6 w-6 text-orange-600" />
              <span>Sync Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
        </TabsList>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Routes</CardTitle>
                  <CardDescription>View and manage assigned collection routes</CardDescription>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Map className="h-4 w-4 mr-2" />
                  View Map
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collectionRoutes.map((route) => (
                  <div key={route.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{route.route}</h4>
                          <Badge className={getStatusColor(route.status)}>{route.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{route.stops} stops</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>{route.completed} completed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation className="h-4 w-4" />
                            <span>{route.distance}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{route.estimatedTime}</span>
                          </div>
                        </div>
                        <Progress value={(route.completed / route.stops) * 100} className="mt-3" />
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700 ml-3">
                        <Navigation className="h-4 w-4 mr-2" />
                        Start Route
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Stops</CardTitle>
              <CardDescription>Scan bins and mark collections as complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collectionStops.map((stop) => (
                  <div key={stop.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{stop.binId}</Badge>
                          <Badge className={getStatusColor(stop.status)}>{stop.status}</Badge>
                          <Badge className={getPriorityColor(stop.priority)}>{stop.priority}</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{stop.resident}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{stop.location}</span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-600">
                            <span>Type: {stop.wasteType}</span>
                            <span>Weight: {stop.weight}</span>
                          </div>
                        </div>
                      </div>
                      {stop.status === 'pending' && (
                        <div className="flex gap-2 ml-3">
                          <Button variant="outline" size="sm">
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Collect
                          </Button>
                        </div>
                      )}
                      {stop.status === 'collected' && (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resident Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Special Collection Requests</CardTitle>
                  <CardDescription>Manage resident-submitted collection requests</CardDescription>
                </div>
                <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Package className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Submit Collection Request</DialogTitle>
                      <DialogDescription>Request a special waste collection from a resident</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="req-resident">Resident Name</Label>
                        <Input id="req-resident" placeholder="Enter resident name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="req-location">Location</Label>
                        <Input id="req-location" placeholder="Enter address" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="req-type">Waste Type</Label>
                        <Select>
                          <SelectTrigger id="req-type">
                            <SelectValue placeholder="Select waste type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bulk">Bulk Waste</SelectItem>
                            <SelectItem value="electronic">Electronic Waste</SelectItem>
                            <SelectItem value="garden">Garden Waste</SelectItem>
                            <SelectItem value="hazardous">Hazardous Waste</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="req-notes">Notes</Label>
                        <Textarea id="req-notes" placeholder="Additional details" rows={3} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setRequestDialogOpen(false)}>
                          Submit Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {residentRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{request.resident}</h4>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                          <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>Type: {request.wasteType}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{request.requestDate}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 mt-1">{request.notes}</p>
                        </div>
                      </div>
                      {request.status === 'pending' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 ml-3">
                          Accept Request
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Wallet Tab */}
        <TabsContent value="wallet" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-3xl">{walletData.balance}</div>
                <p className="text-xs text-gray-600 mt-1">Incentive Points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-3xl">{walletData.thisMonth}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {walletData.thisMonth > walletData.lastMonth ? '+' : '-'}
                  {Math.abs(walletData.thisMonth - walletData.lastMonth)} vs last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
                <Gift className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-3xl">{walletData.pendingRewards}</div>
                <p className="text-xs text-gray-600 mt-1">Processing</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Your recent wallet activity</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {walletData.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'earned' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <Gift className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-lg ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notifications & Alerts</CardTitle>
                  <CardDescription>Stay updated on routes and requests</CardDescription>
                </div>
                <Button variant="outline" size="sm">Mark All as Read</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg transition-colors ${
                      notification.read ? 'bg-white' : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Bell className={`h-5 w-5 mt-0.5 ${
                          notification.read ? 'text-gray-400' : 'text-green-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.read && (
                              <Badge className="bg-green-600 text-white text-xs">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                      {!notification.read && (
                        <Button variant="ghost" size="sm">Dismiss</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
