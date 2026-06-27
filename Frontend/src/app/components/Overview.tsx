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
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto py-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-[image:var(--gradient-primary)] rounded-[24px] shadow-lg shadow-emerald-500/20 mb-6 relative">
          <div className="absolute inset-0 bg-white/20 rounded-[24px] backdrop-blur-sm"></div>
          <Leaf className="h-12 w-12 text-white relative z-10 drop-shadow-md" />
        </div>
        <h1 className="font-extrabold text-4xl lg:text-5xl tracking-tight text-gray-900 mb-4">
          GreenCare <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">Rwanda</span>
        </h1>
        <h2 className="text-xl font-medium text-gray-700 mb-4">
          Integrated Digital Platform for Circular Waste Management
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          A comprehensive system to optimize waste collection, recycling, and circular economy processes
          while engaging communities and measuring environmental impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-green-500/20 hover:to-transparent transition-all duration-300">
          <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full">
            <CardHeader className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-[16px] mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="text-lg font-bold">Track Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[15px] text-gray-500 text-center leading-relaxed">
                Monitor your environmental contributions and earn rewards
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-blue-500/20 hover:to-transparent transition-all duration-300">
          <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full">
            <CardHeader className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-[16px] mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-7 w-7 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-bold">Engage Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[15px] text-gray-500 text-center leading-relaxed">
                Join events, share tips, and connect with eco-conscious neighbors
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="relative group rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-purple-500/20 hover:to-transparent transition-all duration-300">
          <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all bg-white h-full">
            <CardHeader className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-50 rounded-[16px] mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-7 w-7 text-purple-600" />
              </div>
              <CardTitle className="text-lg font-bold">Drive Circularity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[15px] text-gray-500 text-center leading-relaxed">
                Follow waste transformation into valuable new products
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-2xl tracking-tight text-gray-900 mb-6">Platform Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.id} className="group relative rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent hover:from-gray-200/50 hover:to-transparent transition-all duration-300">
                <Card className="rounded-[20px] border border-gray-200 shadow-sm group-hover:shadow-md transition-all h-full bg-white flex flex-col">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`${module.color} p-3.5 rounded-[16px] group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-6 w-6 ${module.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="mb-2 text-lg font-bold">{module.title}</CardTitle>
                        <CardDescription className="text-[14.5px] leading-relaxed">{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        {module.features.map((feature) => (
                          <span
                            key={feature}
                            className="text-[13px] font-medium bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full text-gray-600"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <Button
                        onClick={() => onNavigate(module.id)}
                        className="w-full bg-[image:var(--gradient-primary)] hover:opacity-90 transition-opacity rounded-xl h-12 shadow-sm shadow-emerald-500/20"
                      >
                        Explore Module
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative rounded-[20px] p-[1px] bg-gradient-to-b from-transparent to-transparent bg-gray-200/50">
        <Card className="rounded-[20px] bg-gradient-to-br from-green-50 to-emerald-50 border-none shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-bl-full pointer-events-none blur-3xl"></div>
          <CardHeader className="relative z-10 pb-4">
            <CardTitle className="text-xl font-bold text-green-900">System Features</CardTitle>
            <CardDescription className="text-green-700/70 text-sm">Key capabilities of the platform</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><span>🔒</span> Secure Authentication</h4>
                <p className="text-[14px] leading-relaxed text-green-800/70">
                  Multi-role login system with role-based access control for residents, collectors, admins, and partners
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><span>📱</span> Real-time Tracking</h4>
                <p className="text-[14px] leading-relaxed text-green-800/70">
                  Live collection routes, bin status monitoring, and instant notifications for all activities
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><span>🎯</span> Gamification</h4>
                <p className="text-[14px] leading-relaxed text-green-800/70">
                  Points, badges, leaderboards, and rewards to encourage sustainable waste management practices
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><span>📊</span> Advanced Analytics</h4>
                <p className="text-[14px] leading-relaxed text-green-800/70">
                  Environmental impact metrics, predictive forecasting, and customizable reports
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><span>🔄</span> Circular Economy</h4>
                <p className="text-[14px] leading-relaxed text-green-800/70">
                  Track material flows from waste to product, marketplace for upcycled goods
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2"><span>👥</span> Community Hub</h4>
                <p className="text-[14px] leading-relaxed text-green-800/70">
                  Events, educational content, discussion forums, and volunteer opportunities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
