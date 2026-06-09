import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Filter, 
  Search,
  Calendar,
  User,
  Activity,
  XCircle,
  AlertCircle,
  Bell,
  Upload,
  Award,
  FileCheck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';

const complianceChecklist = [
  { id: 1, category: 'Environmental', item: 'Waste Disposal Permits', status: 'compliant', dueDate: '2026-12-31', progress: 100 },
  { id: 2, category: 'Environmental', item: 'Emission Standards Compliance', status: 'compliant', dueDate: '2026-06-30', progress: 100 },
  { id: 3, category: 'Safety', item: 'Worker Safety Training', status: 'pending', dueDate: '2026-02-28', progress: 75 },
  { id: 4, category: 'Safety', item: 'Equipment Safety Inspections', status: 'compliant', dueDate: '2026-03-15', progress: 100 },
  { id: 5, category: 'Data Protection', item: 'GDPR Compliance Review', status: 'at-risk', dueDate: '2026-01-31', progress: 45 },
  { id: 6, category: 'Regulatory', item: 'Annual Audit Report', status: 'pending', dueDate: '2026-02-15', progress: 60 },
  { id: 7, category: 'Regulatory', item: 'License Renewal - Collection', status: 'compliant', dueDate: '2026-11-30', progress: 100 },
  { id: 8, category: 'Quality', item: 'ISO 14001 Certification', status: 'compliant', dueDate: '2026-09-20', progress: 100 },
];

const auditTrail = [
  { id: 1, timestamp: '2026-01-20 14:32', user: 'Admin User', action: 'Updated compliance status', category: 'Safety', details: 'Marked Worker Safety Training as pending' },
  { id: 2, timestamp: '2026-01-20 13:15', user: 'John Collector', action: 'Uploaded document', category: 'Regulatory', details: 'Submitted vehicle inspection certificate' },
  { id: 3, timestamp: '2026-01-20 11:20', user: 'System', action: 'Alert triggered', category: 'Data Protection', details: 'GDPR compliance review deadline approaching' },
  { id: 4, timestamp: '2026-01-20 09:45', user: 'Admin User', action: 'Incident reported', category: 'Safety', details: 'Minor equipment malfunction reported' },
  { id: 5, timestamp: '2026-01-19 16:30', user: 'Sarah Admin', action: 'Document approved', category: 'Environmental', details: 'Waste disposal permit renewed' },
  { id: 6, timestamp: '2026-01-19 14:20', user: 'Mike Partner', action: 'Accessed audit logs', category: 'System', details: 'Viewed compliance dashboard' },
  { id: 7, timestamp: '2026-01-19 10:15', user: 'System', action: 'Automated check', category: 'Quality', details: 'ISO certification status verified' },
  { id: 8, timestamp: '2026-01-19 08:00', user: 'Admin User', action: 'Generated report', category: 'Regulatory', details: 'Monthly compliance report created' },
];

const documents = [
  { id: 1, name: 'Waste Disposal Permit 2026', type: 'Permit', category: 'Environmental', uploadDate: '2025-12-15', expiryDate: '2026-12-31', status: 'active' },
  { id: 2, name: 'Vehicle Fleet Insurance', type: 'Insurance', category: 'Safety', uploadDate: '2025-11-20', expiryDate: '2026-11-20', status: 'active' },
  { id: 3, name: 'ISO 14001 Certificate', type: 'Certificate', category: 'Quality', uploadDate: '2025-09-20', expiryDate: '2026-09-20', status: 'active' },
  { id: 4, name: 'Data Protection Policy', type: 'Policy', category: 'Data Protection', uploadDate: '2025-01-10', expiryDate: '2026-01-10', status: 'expiring-soon' },
  { id: 5, name: 'Safety Training Records 2025', type: 'Record', category: 'Safety', uploadDate: '2025-12-01', expiryDate: null, status: 'active' },
  { id: 6, name: 'Annual Compliance Report 2025', type: 'Report', category: 'Regulatory', uploadDate: '2025-12-30', expiryDate: null, status: 'active' },
];

const incidents = [
  { id: 1, title: 'Minor Equipment Malfunction', severity: 'low', status: 'resolved', reportedBy: 'John Collector', date: '2026-01-20', description: 'Hydraulic lift issue on truck #4' },
  { id: 2, title: 'Delayed Collection Route', severity: 'medium', status: 'investigating', reportedBy: 'Sarah Admin', date: '2026-01-18', description: 'Route 7 delayed due to traffic incident' },
  { id: 3, title: 'Data Access Anomaly', severity: 'high', status: 'resolved', reportedBy: 'System', date: '2026-01-15', description: 'Unusual login attempts detected and blocked' },
  { id: 4, title: 'Spillage at Collection Point', severity: 'medium', status: 'resolved', reportedBy: 'Mike Collector', date: '2026-01-12', description: 'Minor waste spillage cleaned up immediately' },
];

const certificates = [
  { id: 1, name: 'ISO 14001 Environmental Management', issuer: 'ISO', issueDate: '2025-09-20', expiryDate: '2026-09-20', status: 'active' },
  { id: 2, name: 'Waste Management License', issuer: 'Rwanda Environment Authority', issueDate: '2025-01-15', expiryDate: '2027-01-15', status: 'active' },
  { id: 3, name: 'Fleet Safety Certification', issuer: 'Rwanda Transport Authority', issueDate: '2025-06-10', expiryDate: '2026-06-10', status: 'active' },
  { id: 4, name: 'Occupational Safety Certificate', issuer: 'Rwanda Labor Board', issueDate: '2025-03-20', expiryDate: '2026-03-20', status: 'active' },
];

export function AuditCompliance() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newIncidentOpen, setNewIncidentOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'active':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'at-risk':
      case 'expiring-soon':
        return 'bg-orange-100 text-orange-800';
      case 'non-compliant':
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredChecklist = complianceChecklist.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch = item.item.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const complianceScore = Math.round(
    (complianceChecklist.filter(item => item.status === 'compliant').length / complianceChecklist.length) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Audit & Compliance</h2>
          <p className="text-gray-600 mt-1">Monitor compliance status and manage regulatory requirements</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export Compliance Report
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{complianceScore}%</div>
            <Progress value={complianceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Certificates</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{certificates.filter(c => c.status === 'active').length}</div>
            <p className="text-xs text-gray-600 mt-1">of {certificates.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{incidents.filter(i => i.status === 'investigating').length}</div>
            <p className="text-xs text-gray-600 mt-1">requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{complianceChecklist.filter(c => c.status === 'pending' || c.status === 'at-risk').length}</div>
            <p className="text-xs text-gray-600 mt-1">needs action</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Compliance Checklist Tab */}
        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Checklist</CardTitle>
                  <CardDescription>Track and manage compliance requirements</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search checklist items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Data Protection">Data Protection</SelectItem>
                    <SelectItem value="Regulatory">Regulatory</SelectItem>
                    <SelectItem value="Quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredChecklist.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{item.item}</h4>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {item.dueDate}
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Progress:</span>
                            <Progress value={item.progress} className="w-24" />
                            <span>{item.progress}%</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileCheck className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Trail</CardTitle>
                  <CardDescription>Complete log of system activities and changes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {auditTrail.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-green-600 pl-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{entry.action}</span>
                            <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{entry.details}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {entry.user}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {entry.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document Repository</CardTitle>
                  <CardDescription>Manage regulatory documents and compliance files</CardDescription>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <Badge variant="outline">{doc.type}</Badge>
                            <Badge variant="outline">{doc.category}</Badge>
                            <span>Uploaded: {doc.uploadDate}</span>
                            {doc.expiryDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Expires: {doc.expiryDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Incident Management</CardTitle>
                  <CardDescription>Track and resolve compliance incidents</CardDescription>
                </div>
                <Dialog open={newIncidentOpen} onOpenChange={setNewIncidentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Report Incident
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Report New Incident</DialogTitle>
                      <DialogDescription>
                        Provide details about the compliance incident
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="incident-title">Incident Title</Label>
                        <Input id="incident-title" placeholder="Brief description" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident-severity">Severity</Label>
                        <Select>
                          <SelectTrigger id="incident-severity">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident-description">Description</Label>
                        <Textarea id="incident-description" placeholder="Detailed incident description" rows={4} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setNewIncidentOpen(false)}>Cancel</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setNewIncidentOpen(false)}>
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(incident.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{incident.title}</h4>
                            <Badge variant="outline" className="capitalize">{incident.severity}</Badge>
                            <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {incident.reportedBy}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {incident.date}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificates & Licenses</CardTitle>
              <CardDescription>Track certification status and renewal dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <Award className="h-8 w-8 text-green-600" />
                      <Badge className={getStatusColor(cert.status)}>{cert.status}</Badge>
                    </div>
                    <h4 className="font-medium mb-2">{cert.name}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Issuer: {cert.issuer}</p>
                      <p>Issued: {cert.issueDate}</p>
                      <p>Expires: {cert.expiryDate}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alerts & Notifications</CardTitle>
              <CardDescription>Stay informed about compliance deadlines and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">Urgent: GDPR Compliance Review</h4>
                    <p className="text-sm text-red-800 mt-1">Due in 11 days - Currently at 45% completion</p>
                  </div>
                  <Button size="sm" variant="outline">Action</Button>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-900">Warning: Document Expiring Soon</h4>
                    <p className="text-sm text-orange-800 mt-1">Data Protection Policy expires on Jan 10, 2026</p>
                  </div>
                  <Button size="sm" variant="outline">Renew</Button>
                </div>

                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900">Reminder: Worker Safety Training</h4>
                    <p className="text-sm text-yellow-800 mt-1">Scheduled completion: Feb 28, 2026 - 75% complete</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">Success: License Renewed</h4>
                    <p className="text-sm text-green-800 mt-1">Collection license successfully renewed until Nov 30, 2026</p>
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
