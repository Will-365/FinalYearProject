import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Checkbox } from '@/app/components/ui/checkbox';
import { 
  Send, Bell, Users, MapPin, AlertTriangle, CheckCircle2, 
  Clock, Eye, Filter, Calendar, Download, MessageSquare,
  Info, AlertCircle, Zap, Gift, Search, ChevronRight,
  TrendingUp, User, XCircle, Radio
} from 'lucide-react';

// Mock data for broadcast messages
const mockBroadcastMessages = [
  {
    id: 'BRD-001',
    title: 'System Maintenance Scheduled',
    audience: 'All Users',
    sentBy: 'Admin - John Doe',
    dateSent: '2026-03-28 14:30',
    status: 'sent',
    type: 'info',
    recipientCount: 33640,
    deliveredCount: 33452,
    failedCount: 188,
    body: 'Platform maintenance scheduled for March 30th from 2-4 AM. Services will be temporarily unavailable.'
  },
  {
    id: 'BRD-002',
    title: 'New Reward Campaign Launch',
    audience: 'All Residents',
    sentBy: 'Admin - Marie Uwase',
    dateSent: '2026-03-27 09:15',
    status: 'sent',
    type: 'reward',
    recipientCount: 28000,
    deliveredCount: 27856,
    failedCount: 144,
    body: 'Earn double points on all collections this week! Limited time offer.'
  },
  {
    id: 'BRD-003',
    title: 'Emergency Collection Schedule Change',
    audience: 'All Users',
    sentBy: 'Admin - Patrick Nkusi',
    dateSent: '2026-03-26 16:45',
    status: 'sent',
    type: 'urgent',
    recipientCount: 33640,
    deliveredCount: 32890,
    failedCount: 750,
    body: 'Due to public holiday, all collections moved to next day. Please adjust schedules accordingly.'
  },
  {
    id: 'BRD-004',
    title: 'Weekly Recycling Tips',
    audience: 'All Residents',
    sentBy: 'Admin - Grace Habimana',
    dateSent: '2026-03-25 08:00',
    status: 'sent',
    type: 'info',
    recipientCount: 28000,
    deliveredCount: 27425,
    failedCount: 575,
    body: 'This week\'s tip: Rinse plastic containers before recycling to improve processing quality.'
  },
];

// Mock data for targeted messages
const mockTargetedMessages = [
  {
    id: 'TGT-045',
    title: 'Collection Route Update',
    targetType: 'Zone',
    targetDetails: 'Gasabo → Remera → Rukiri I',
    dateSent: '2026-03-28 11:20',
    status: 'sent',
    recipientCount: 1200,
    deliveredCount: 1187,
    failedCount: 13
  },
  {
    id: 'TGT-046',
    title: 'Collector Performance Bonus',
    targetType: 'Collector',
    targetDetails: 'Jean Baptiste, Emmanuel Habimana',
    dateSent: '2026-03-28 10:00',
    status: 'sent',
    recipientCount: 2,
    deliveredCount: 2,
    failedCount: 0
  },
  {
    id: 'TGT-047',
    title: 'Pending Payment Reminder',
    targetType: 'User',
    targetDetails: '15 specific residents',
    dateSent: '2026-03-27 15:30',
    status: 'sent',
    recipientCount: 15,
    deliveredCount: 14,
    failedCount: 1
  },
  {
    id: 'TGT-048',
    title: 'Zone Coverage Expansion',
    targetType: 'Zone',
    targetDetails: 'Kicukiro → Gatenga',
    dateSent: '2026-03-27 09:00',
    status: 'sent',
    recipientCount: 2800,
    deliveredCount: 2756,
    failedCount: 44
  },
];

// Mock data for notification history
const mockNotificationHistory = [
  {
    id: 'NOTIF-1234',
    title: 'Collection Reminder - Tomorrow 8AM',
    recipientCount: 1250,
    deliveredCount: 1238,
    failedCount: 12,
    timestamp: '2026-03-28 18:00',
    type: 'info',
    audienceType: 'Zone'
  },
  {
    id: 'NOTIF-1235',
    title: 'Urgent: Missed Pickup Alert',
    recipientCount: 45,
    deliveredCount: 45,
    failedCount: 0,
    timestamp: '2026-03-28 16:30',
    type: 'urgent',
    audienceType: 'User'
  },
  {
    id: 'NOTIF-1236',
    title: 'Points Credited - 250pts',
    recipientCount: 890,
    deliveredCount: 875,
    failedCount: 15,
    timestamp: '2026-03-28 14:15',
    type: 'reward',
    audienceType: 'Residents'
  },
  {
    id: 'NOTIF-1237',
    title: 'Route Optimization Update',
    recipientCount: 18,
    deliveredCount: 18,
    failedCount: 0,
    timestamp: '2026-03-28 12:00',
    type: 'info',
    audienceType: 'Collectors'
  },
];

// Mock data for system alerts
const mockSystemAlerts = [
  {
    id: 'ALT-089',
    type: 'Missed Pickups',
    zone: 'Gasabo → Remera → Rukiri II',
    severity: 'high',
    details: '12 missed pickups in last 24 hours',
    suggestedAction: 'Reassign collectors or add backup route',
    timestamp: '2026-03-28 15:45'
  },
  {
    id: 'ALT-090',
    type: 'Collector Inactivity',
    zone: 'Kicukiro → Gatenga',
    severity: 'medium',
    details: 'Collector David Mukasa offline for 3 hours',
    suggestedAction: 'Contact collector or assign backup',
    timestamp: '2026-03-28 14:20'
  },
  {
    id: 'ALT-091',
    type: 'Processing Delay',
    zone: 'Recycling Center - Main',
    severity: 'medium',
    details: 'Compost batch COMP-2024-012 exceeds expected completion date',
    suggestedAction: 'Review processing conditions and timeline',
    timestamp: '2026-03-28 10:15'
  },
  {
    id: 'ALT-092',
    type: 'High Request Volume',
    zone: 'Nyarugenge',
    severity: 'low',
    details: '45 new collection requests in 2 hours',
    suggestedAction: 'Monitor zone capacity and adjust schedules',
    timestamp: '2026-03-28 09:30'
  },
  {
    id: 'ALT-093',
    type: 'Low Inventory Warning',
    zone: 'Compost Production',
    severity: 'high',
    details: 'Compost inventory below 500kg threshold (330kg available)',
    suggestedAction: 'Accelerate production or adjust sales targets',
    timestamp: '2026-03-27 16:00'
  },
];

// Collector notifications
const collectorNotifications = [
  {
    id: 'NOTIF-C-001',
    type: 'assignment',
    title: 'New Pickup Assigned',
    message: 'You have 2 new pickups assigned for tomorrow in Remera sector',
    timestamp: '10 minutes ago',
    read: false
  },
  {
    id: 'NOTIF-C-002',
    type: 'route',
    title: 'Route Update',
    message: 'Your collection route has been optimized. Please check the updated sequence.',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: 'NOTIF-C-003',
    type: 'payment',
    title: 'Payment Processed',
    message: 'Your weekly payment of RWF 45,000 has been processed successfully',
    timestamp: '2 hours ago',
    read: true
  },
  {
    id: 'NOTIF-C-004',
    type: 'bonus',
    title: 'Performance Bonus Earned!',
    message: 'Congratulations! You earned a RWF 10,000 bonus for perfect on-time completion',
    timestamp: '1 day ago',
    read: false
  },
  {
    id: 'NOTIF-C-005',
    type: 'schedule',
    title: 'Schedule Change',
    message: 'Tomorrow\'s start time has been moved to 7:30 AM instead of 8:00 AM',
    timestamp: '1 day ago',
    read: true
  },
  {
    id: 'NOTIF-C-006',
    type: 'admin',
    title: 'Message from Admin',
    message: 'Team meeting scheduled for Friday at 9:00 AM at the main office',
    timestamp: '2 days ago',
    read: true
  },
];

interface NotificationHubProps {
  userRole?: string;
}

export function NotificationHub({ userRole }: NotificationHubProps) {
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [audienceType, setAudienceType] = useState('all');
  const [selectedZone, setSelectedZone] = useState('');
  const [deliveryInApp, setDeliveryInApp] = useState(true);
  const [deliverySMS, setDeliverySMS] = useState(false);
  const [deliveryEmail, setDeliveryEmail] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'reward':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'reward':
        return Gift;
      default:
        return Info;
    }
  };

  const filteredHistory = mockNotificationHistory.filter(notif => {
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesAudience = filterAudience === 'all' || notif.audienceType.toLowerCase().includes(filterAudience.toLowerCase());
    return matchesType && matchesAudience;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl">Notifications & System Communication Center</h2>
        <p className="text-gray-600 text-sm mt-1">Send announcements, manage alerts, and track notification delivery</p>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="send">
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </TabsTrigger>
          <TabsTrigger value="broadcast">
            <Radio className="h-4 w-4 mr-2" />
            Broadcast
          </TabsTrigger>
          <TabsTrigger value="targeted">
            <MapPin className="h-4 w-4 mr-2" />
            Targeted
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            System Alerts
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Send Notification */}
        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Message Form */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase text-gray-600">Message Content</h4>
                
                <div>
                  <Label className="mb-2 block">Message Title *</Label>
                  <Input
                    placeholder="Enter notification title"
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Message Body *</Label>
                  <Textarea
                    placeholder="Enter your message here..."
                    rows={5}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">{messageBody.length} / 500 characters</p>
                </div>

                <div>
                  <Label className="mb-2 block">Message Type</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span>Info</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="warning">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span>Warning</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span>Urgent</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="reward">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-purple-600" />
                          <span>Reward Notification</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Audience Selection */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-sm uppercase text-gray-600">Audience Selection</h4>
                
                <div>
                  <Label className="mb-2 block">Target Audience *</Label>
                  <Select value={audienceType} onValueChange={setAudienceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users (33,640)</SelectItem>
                      <SelectItem value="residents">Residents Only (28,000)</SelectItem>
                      <SelectItem value="collectors">Collectors Only (46)</SelectItem>
                      <SelectItem value="zone">Specific Zone</SelectItem>
                      <SelectItem value="users">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {audienceType === 'zone' && (
                  <div>
                    <Label className="mb-2 block">Select Zone</Label>
                    <Select value={selectedZone} onValueChange={setSelectedZone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasabo">Gasabo District</SelectItem>
                        <SelectItem value="gasabo-remera">Gasabo → Remera</SelectItem>
                        <SelectItem value="gasabo-remera-rukiri1">Gasabo → Remera → Rukiri I</SelectItem>
                        <SelectItem value="kicukiro">Kicukiro District</SelectItem>
                        <SelectItem value="kicukiro-gatenga">Kicukiro → Gatenga</SelectItem>
                        <SelectItem value="nyarugenge">Nyarugenge District</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {audienceType === 'users' && (
                  <div>
                    <Label className="mb-2 block">Search Users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search by name or phone number..." className="pl-9" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">0 users selected</p>
                  </div>
                )}
              </div>

              {/* Delivery Options */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-sm uppercase text-gray-600">Delivery Options</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="in-app"
                      checked={deliveryInApp}
                      onCheckedChange={(checked) => setDeliveryInApp(checked as boolean)}
                    />
                    <label htmlFor="in-app" className="text-sm font-medium cursor-pointer">
                      In-App Notification (Push to dashboard)
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="sms"
                      checked={deliverySMS}
                      onCheckedChange={(checked) => setDeliverySMS(checked as boolean)}
                    />
                    <label htmlFor="sms" className="text-sm font-medium cursor-pointer">
                      SMS (Text Message) - Additional cost applies
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="email"
                      checked={deliveryEmail}
                      onCheckedChange={(checked) => setDeliveryEmail(checked as boolean)}
                    />
                    <label htmlFor="email" className="text-sm font-medium cursor-pointer">
                      Email (Optional)
                    </label>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-sm uppercase text-gray-600">Scheduling</h4>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label className="mb-2 block">Schedule Date (Optional)</Label>
                    <Input type="date" />
                  </div>
                  <div className="flex-1">
                    <Label className="mb-2 block">Schedule Time</Label>
                    <Input type="time" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Leave blank to send immediately</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Message Preview</DialogTitle>
                      <DialogDescription>Review your notification before sending</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTypeColor(messageType)}>{messageType}</Badge>
                        </div>
                        <h4 className="font-bold mb-2">{messageTitle || 'Untitled Message'}</h4>
                        <p className="text-sm text-gray-700">{messageBody || 'No message content'}</p>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Audience:</strong> {audienceType === 'all' ? 'All Users (33,640)' : audienceType}</p>
                        <p><strong>Delivery:</strong> {[deliveryInApp && 'In-App', deliverySMS && 'SMS', deliveryEmail && 'Email'].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Broadcast Messages */}
        <TabsContent value="broadcast" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Broadcast Messages</h3>
              <p className="text-sm text-gray-600">System-wide announcements sent to all users</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {mockBroadcastMessages.length} Total Broadcasts
            </Badge>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Message Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Target Audience</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Sent By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date Sent</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockBroadcastMessages.map((msg) => {
                  const Icon = getTypeIcon(msg.type);
                  return (
                    <tr key={msg.id} className="border-b hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="py-3 px-4 font-medium">{msg.title}</td>
                      <td className="py-3 px-4 text-gray-600">{msg.audience}</td>
                      <td className="py-3 px-4 text-gray-600">{msg.sentBy}</td>
                      <td className="py-3 px-4 text-gray-600">{msg.dateSent}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getTypeColor(msg.type)}>
                          <Icon className="h-3 w-3 mr-1 inline" />
                          {msg.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(msg.status)}>{msg.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => setSelectedMessage(msg)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{msg.title}</DialogTitle>
                              <DialogDescription>Broadcast Message Details</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm">{msg.body}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs text-gray-600">Message ID</Label>
                                  <p className="font-medium">{msg.id}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-600">Type</Label>
                                  <Badge className={getTypeColor(msg.type)}>{msg.type}</Badge>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-600">Sent By</Label>
                                  <p className="font-medium">{msg.sentBy}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-600">Date Sent</Label>
                                  <p className="font-medium">{msg.dateSent}</p>
                                </div>
                              </div>
                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Delivery Statistics</h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center p-3 bg-blue-50 rounded">
                                    <div className="font-bold text-2xl text-blue-700">{msg.recipientCount.toLocaleString()}</div>
                                    <div className="text-xs text-gray-600 mt-1">Total Recipients</div>
                                  </div>
                                  <div className="text-center p-3 bg-green-50 rounded">
                                    <div className="font-bold text-2xl text-green-700">{msg.deliveredCount.toLocaleString()}</div>
                                    <div className="text-xs text-gray-600 mt-1">Delivered</div>
                                  </div>
                                  <div className="text-center p-3 bg-red-50 rounded">
                                    <div className="font-bold text-2xl text-red-700">{msg.failedCount}</div>
                                    <div className="text-xs text-gray-600 mt-1">Failed</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 3: Targeted Messaging */}
        <TabsContent value="targeted" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Targeted Messages</h3>
              <p className="text-sm text-gray-600">Messages sent to specific zones, users, or collectors</p>
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              {mockTargetedMessages.length} Targeted Messages
            </Badge>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Message Title</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Target Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Target Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date Sent</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Recipients</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockTargetedMessages.map((msg) => (
                  <tr key={msg.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium">{msg.title}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline">
                        {msg.targetType === 'Zone' && <MapPin className="h-3 w-3 mr-1 inline" />}
                        {msg.targetType === 'Collector' && <Users className="h-3 w-3 mr-1 inline" />}
                        {msg.targetType === 'User' && <User className="h-3 w-3 mr-1 inline" />}
                        {msg.targetType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{msg.targetDetails}</td>
                    <td className="py-3 px-4 text-gray-600">{msg.dateSent}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-sm">
                        <div className="font-semibold">{msg.recipientCount}</div>
                        <div className="text-xs text-gray-500">
                          {msg.deliveredCount} / {msg.failedCount > 0 && <span className="text-red-600">{msg.failedCount} failed</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusColor(msg.status)}>{msg.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm" className="h-8">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 4: Notification History */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Notification History</h3>
              <p className="text-sm text-gray-600">Complete log of all notifications sent</p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="mb-2 block text-xs">Date From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-xs">Date To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-xs">Message Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="reward">Reward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block text-xs">Audience Type</Label>
                  <Select value={filterAudience} onValueChange={setFilterAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Audiences</SelectItem>
                      <SelectItem value="zone">Zones</SelectItem>
                      <SelectItem value="residents">Residents</SelectItem>
                      <SelectItem value="collectors">Collectors</SelectItem>
                      <SelectItem value="user">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Notification ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Recipients</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Delivered</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Failed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Timestamp</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Audience</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((notif) => {
                  const Icon = getTypeIcon(notif.type);
                  return (
                    <tr key={notif.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-xs">{notif.id}</td>
                      <td className="py-3 px-4 font-medium">{notif.title}</td>
                      <td className="py-3 px-4 text-center font-semibold">{notif.recipientCount}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-green-600 font-semibold">{notif.deliveredCount}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={notif.failedCount > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
                          {notif.failedCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{notif.timestamp}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getTypeColor(notif.type)}>
                          <Icon className="h-3 w-3 mr-1 inline" />
                          {notif.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline">{notif.audienceType}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Showing {filteredHistory.length} of {mockNotificationHistory.length} notifications</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: System Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">System-Generated Alerts</h3>
              <p className="text-sm text-gray-600">Automated alerts requiring attention</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800">
                {mockSystemAlerts.filter(a => a.severity === 'high').length} High Priority
              </Badge>
              <Badge className="bg-orange-100 text-orange-800">
                {mockSystemAlerts.filter(a => a.severity === 'medium').length} Medium
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {mockSystemAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${alert.severity === 'high' ? 'border-l-red-500' : alert.severity === 'medium' ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className={`h-5 w-5 ${alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'}`} />
                        <div>
                          <h4 className="font-semibold">{alert.type}</h4>
                          <p className="text-xs text-gray-600">{alert.id} • {alert.timestamp}</p>
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <div className="ml-8 space-y-2">
                        <div>
                          <Label className="text-xs text-gray-600">Affected Zone</Label>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            {alert.zone}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-600">Details</Label>
                          <p className="text-sm">{alert.details}</p>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <Label className="text-xs text-blue-700 font-semibold">Suggested Action</Label>
                          <p className="text-sm text-blue-800 mt-1">{alert.suggestedAction}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                        <Send className="h-3 w-3 mr-2" />
                        Send Alert Notification
                      </Button>
                      <Button size="sm" variant="outline" className="whitespace-nowrap">
                        <CheckCircle2 className="h-3 w-3 mr-2" />
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}