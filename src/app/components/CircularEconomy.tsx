import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { 
  TrendingUp, 
  Package, 
  Leaf, 
  Droplet, 
  Zap, 
  Link2, 
  ShoppingBag, 
  Users,
  Award,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';

interface MaterialFlow {
  material: string;
  collected: number;
  processed: number;
  reused: number;
  unit: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalMaterial: string;
  seller: string;
  certified: boolean;
  inStock: boolean;
  image: string;
}

interface Partner {
  id: string;
  name: string;
  type: 'supplier' | 'processor' | 'manufacturer' | 'retailer';
  materials: string[];
  certified: boolean;
  rating: number;
}

interface LifecycleStage {
  stage: string;
  status: 'completed' | 'in-progress' | 'pending';
  date?: string;
  location?: string;
}

const materialFlows: MaterialFlow[] = [
  { material: 'Plastic', collected: 4500, processed: 4200, reused: 3800, unit: 'kg' },
  { material: 'Paper', collected: 3200, processed: 3100, reused: 2900, unit: 'kg' },
  { material: 'Metal', collected: 1800, processed: 1750, reused: 1680, unit: 'kg' },
  { material: 'Glass', collected: 2100, processed: 2050, reused: 1950, unit: 'kg' },
  { material: 'Organic', collected: 5600, processed: 5400, reused: 5200, unit: 'kg' },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Recycled Plastic Chairs',
    description: 'Durable outdoor chairs made from 100% recycled plastic bottles',
    price: 45000,
    originalMaterial: 'Plastic Bottles',
    seller: 'EcoFurniture Rwanda',
    certified: true,
    inStock: true,
    image: '🪑',
  },
  {
    id: '2',
    name: 'Upcycled Paper Notebooks',
    description: 'Handcrafted notebooks from recycled paper with beautiful designs',
    price: 3500,
    originalMaterial: 'Waste Paper',
    seller: 'Green Stationery Co.',
    certified: true,
    inStock: true,
    image: '📓',
  },
  {
    id: '3',
    name: 'Compost Fertilizer',
    description: 'Organic compost made from processed food waste',
    price: 8000,
    originalMaterial: 'Organic Waste',
    seller: 'Green Care Processing',
    certified: true,
    inStock: true,
    image: '🌱',
  },
  {
    id: '4',
    name: 'Recycled Glass Tiles',
    description: 'Beautiful decorative tiles from recycled glass bottles',
    price: 25000,
    originalMaterial: 'Glass Bottles',
    seller: 'Rwanda Glass Works',
    certified: true,
    inStock: false,
    image: '◻️',
  },
];

const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'EcoFurniture Rwanda',
    type: 'manufacturer',
    materials: ['Plastic', 'Metal'],
    certified: true,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Green Care Processing Center',
    type: 'processor',
    materials: ['Plastic', 'Paper', 'Glass', 'Organic'],
    certified: true,
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Rwanda Recycling Hub',
    type: 'supplier',
    materials: ['All Materials'],
    certified: true,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Kigali Eco Store',
    type: 'retailer',
    materials: ['Upcycled Products'],
    certified: true,
    rating: 4.6,
  },
];

const productLifecycle: LifecycleStage[] = [
  {
    stage: 'Collection',
    status: 'completed',
    date: '2026-01-10',
    location: 'Gasabo District',
  },
  {
    stage: 'Sorting & Cleaning',
    status: 'completed',
    date: '2026-01-12',
    location: 'Green Care Facility',
  },
  {
    stage: 'Processing',
    status: 'completed',
    date: '2026-01-15',
    location: 'Processing Center',
  },
  {
    stage: 'Manufacturing',
    status: 'in-progress',
    date: '2026-01-18',
    location: 'EcoFurniture Rwanda',
  },
  {
    stage: 'Distribution',
    status: 'pending',
  },
];

export function CircularEconomy() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const calculateCircularity = (material: MaterialFlow) => {
    return Math.round((material.reused / material.collected) * 100);
  };

  const getPartnerTypeBadge = (type: string) => {
    const variants = {
      supplier: 'bg-blue-100 text-blue-800',
      processor: 'bg-purple-100 text-purple-800',
      manufacturer: 'bg-green-100 text-green-800',
      retailer: 'bg-orange-100 text-orange-800',
    };
    return <Badge className={variants[type as keyof typeof variants]}>{type}</Badge>;
  };

  const getStageStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <div className="h-5 w-5 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Circular Economy Tracking</h2>
          <p className="text-gray-600 mt-1">Track material flows and circular economy impact</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Package className="h-4 w-4 mr-2" />
          Track New Material
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">2,450 kg</div>
            <p className="text-gray-600 text-sm">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Water Conserved</CardTitle>
            <Droplet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">18,500 L</div>
            <p className="text-gray-600 text-sm">Through recycling</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Energy Saved</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">3,200 kWh</div>
            <p className="text-gray-600 text-sm">Equivalent saved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Circularity Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">87%</div>
            <p className="text-gray-600 text-sm">Materials reused</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="lifecycle">
            <Package className="h-4 w-4 mr-2" />
            Product Lifecycle
          </TabsTrigger>
          <TabsTrigger value="partners">
            <Link2 className="h-4 w-4 mr-2" />
            Partners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Material Flow Visualization</CardTitle>
              <CardDescription>Track materials through the circular economy process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {materialFlows.map((flow) => (
                  <div key={flow.material}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{flow.material}</div>
                      <Badge className="bg-green-100 text-green-800">
                        {calculateCircularity(flow)}% Circular
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Collected</div>
                        <div className="font-bold">{flow.collected} {flow.unit}</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Processed</div>
                        <div className="font-bold">{flow.processed} {flow.unit}</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Reused</div>
                        <div className="font-bold">{flow.reused} {flow.unit}</div>
                      </div>
                    </div>
                    <Progress value={calculateCircularity(flow)} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>Your contribution to sustainability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="font-medium">Carbon Offset</div>
                        <div className="text-sm text-gray-600">2,450 kg CO₂</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Droplet className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-medium">Water Saved</div>
                        <div className="text-sm text-gray-600">18,500 liters</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="h-8 w-8 text-yellow-600" />
                      <div>
                        <div className="font-medium">Energy Conserved</div>
                        <div className="text-sm text-gray-600">3,200 kWh</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Circularity Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Material Recovery Rate</span>
                      <span className="text-gray-600">93%</span>
                    </div>
                    <Progress value={93} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Waste-to-Product Conversion</span>
                      <span className="text-gray-600">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Landfill Diversion</span>
                      <span className="text-gray-600">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Product Quality Score</span>
                      <span className="text-gray-600">91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Circular Economy Marketplace</CardTitle>
                  <CardDescription>Buy and sell upcycled and recycled products</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="text-6xl">{product.image}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-lg">{product.name}</div>
                            <div className="text-sm text-gray-600">by {product.seller}</div>
                          </div>
                          {product.certified && (
                            <Badge className="bg-green-100 text-green-800">
                              <Award className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            From: {product.originalMaterial}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg text-green-600">
                            {product.price.toLocaleString()} RWF
                          </div>
                          <div className="flex gap-2">
                            {product.inStock ? (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Buy Now
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                Out of Stock
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>List Your Products</CardTitle>
              <CardDescription>Sell your upcycled or recycled products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="font-medium mb-2">Start Selling</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Join our circular economy marketplace and sell your sustainable products
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  List a Product
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Lifecycle Tracker</CardTitle>
              <CardDescription>Follow materials from waste to new products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label>Track Material Flow</Label>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Enter tracking ID (e.g., PL-2026-00123)" />
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {productLifecycle.map((stage, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {getStageStatus(stage.status)}
                      {index < productLifecycle.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-200 my-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{stage.stage}</div>
                        {stage.status === 'completed' && (
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        )}
                        {stage.status === 'in-progress' && (
                          <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                        )}
                        {stage.status === 'pending' && (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                      {stage.date && (
                        <div className="text-sm text-gray-600">
                          {stage.date} {stage.location && `• ${stage.location}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Transformation</CardTitle>
              <CardDescription>See how waste becomes valuable products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-4xl mb-3">♻️</div>
                  <div className="font-medium mb-2">Waste Input</div>
                  <div className="text-2xl font-bold text-gray-700 mb-1">500 kg</div>
                  <div className="text-sm text-gray-600">Plastic bottles</div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-center p-6 border rounded-lg bg-green-50">
                  <div className="text-4xl mb-3">🪑</div>
                  <div className="font-medium mb-2">Product Output</div>
                  <div className="text-2xl font-bold text-green-600 mb-1">150 units</div>
                  <div className="text-sm text-gray-600">Plastic chairs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partnership Network</CardTitle>
              <CardDescription>Connect with circular economy partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPartners.map((partner) => (
                  <div key={partner.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-medium text-lg">{partner.name}</div>
                          {partner.certified && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        {getPartnerTypeBadge(partner.type)}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-medium">{partner.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                        <div className="text-xs text-gray-600">Rating</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {partner.materials.map((material, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50">
                          {material}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Users className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <Link2 className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Become a Partner</CardTitle>
              <CardDescription>Join our circular economy network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input placeholder="Enter your organization name" />
                </div>
                <div className="space-y-2">
                  <Label>Partner Type</Label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Supplier</option>
                    <option>Processor</option>
                    <option>Manufacturer</option>
                    <option>Retailer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Materials/Products</Label>
                  <Input placeholder="What materials do you work with?" />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
