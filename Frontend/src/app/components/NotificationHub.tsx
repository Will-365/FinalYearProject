import { useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { 
  Send, AlertTriangle, CheckCircle2, 
  Clock, Filter, Search,
  Info, AlertCircle, Gift, Users,
  MapPin, MessageSquare, PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Unified mock data for notifications (combining broadcasts, targeted, alerts, history)
const MOCK_NOTIFICATIONS = [
  {
    id: 'MSG-001',
    title: 'System Maintenance Scheduled',
    audience: 'All Users',
    sentBy: 'Admin - John Doe',
    timestamp: '2026-03-28 14:30',
    status: 'sent',
    type: 'info',
    recipientCount: 33640,
    deliveredCount: 33452,
    failedCount: 188,
    body: 'Platform maintenance scheduled for March 30th from 2-4 AM. Services will be temporarily unavailable.'
  },
  {
    id: 'MSG-002',
    title: 'New Reward Campaign Launch',
    audience: 'All Residents',
    sentBy: 'Admin - Marie Uwase',
    timestamp: '2026-03-27 09:15',
    status: 'sent',
    type: 'reward',
    recipientCount: 28000,
    deliveredCount: 27856,
    failedCount: 144,
    body: 'Earn double points on all collections this week! Limited time offer.'
  },
  {
    id: 'MSG-003',
    title: 'Emergency Collection Schedule Change',
    audience: 'Gasabo District',
    sentBy: 'Admin - Patrick Nkusi',
    timestamp: '2026-03-26 16:45',
    status: 'sent',
    type: 'urgent',
    recipientCount: 12500,
    deliveredCount: 12400,
    failedCount: 100,
    body: 'Due to road closures, all Gasabo collections are moved to Thursday. Please adjust schedules accordingly.'
  },
  {
    id: 'ALT-089',
    title: 'System Alert: Missed Pickups',
    audience: 'Admin Team',
    sentBy: 'System',
    timestamp: '2026-03-28 15:45',
    status: 'alert',
    type: 'warning',
    recipientCount: 5,
    deliveredCount: 5,
    failedCount: 0,
    body: '12 missed pickups in last 24 hours in Gasabo → Remera. Suggested Action: Reassign collectors.'
  },
  {
    id: 'ALT-090',
    title: 'Collector Inactivity',
    audience: 'Admin Team',
    sentBy: 'System',
    timestamp: '2026-03-28 14:20',
    status: 'alert',
    type: 'warning',
    recipientCount: 5,
    deliveredCount: 5,
    failedCount: 0,
    body: 'Collector David Mukasa offline for 3 hours in Kicukiro. Contact collector or assign backup.'
  },
  {
    id: 'MSG-004',
    title: 'Collector Performance Bonus',
    audience: 'Selected Collectors (2)',
    sentBy: 'Admin - Grace Habimana',
    timestamp: '2026-03-28 10:00',
    status: 'sent',
    type: 'reward',
    recipientCount: 2,
    deliveredCount: 2,
    failedCount: 0,
    body: 'Congratulations on maintaining a 100% pickup rate this week! A bonus of RWF 10,000 has been credited.'
  },
  {
    id: 'MSG-005',
    title: 'Pending Payment Reminder',
    audience: 'Selected Residents (15)',
    sentBy: 'Admin - Financial Dept',
    timestamp: '2026-03-27 15:30',
    status: 'sent',
    type: 'urgent',
    recipientCount: 15,
    deliveredCount: 14,
    failedCount: 1,
    body: 'This is a gentle reminder that your monthly waste collection fee is due in 3 days.'
  },
  {
    id: 'MSG-006',
    title: 'Weekly Recycling Tips',
    audience: 'All Residents',
    sentBy: 'Admin - Grace Habimana',
    timestamp: '2026-03-25 08:00',
    status: 'sent',
    type: 'info',
    recipientCount: 28000,
    deliveredCount: 27425,
    failedCount: 575,
    body: 'This week\'s tip: Rinse plastic containers before recycling to improve processing quality.'
  }
];

export function NotificationHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, sent, alerts
  
  // Right pane state: either 'view' (showing a message) or 'compose'
  const [activePane, setActivePane] = useState('none'); 
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);

  // Compose State
  const [composeData, setComposeData] = useState({
    title: '',
    body: '',
    type: 'info',
    audienceType: 'all',
    selectedZone: '',
    deliveryInApp: true,
    deliverySMS: false,
    deliveryEmail: false
  });
  const [sending, setSending] = useState(false);

  const filteredMessages = MOCK_NOTIFICATIONS.filter(msg => {
    const matchesSearch = msg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          msg.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'sent') matchesFilter = msg.status === 'sent';
    if (filter === 'alerts') matchesFilter = msg.status === 'alert';

    return matchesSearch && matchesFilter;
  });

  const selectedMsg = MOCK_NOTIFICATIONS.find(m => m.id === selectedMsgId);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'reward': return <Gift className="h-5 w-5 text-purple-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'reward': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Message sent successfully!');
      setSending(false);
      setActivePane('none');
      setComposeData({
        title: '', body: '', type: 'info', audienceType: 'all', selectedZone: '',
        deliveryInApp: true, deliverySMS: false, deliveryEmail: false
      });
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      
      {/* Left Pane - Message List */}
      <div className="w-[400px] border-r border-gray-200 flex flex-col bg-gray-50/50 shrink-0">
        
        {/* Sidebar Header */}
        <div className="h-[72px] px-4 flex items-center justify-between border-b border-gray-200 bg-white">
          <h2 className="font-bold text-xl text-gray-800">Messages</h2>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-10 w-10 rounded-full bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
            onClick={() => { setActivePane('compose'); setSelectedMsgId(null); }}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="p-3 bg-white border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search or start a new message" 
              className="pl-9 bg-gray-100 border-transparent focus:bg-white rounded-xl h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 px-1">
            <Badge 
              variant="outline" 
              className={`cursor-pointer rounded-full px-3 py-1 ${filter === 'all' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'}`}
              onClick={() => setFilter('all')}
            >
              All
            </Badge>
            <Badge 
              variant="outline" 
              className={`cursor-pointer rounded-full px-3 py-1 ${filter === 'sent' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'}`}
              onClick={() => setFilter('sent')}
            >
              Sent
            </Badge>
            <Badge 
              variant="outline" 
              className={`cursor-pointer rounded-full px-3 py-1 ${filter === 'alerts' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'}`}
              onClick={() => setFilter('alerts')}
            >
              System Alerts
            </Badge>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <MessageSquare className="h-8 w-8 opacity-50" />
              <p className="text-sm">No messages found</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div 
                key={msg.id}
                onClick={() => { setActivePane('view'); setSelectedMsgId(msg.id); }}
                className={`p-3 flex items-start gap-3 cursor-pointer border-b border-gray-100 transition-colors
                  ${selectedMsgId === msg.id && activePane === 'view' ? 'bg-green-50/60' : 'hover:bg-gray-100/50 bg-white'}`}
              >
                {/* Avatar / Icon */}
                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 border
                  ${msg.status === 'alert' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}
                >
                  {getTypeIcon(msg.type)}
                </div>

                {/* Content Snippet */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-[15px] text-gray-900 truncate pr-2">
                      {msg.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                      {msg.timestamp.split(' ')[0]} {/* Just show date for snippet */}
                    </span>
                  </div>
                  <p className="text-[13.5px] text-gray-500 truncate mb-1.5">
                    {msg.body}
                  </p>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-500 font-normal">
                      {msg.audience}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Content Area */}
      <div className="flex-1 flex flex-col bg-[#F0F2F5] relative">
        
        {/* EMPTY STATE */}
        {activePane === 'none' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
            <div className="w-64 h-64 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <MessageSquare className="h-24 w-24 text-green-200" />
            </div>
            <h2 className="text-2xl font-light text-gray-700 mb-3">GreenCare Communication Hub</h2>
            <p className="text-gray-500 max-w-md leading-relaxed">
              Select a message from the sidebar to view details, or click the plus icon to broadcast a new notification to residents and collectors.
            </p>
          </div>
        )}

        {/* VIEW MESSAGE STATE */}
        {activePane === 'view' && selectedMsg && (
          <>
            {/* Header */}
            <div className="h-[72px] px-6 flex items-center border-b border-gray-200 bg-white shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  {getTypeIcon(selectedMsg.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedMsg.title}</h3>
                  <p className="text-xs text-gray-500">Sent by {selectedMsg.sentBy} • {selectedMsg.timestamp}</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Badge className={getTypeColor(selectedMsg.type)}>{selectedMsg.type.toUpperCase()}</Badge>
              </div>
            </div>

            {/* Chat Body Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-gray-50/50">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Date Bubble */}
                <div className="flex justify-center">
                  <span className="bg-white text-gray-500 text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    {selectedMsg.timestamp.split(' ')[0]}
                  </span>
                </div>

                {/* Message Bubble */}
                <div className="bg-white p-5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 ml-4 max-w-[85%] relative">
                  <div className="absolute top-0 -left-3 w-3 h-4 bg-white clip-path-triangle"></div>
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">{selectedMsg.title}</h4>
                  <p className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-wrap">
                    {selectedMsg.body}
                  </p>
                  <div className="mt-4 flex items-center justify-end gap-1 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    <span>{selectedMsg.timestamp.split(' ')[1]}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 ml-1" />
                  </div>
                </div>

                {/* Delivery Stats Card */}
                {selectedMsg.status === 'sent' && (
                  <Card className="ml-4 max-w-[85%] bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <Users className="h-4 w-4 text-gray-400" />
                        Delivery Report
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-center">
                          <div className="text-2xl font-bold text-blue-700">{selectedMsg.recipientCount.toLocaleString()}</div>
                          <div className="text-xs text-blue-600/70 font-medium mt-1">Targeted</div>
                        </div>
                        <div className="bg-green-50/50 p-3 rounded-xl border border-green-100 text-center">
                          <div className="text-2xl font-bold text-green-700">{selectedMsg.deliveredCount.toLocaleString()}</div>
                          <div className="text-xs text-green-600/70 font-medium mt-1">Delivered</div>
                        </div>
                        <div className="bg-red-50/50 p-3 rounded-xl border border-red-100 text-center">
                          <div className="text-2xl font-bold text-red-700">{selectedMsg.failedCount.toLocaleString()}</div>
                          <div className="text-xs text-red-600/70 font-medium mt-1">Failed</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                        <span className="text-gray-500">Audience: <strong>{selectedMsg.audience}</strong></span>
                        <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">View Recipients</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}

        {/* COMPOSE MESSAGE STATE */}
        {activePane === 'compose' && (
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="h-[72px] px-6 flex items-center border-b border-gray-200 bg-white shrink-0">
              <h3 className="font-bold text-lg text-gray-900">Compose New Message</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto space-y-8">
                
                {/* 1. Message Content */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">1</div>
                    <h4 className="font-semibold text-gray-800">Message Content</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block text-gray-600">Message Title</Label>
                      <Input 
                        required
                        className="h-12 text-lg font-medium rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                        placeholder="E.g. Collection Schedule Update"
                        value={composeData.title}
                        onChange={e => setComposeData({...composeData, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-2 block text-gray-600">Message Type</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {['info', 'warning', 'urgent', 'reward'].map(type => (
                          <div 
                            key={type}
                            onClick={() => setComposeData({...composeData, type})}
                            className={`p-3 rounded-xl border cursor-pointer flex flex-col items-center justify-center gap-2 transition-all
                              ${composeData.type === type ? 'border-green-500 bg-green-50 text-green-800 shadow-sm ring-1 ring-green-500' : 'border-gray-200 hover:border-green-200 hover:bg-gray-50 text-gray-500'}`}
                          >
                            {getTypeIcon(type)}
                            <span className="text-xs font-medium capitalize">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Target Audience */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">2</div>
                    <h4 className="font-semibold text-gray-800">Target Audience</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-600">Recipient Group</Label>
                      <Select value={composeData.audienceType} onValueChange={v => setComposeData({...composeData, audienceType: v})}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users (33,640)</SelectItem>
                          <SelectItem value="residents">Residents Only (28,000)</SelectItem>
                          <SelectItem value="collectors">Collectors Only (46)</SelectItem>
                          <SelectItem value="zone">Specific Zone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {composeData.audienceType === 'zone' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-gray-600">Select Zone</Label>
                        <Select value={composeData.selectedZone} onValueChange={v => setComposeData({...composeData, selectedZone: v})}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Choose a zone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gasabo">Gasabo District</SelectItem>
                            <SelectItem value="kicukiro">Kicukiro District</SelectItem>
                            <SelectItem value="nyarugenge">Nyarugenge District</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Delivery Channels */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">3</div>
                    <h4 className="font-semibold text-gray-800">Delivery Channels</h4>
                  </div>
                  
                  <div className="flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <Checkbox 
                        checked={composeData.deliveryInApp} 
                        onCheckedChange={c => setComposeData({...composeData, deliveryInApp: !!c})}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">In-App Push</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <Checkbox 
                        checked={composeData.deliverySMS} 
                        onCheckedChange={c => setComposeData({...composeData, deliverySMS: !!c})}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">SMS Text (Requires Credits)</span>
                    </label>
                  </div>
                </div>

              </form>
            </div>
            
            {/* Compose Message Input Footer (WhatsApp Style) */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 shrink-0">
              <div className="max-w-4xl mx-auto flex gap-3 items-end">
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <Textarea
                    required
                    placeholder="Type your message here..."
                    className="min-h-[60px] max-h-[200px] border-0 focus-visible:ring-0 resize-none py-3 px-4 text-[15px]"
                    value={composeData.body}
                    onChange={e => setComposeData({...composeData, body: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={sending || !composeData.title || !composeData.body}
                  className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 shadow-md shrink-0 p-0 flex items-center justify-center transition-transform active:scale-95"
                >
                  <Send className="h-5 w-5 ml-1 text-white" />
                </Button>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}