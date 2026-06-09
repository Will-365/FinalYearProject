import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Calendar, MapPin, Clock, CheckCircle2, AlertCircle, Truck, Camera, Navigation, HelpCircle, Sparkles, Upload, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AdminCollectionManagement } from '@/app/components/AdminCollectionManagement';
import { toast } from 'sonner';

interface CollectionManagementProps {
  userRole: string;
}

interface CollectionSchedule {
  id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed';
  wasteType: string;
  collector: string;
  requestedDate?: string;
}

interface CollectionRoute {
  id: string;
  name: string;
  stops: number;
  completed: number;
  estimatedTime: string;
}

const mockSchedules: CollectionSchedule[] = [
  { id: '1', date: '2026-01-22', time: '08:00 AM', status: 'scheduled', wasteType: 'General Waste', collector: 'John K.' },
  { id: '2', date: '2026-01-24', time: '09:00 AM', status: 'scheduled', wasteType: 'Recyclables', collector: 'Sarah M.' },
  { id: '3', date: '2026-01-18', time: '08:30 AM', status: 'completed', wasteType: 'General Waste', collector: 'John K.' },
  { id: '4', date: '2026-01-15', time: '08:00 AM', status: 'completed', wasteType: 'Organic Waste', collector: 'Peter N.' },
];

const mockRoutes: CollectionRoute[] = [
  { id: 'r1', name: 'Gasabo Route A', stops: 24, completed: 16, estimatedTime: '2h 30m' },
  { id: 'r2', name: 'Kicukiro Route B', stops: 18, completed: 18, estimatedTime: '1h 45m' },
  { id: 'r3', name: 'Nyarugenge Route C', stops: 30, completed: 8, estimatedTime: '3h 15m' },
];

// Material categories for AI identification
const materialCategories = [
  { name: 'Organic', description: 'Food waste, garden waste, compostable materials', color: 'green', icon: '🌿' },
  { name: 'Recyclables', description: 'Plastic, paper, metal, glass, cardboard', color: 'blue', icon: '♻️' },
  { name: 'General Waste', description: 'Non-recyclable and non-organic waste', color: 'gray', icon: '🗑️' },
];

// Mock bin status data for collectors
const mockBinStatuses = [
  { id: 'bin-001', residentName: 'Marie Uwase', location: 'Gasabo - Remera - Rukiri I', percentFull: 85, lastUpdated: '2 hours ago' },
  { id: 'bin-002', residentName: 'Patrick Nkusi', location: 'Kicukiro - Gatenga - Nyanza', percentFull: 75, lastUpdated: '5 hours ago' },
  { id: 'bin-003', residentName: 'Jean Mutabazi', location: 'Nyarugenge - Nyarugenge - Bibare', percentFull: 90, lastUpdated: '1 hour ago' },
  { id: 'bin-004', residentName: 'Grace Murekatete', location: 'Gasabo - Kacyiru - Kamatamu', percentFull: 60, lastUpdated: '3 hours ago' },
  { id: 'bin-005', residentName: 'Emmanuel Habimana', location: 'Kicukiro - Niboye - Nyarurama', percentFull: 95, lastUpdated: '30 mins ago' },
];

export function CollectionManagement({ userRole }: CollectionManagementProps) {
  // If admin, show admin view
  if (userRole === 'admin') {
    return <AdminCollectionManagement />;
  }

  // Otherwise, show resident or collector view
  const [selectedTab, setSelectedTab] = useState('schedule');
  const [collectionHistory, setCollectionHistory] = useState<CollectionSchedule[]>(mockSchedules);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [aiHelperOpen, setAiHelperOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [identifiedMaterial, setIdentifiedMaterial] = useState<string | null>(null);
  const [binStatusPercent, setBinStatusPercent] = useState(75);
  const [updateBinDialogOpen, setUpdateBinDialogOpen] = useState(false);
  const [newBinStatus, setNewBinStatus] = useState('75');
  const [viewBinStatusDialogOpen, setViewBinStatusDialogOpen] = useState(false);
  const [confirmCollectionDialogOpen, setConfirmCollectionDialogOpen] = useState(false);
  const [collectionPhoto, setCollectionPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [completeCollectionDialogOpen, setCompleteCollectionDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [inProgressCollections, setInProgressCollections] = useState([
    { id: 'COL-001', residentName: 'Marie Uwase', location: 'Gasabo - Remera - Rukiri I', wasteType: 'Organic', estimatedWeight: 15, status: 'in-progress' },
    { id: 'COL-002', residentName: 'Jean Mutabazi', location: 'Gasabo - Remera - Rukiri II', wasteType: 'General', estimatedWeight: 12, status: 'in-progress' },
    { id: 'COL-003', residentName: 'Patrick Nkusi', location: 'Kicukiro - Gatenga - Nyanza', wasteType: 'Plastic', estimatedWeight: 8, status: 'in-progress' },
  ]);

  // Simulated AI analysis
  const analyzeImage = () => {
    setAnalyzingImage(true);
    // Simulate AI processing time
    setTimeout(() => {
      // Randomly select a material category for demo
      const randomMaterial = materialCategories[Math.floor(Math.random() * materialCategories.length)];
      setIdentifiedMaterial(randomMaterial.name);
      setSelectedMaterial(randomMaterial.name);
      setAnalyzingImage(false);
    }, 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setIdentifiedMaterial(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitRequest = () => {
    if (!selectedMaterial || !preferredDate) {
      toast.error('Please select a material type and preferred date');
      return;
    }

    // Create new collection request
    const newRequest: CollectionSchedule = {
      id: `req-${Date.now()}`,
      date: preferredDate,
      time: '10:00 AM',
      status: 'scheduled',
      wasteType: selectedMaterial,
      collector: 'Pending Assignment',
      requestedDate: new Date().toISOString(),
    };

    // Add to history
    setCollectionHistory([newRequest, ...collectionHistory]);

    // TODO: In a real implementation, this would also:
    // 1. Send notification to admin dashboard
    // 2. Update backend database
    // 3. Trigger route optimization

    // Reset form and close dialog
    setSelectedMaterial('');
    setPreferredDate('');
    setAdditionalNotes('');
    setUploadedImage(null);
    setIdentifiedMaterial(null);
    setRequestDialogOpen(false);

    // Show success message
    toast.success('Collection request submitted successfully! You can track it in the History tab.');
  };

  const resetAiHelper = () => {
    setUploadedImage(null);
    setIdentifiedMaterial(null);
    setAnalyzingImage(false);
  };

  const handleUpdateBinStatus = () => {
    const newValue = parseInt(newBinStatus);
    if (newValue >= 0 && newValue <= 100) {
      setBinStatusPercent(newValue);
      setUpdateBinDialogOpen(false);
      toast.success(`Bin status updated to ${newValue}% full`);
    } else {
      toast.error('Please enter a value between 0 and 100');
    }
  };

  const handlePhotoUploadForCollection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCollectionPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmCollection = () => {
    if (!collectionPhoto) {
      toast.error('Please upload a photo verification');
      return;
    }
    toast.success('Collection confirmed successfully!');
    setConfirmCollectionDialogOpen(false);
    setCollectionPhoto(null);
    setPhotoPreview(null);
  };

  const handleCompleteCollection = (collection: any) => {
    if (!collection) return;

    // Remove from in-progress list
    setInProgressCollections(prev => prev.filter(c => c.id !== collection.id));

    toast.success(`Collection ${collection.id} marked as completed!`);
    setCompleteCollectionDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'missed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'in-progress':
        return <Truck className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Waste Collection Management</h2>
          <p className="text-gray-600 mt-1">Manage schedules, routes, and collection activities</p>
        </div>
        {userRole === 'collector' ? (
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setCompleteCollectionDialogOpen(true)}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Complete a Collection
          </Button>
        ) : (
          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Calendar className="h-4 w-4 mr-2" />
                Request Collection
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Special Collection</DialogTitle>
              <DialogDescription>
                Submit a request for additional waste collection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Material Type *</Label>
                  <Dialog open={aiHelperOpen} onOpenChange={setAiHelperOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-1 text-green-600 hover:text-green-700">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Confused about the material?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-green-600" />
                          AI Material Identifier
                        </DialogTitle>
                        <DialogDescription>
                          Let our AI system help you identify your waste material category
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 py-4">
                        {/* Upload Section */}
                        {!uploadedImage ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                            <div className="text-center">
                              <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                              <h3 className="font-semibold text-lg mb-2">Upload a Photo of Your Waste</h3>
                              <p className="text-sm text-gray-600 mb-4">
                                Take a clear photo of the waste item you want to identify
                              </p>
                              <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Choose Photo
                              </Button>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Image Preview */}
                            <div className="relative">
                              <img
                                src={uploadedImage}
                                alt="Uploaded waste"
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={resetAiHelper}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Analysis Section */}
                            {!identifiedMaterial && !analyzingImage && (
                              <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={analyzeImage}
                              >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Analyze Material with AI
                              </Button>
                            )}

                            {/* Loading State */}
                            {analyzingImage && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <div className="flex items-center justify-center gap-3">
                                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                                  <div>
                                    <p className="font-medium text-blue-900">Analyzing your image...</p>
                                    <p className="text-sm text-blue-700">Our AI is identifying the material type</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Result */}
                            {identifiedMaterial && !analyzingImage && (
                              <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                  <div className="flex items-start gap-4">
                                    <div className="bg-green-600 p-3 rounded-lg">
                                      <CheckCircle2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-bold text-lg text-green-900 mb-1">Material Identified!</h3>
                                      <p className="text-green-700 mb-3">Our AI has analyzed your image</p>
                                      <div className="bg-white rounded-lg p-4 border border-green-200">
                                        <div className="flex items-center gap-3 mb-2">
                                          <span className="text-3xl">
                                            {materialCategories.find(m => m.name === identifiedMaterial)?.icon}
                                          </span>
                                          <div>
                                            <p className="font-bold text-xl text-gray-900">{identifiedMaterial}</p>
                                            <p className="text-sm text-gray-600">
                                              {materialCategories.find(m => m.name === identifiedMaterial)?.description}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-3">
                                  <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={resetAiHelper}
                                  >
                                    Try Another Image
                                  </Button>
                                  <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                      setAiHelperOpen(false);
                                    }}
                                  >
                                    Use This Category
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Material Categories Reference */}
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3">Material Categories Reference</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {materialCategories.map((category) => (
                              <div key={category.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <span className="text-xl">{category.icon}</span>
                                <div>
                                  <p className="font-medium text-sm">{category.name}</p>
                                  <p className="text-xs text-gray-600">{category.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material type" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialCategories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {identifiedMaterial && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Sparkles className="h-4 w-4" />
                    <span>AI suggested: {identifiedMaterial}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Preferred Date *</Label>
                <Input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Any special instructions (e.g., location, quantity, special handling)..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleSubmitRequest}
              >
                Submit Collection Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Collection</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">Jan 22, 2026</div>
            <p className="text-gray-600 text-sm">08:00 AM - General Waste</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bin Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {userRole === 'resident' ? (
              <>
                <div className="font-bold text-2xl">{binStatusPercent}% Full</div>
                <p className="text-gray-600 text-sm">Collection due in 2 days</p>
                <Button
                  size="sm"
                  className="mt-3 w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setNewBinStatus(binStatusPercent.toString());
                    setUpdateBinDialogOpen(true);
                  }}
                >
                  Update Status
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setViewBinStatusDialogOpen(true)}
                >
                  View Bin Status
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">8 Collections</div>
            <p className="text-gray-600 text-sm">100% completion rate</p>
            {userRole === 'resident' && (
              <Button
                size="sm"
                className="mt-3 w-full bg-green-600 hover:bg-green-700"
                onClick={() => setConfirmCollectionDialogOpen(true)}
              >
                Confirm Collection
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Collections</CardTitle>
              <CardDescription>Your scheduled waste collection dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSchedules.filter(s => s.status === 'scheduled').map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(schedule.status)}
                      <div>
                        <div className="font-medium">{schedule.wasteType}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          {schedule.date}
                          <Clock className="h-3 w-3 ml-2" />
                          {schedule.time}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Truck className="h-3 w-3" />
                          Collector: {schedule.collector}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(schedule.status)}
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        Track
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection History</CardTitle>
              <CardDescription>Past collection records and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collectionHistory.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(schedule.status)}
                      <div>
                        <div className="font-medium">{schedule.wasteType}</div>
                        <div className="text-sm text-gray-600">
                          {schedule.date} at {schedule.time}
                        </div>
                        <div className="text-sm text-gray-600">
                          Collector: {schedule.collector}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(schedule.status)}
                      {schedule.status === 'completed' && (
                        <Button variant="link" size="sm" className="h-auto p-0">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Bin Status Dialog (Resident) */}
      <Dialog open={updateBinDialogOpen} onOpenChange={setUpdateBinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Bin Status</DialogTitle>
            <DialogDescription>
              Update the fill level of your waste bin (0-100%)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bin-status">Bin Fill Level (%)</Label>
              <Input
                id="bin-status"
                type="number"
                min="0"
                max="100"
                value={newBinStatus}
                onChange={(e) => setNewBinStatus(e.target.value)}
                placeholder="Enter percentage (0-100)"
              />
              <p className="text-xs text-gray-500">
                Current status: {binStatusPercent}% full
              </p>
            </div>
            <div className="space-y-2">
              <Label>Visual Guide</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">0-40%: Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">41-75%: Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">76-100%: High - Collection Needed</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setUpdateBinDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleUpdateBinStatus}
              >
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Collection Dialog (Resident) */}
      <Dialog open={confirmCollectionDialogOpen} onOpenChange={setConfirmCollectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Collection</DialogTitle>
            <DialogDescription>
              Upload photo verification for completed collection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Collection Photo *</Label>
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Collection preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setCollectionPhoto(null);
                      setPhotoPreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-3">Upload a photo of the collected waste</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('collection-photo-upload')?.click()}
                    type="button"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    id="collection-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUploadForCollection}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">
                Photo helps verify successful collection and maintain service quality
              </p>
            </div>

            <div className="space-y-2">
              <Label>Collection Notes (Optional)</Label>
              <Textarea
                placeholder="Any additional notes about this collection..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setConfirmCollectionDialogOpen(false);
                  setCollectionPhoto(null);
                  setPhotoPreview(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleConfirmCollection}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Collection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Bin Status Dialog (Collector) */}
      <Dialog open={viewBinStatusDialogOpen} onOpenChange={setViewBinStatusDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resident Bin Status</DialogTitle>
            <DialogDescription>
              View updated bin statuses from residents in your route
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Bin ID</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Resident Name</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Location</th>
                    <th className="text-center py-3 px-4 font-medium text-sm">Fill Level</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Last Updated</th>
                    <th className="text-center py-3 px-4 font-medium text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBinStatuses.map((bin) => (
                    <tr key={bin.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{bin.id}</td>
                      <td className="py-3 px-4 text-sm">{bin.residentName}</td>
                      <td className="py-3 px-4 text-sm">{bin.location}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex-1 max-w-[100px]">
                            <Progress
                              value={bin.percentFull}
                              className={`h-2 ${
                                bin.percentFull >= 76 ? '[&>div]:bg-red-500' :
                                bin.percentFull >= 41 ? '[&>div]:bg-yellow-500' :
                                '[&>div]:bg-green-500'
                              }`}
                            />
                          </div>
                          <Badge className={
                            bin.percentFull >= 76 ? 'bg-red-100 text-red-800' :
                            bin.percentFull >= 41 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {bin.percentFull}%
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{bin.lastUpdated}</td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            toast.success(`Collection scheduled for ${bin.residentName} at ${bin.location}`);
                            setViewBinStatusDialogOpen(false);
                          }}
                        >
                          Schedule Collection
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Collection Dialog (Collector) */}
      <Dialog open={completeCollectionDialogOpen} onOpenChange={setCompleteCollectionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete a Collection</DialogTitle>
            <DialogDescription>
              Select a collection in progress to mark as completed
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {inProgressCollections.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No collections in progress</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inProgressCollections.map((collection) => (
                  <Card key={collection.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{collection.residentName}</h3>
                            <Badge className="bg-blue-100 text-blue-800">
                              <Truck className="h-3 w-3 mr-1" />
                              In Progress
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{collection.location}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-600" />
                                <Badge variant="outline">{collection.wasteType}</Badge>
                              </div>
                              <div className="text-gray-600">
                                Est. {collection.estimatedWeight} kg
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleCompleteCollection(collection)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Complete Collection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}