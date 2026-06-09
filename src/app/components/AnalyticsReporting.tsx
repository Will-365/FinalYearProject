import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Label } from '@/app/components/ui/label';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  Filter, 
  Calendar,
  Leaf,
  Droplet,
  Zap,
  Target,
  MapPin,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const monthlyData = [
  { month: 'Jul', collected: 820, recycled: 650, landfill: 170, cost: 45000 },
  { month: 'Aug', collected: 950, recycled: 720, landfill: 230, cost: 48000 },
  { month: 'Sep', collected: 1100, recycled: 880, landfill: 220, cost: 52000 },
  { month: 'Oct', collected: 1250, recycled: 1000, landfill: 250, cost: 55000 },
  { month: 'Nov', collected: 1180, recycled: 920, landfill: 260, cost: 53000 },
  { month: 'Dec', collected: 1420, recycled: 1100, landfill: 320, cost: 58000 },
  { month: 'Jan', collected: 1500, recycled: 1200, landfill: 300, cost: 60000 },
];

const wasteCompositionData = [
  { name: 'Plastic', value: 35, color: '#3b82f6' },
  { name: 'Paper', value: 25, color: '#f59e0b' },
  { name: 'Organic', value: 20, color: '#10b981' },
  { name: 'Glass', value: 12, color: '#06b6d4' },
  { name: 'Metal', value: 8, color: '#6b7280' },
];

const environmentalImpactData = [
  { month: 'Jul', co2: 1850, water: 12500, energy: 2400 },
  { month: 'Aug', co2: 2100, water: 14200, energy: 2650 },
  { month: 'Sep', co2: 2300, water: 15800, energy: 2900 },
  { month: 'Oct', co2: 2500, water: 17500, energy: 3150 },
  { month: 'Nov', co2: 2350, water: 16800, energy: 3000 },
  { month: 'Dec', co2: 2600, water: 18500, energy: 3400 },
  { month: 'Jan', co2: 2800, water: 19800, energy: 3650 },
];

const districtData = [
  { district: 'Gasabo', collections: 580, recyclingRate: 82, population: 530 },
  { district: 'Kicukiro', collections: 420, recyclingRate: 76, population: 410 },
  { district: 'Nyarugenge', collections: 500, recyclingRate: 79, population: 475 },
];

const performanceMetrics = [
  { metric: 'Collection Efficiency', value: 95, target: 90 },
  { metric: 'Recycling Rate', value: 78, target: 75 },
  { metric: 'Customer Satisfaction', value: 88, target: 85 },
  { metric: 'Route Optimization', value: 85, target: 80 },
  { metric: 'Cost Efficiency', value: 82, target: 85 },
];

const forecastData = [
  { month: 'Feb', actual: null, forecast: 1580, lower: 1450, upper: 1710 },
  { month: 'Mar', actual: null, forecast: 1650, lower: 1520, upper: 1780 },
  { month: 'Apr', actual: null, forecast: 1720, lower: 1590, upper: 1850 },
  { month: 'May', actual: null, forecast: 1800, lower: 1670, upper: 1930 },
  { month: 'Jun', actual: null, forecast: 1880, lower: 1750, upper: 2010 },
];

export function AnalyticsReporting() {
  const [selectedTab, setSelectedTab] = useState('environmental');
  const [dateRange, setDateRange] = useState('last-6-months');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Analytics & Reporting</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="this-year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Reduction</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">2,800 kg</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% vs last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Water Saved</CardTitle>
            <Droplet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">19,800 L</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8% vs last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Energy Saved</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">3,650 kWh</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +10% vs last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Landfill Diversion</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">80%</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <CheckCircle2 className="h-3 w-3" />
              Above target (75%)
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="environmental">
            <Leaf className="h-4 w-4 mr-2" />
            Environmental
          </TabsTrigger>
          <TabsTrigger value="operational">
            <Target className="h-4 w-4 mr-2" />
            Operational
          </TabsTrigger>
          <TabsTrigger value="community">
            <MapPin className="h-4 w-4 mr-2" />
            Community
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp className="h-4 w-4 mr-2" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Filter className="h-4 w-4 mr-2" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="environmental" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Impact Over Time</CardTitle>
              <CardDescription>Track your sustainability metrics month by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={environmentalImpactData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="co2" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="CO₂ Saved (kg)" />
                  <Area type="monotone" dataKey="water" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Water Saved (L)" />
                  <Area type="monotone" dataKey="energy" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Energy Saved (kWh)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Waste Composition Analysis</CardTitle>
                <CardDescription>Breakdown of collected materials</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={wasteCompositionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {wasteCompositionData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {wasteCompositionData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Highlights</CardTitle>
                <CardDescription>Key environmental achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-600 p-2 rounded-full">
                        <Leaf className="h-5 w-5 text-white" />
                      </div>
                      <div className="font-medium">Carbon Footprint</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">2,800 kg CO₂</div>
                    <p className="text-sm text-gray-600">
                      Equivalent to planting 130 trees or taking 2 cars off the road for a month
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-600 p-2 rounded-full">
                        <Droplet className="h-5 w-5 text-white" />
                      </div>
                      <div className="font-medium">Water Conservation</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">19,800 Liters</div>
                    <p className="text-sm text-gray-600">
                      Enough to provide clean water for 100 people for a day
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-yellow-600 p-2 rounded-full">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="font-medium">Energy Savings</div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 mb-1">3,650 kWh</div>
                    <p className="text-sm text-gray-600">
                      Equivalent to powering 15 homes for a month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection & Processing Efficiency</CardTitle>
              <CardDescription>Monthly operational performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="collected" fill="#3b82f6" name="Collected (kg)" />
                  <Bar yAxisId="left" dataKey="recycled" fill="#10b981" name="Recycled (kg)" />
                  <Bar yAxisId="right" dataKey="cost" fill="#f59e0b" name="Cost (RWF)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance vs Targets</CardTitle>
                <CardDescription>How we're tracking against goals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceMetrics}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Actual" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Radar name="Target" dataKey="target" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Current month performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric) => {
                    const status = metric.value >= metric.target;
                    return (
                      <div key={metric.metric}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{metric.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{metric.value}%</span>
                            {status ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${status ? 'bg-green-600' : 'bg-yellow-600'}`}
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">Target: {metric.target}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>Operational cost breakdown and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Average Cost per kg</div>
                  <div className="text-2xl font-bold">40 RWF</div>
                  <div className="text-sm text-green-600 mt-1">↓ 5% from last month</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Monthly Cost</div>
                  <div className="text-2xl font-bold">60,000 RWF</div>
                  <div className="text-sm text-gray-600 mt-1">Within budget</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Cost Efficiency</div>
                  <div className="text-2xl font-bold">82%</div>
                  <div className="text-sm text-green-600 mt-1">Above target (80%)</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} name="Cost (RWF)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>District Performance Comparison</CardTitle>
              <CardDescription>Collection and recycling rates by district</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={districtData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="district" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="collections" fill="#3b82f6" name="Collections" />
                  <Bar yAxisId="right" dataKey="recyclingRate" fill="#10b981" name="Recycling Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {districtData.map((district) => (
              <Card key={district.district}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {district.district}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Total Collections</div>
                      <div className="text-2xl font-bold">{district.collections}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Recycling Rate</div>
                      <div className="text-2xl font-bold text-green-600">{district.recyclingRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Population (thousands)</div>
                      <div className="text-2xl font-bold">{district.population}K</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Participation Rate</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(district.collections / district.population) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Community Participation Heatmap</CardTitle>
              <CardDescription>Engagement levels across different areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {Array.from({ length: 49 }, (_, i) => {
                  const intensity = Math.floor(Math.random() * 4);
                  const colors = ['bg-green-100', 'bg-green-200', 'bg-green-400', 'bg-green-600'];
                  return (
                    <div
                      key={i}
                      className={`h-10 rounded ${colors[intensity]} cursor-pointer hover:opacity-80 transition-opacity`}
                      title={`Area ${i + 1}: ${intensity * 25}% participation`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Less Active</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-green-100 rounded" />
                  <div className="w-4 h-4 bg-green-200 rounded" />
                  <div className="w-4 h-4 bg-green-400 rounded" />
                  <div className="w-4 h-4 bg-green-600 rounded" />
                </div>
                <span>More Active</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Waste Generation Forecast</CardTitle>
              <CardDescription>Predictive analytics for next 5 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={[...monthlyData.slice(-3), ...forecastData]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    name="Forecast" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="upper" 
                    stroke="#d1d5db" 
                    strokeWidth={1} 
                    strokeDasharray="3 3" 
                    name="Upper Bound" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lower" 
                    stroke="#d1d5db" 
                    strokeWidth={1} 
                    strokeDasharray="3 3" 
                    name="Lower Bound" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
                <CardDescription>Key insights from forecasting model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div className="font-medium">Growth Trend</div>
                    </div>
                    <p className="text-sm text-gray-700">
                      Expected 5.2% monthly growth in waste generation over next quarter
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div className="font-medium">Capacity Planning</div>
                    </div>
                    <p className="text-sm text-gray-700">
                      Current infrastructure can handle projected growth through April 2026
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div className="font-medium">Action Needed</div>
                    </div>
                    <p className="text-sm text-gray-700">
                      Consider expanding fleet by Q2 2026 to maintain service levels
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecasted Metrics</CardTitle>
                <CardDescription>Projected performance for next month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="text-sm text-gray-600">Estimated Collections</div>
                      <div className="font-bold text-xl">1,580 kg</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">+5.3%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="text-sm text-gray-600">Expected Recycling Rate</div>
                      <div className="font-bold text-xl">79%</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+1%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="text-sm text-gray-600">Projected CO₂ Savings</div>
                      <div className="font-bold text-xl">2,950 kg</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+5.4%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="text-sm text-gray-600">Estimated Costs</div>
                      <div className="font-bold text-xl">62,500 RWF</div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">+4.2%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create personalized reports with specific metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Report Name</Label>
                    <input
                      type="text"
                      placeholder="e.g., Monthly Environmental Impact"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>Environmental Impact</option>
                      <option>Operational Performance</option>
                      <option>Community Engagement</option>
                      <option>Financial Analysis</option>
                      <option>Custom Metrics</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last 6 Months</option>
                      <option>This Year</option>
                      <option>Custom Range</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                      <option>PDF Report</option>
                      <option>Excel Spreadsheet</option>
                      <option>CSV Data</option>
                      <option>PowerPoint Presentation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Metrics to Include</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Total Collections',
                      'Recycling Rate',
                      'CO₂ Reduction',
                      'Water Savings',
                      'Energy Savings',
                      'Cost per kg',
                      'Community Participation',
                      'District Performance',
                      'Material Composition',
                      'Landfill Diversion',
                      'Route Efficiency',
                      'Customer Satisfaction',
                    ].map((metric) => (
                      <label key={metric} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{metric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automated report delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Weekly Operations Summary</div>
                    <div className="text-sm text-gray-600">Every Monday at 9:00 AM • PDF via Email</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Pause</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Monthly Environmental Report</div>
                    <div className="text-sm text-gray-600">1st of each month • PDF & Excel via Email</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Pause</Button>
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