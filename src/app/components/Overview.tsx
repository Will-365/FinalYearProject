import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { 
  LayoutDashboard, 
  Truck, 
  Package, 
  Users, 
  TrendingUp, 
  BarChart3,
  ArrowRight,
  Leaf,
  Award,
  MessageSquare
} from 'lucide-react';

interface OverviewProps {
  onNavigate: (page: string) => void;
}

export function Overview({ onNavigate }: OverviewProps) {
  const modules = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Real-time overview of operations, metrics, and performance indicators',
      icon: LayoutDashboard,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      features: ['Key Metrics', 'Activity Feed', 'Quick Stats', 'Top Performers'],
    },
    {
      id: 'collection',
      title: 'Waste Collection Management',
      description: 'Schedule, track, and manage waste collection activities',
      icon: Truck,
      color: 'bg-green-100',
      iconColor: 'text-green-600',
      features: ['Collection Schedule', 'Route Tracking', 'Bin Status', 'Photo Verification'],
    },
    {
      id: 'recycling',
      title: 'Recycling & Processing',
      description: 'Track recycling activities and earn rewards for environmental impact',
      icon: Package,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      features: ['Recycling Centers', 'Material Guide', 'Points & Rewards', 'Impact Tracking'],
    },
    {
      id: 'community',
      title: 'Community Engagement',
      description: 'Connect with community, participate in events, and learn together',
      icon: Users,
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
      features: ['Community Feed', 'Events Calendar', 'Educational Content', 'Achievements'],
    },
    {
      id: 'circular',
      title: 'Circular Economy Tracking',
      description: 'Monitor material flows and discover upcycled products',
      icon: TrendingUp,
      color: 'bg-teal-100',
      iconColor: 'text-teal-600',
      features: ['Material Flow', 'Marketplace', 'Product Lifecycle', 'Partner Network'],
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'Comprehensive insights, trends, and custom reports',
      icon: BarChart3,
      color: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      features: ['Environmental Impact', 'Operational Metrics', 'Forecasting', 'Custom Reports'],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
          <Leaf className="h-10 w-10 text-white" />
        </div>
        <h1 className="font-bold text-4xl mb-3">
          Green Care Rwanda
        </h1>
        <h2 className="text-xl text-gray-700 mb-3">
          Integrated Digital Platform for Circular Waste Management
        </h2>
        <p className="text-gray-600 text-lg">
          A comprehensive system to optimize waste collection, recycling, and circular economy processes
          while engaging communities and measuring environmental impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Track Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Monitor your environmental contributions and earn rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Engage Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Join events, share tips, and connect with eco-conscious neighbors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Drive Circularity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Follow waste transformation into valuable new products
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="font-bold text-2xl mb-6">Platform Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`${module.color} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${module.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {module.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={() => onNavigate(module.id)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Explore Module
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle>System Features</CardTitle>
          <CardDescription>Key capabilities of the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">🔒 Secure Authentication</h4>
              <p className="text-sm text-gray-600">
                Multi-role login system with role-based access control for residents, collectors, admins, and partners
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📱 Real-time Tracking</h4>
              <p className="text-sm text-gray-600">
                Live collection routes, bin status monitoring, and instant notifications for all activities
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Gamification</h4>
              <p className="text-sm text-gray-600">
                Points, badges, leaderboards, and rewards to encourage sustainable waste management practices
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Advanced Analytics</h4>
              <p className="text-sm text-gray-600">
                Environmental impact metrics, predictive forecasting, and customizable reports
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔄 Circular Economy</h4>
              <p className="text-sm text-gray-600">
                Track material flows from waste to product, marketplace for upcycled goods
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">👥 Community Hub</h4>
              <p className="text-sm text-gray-600">
                Events, educational content, discussion forums, and volunteer opportunities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
