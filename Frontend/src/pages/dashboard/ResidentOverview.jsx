import { ScanLine, Truck, Ticket, Trophy, ClipboardList, CalendarDays, LayoutDashboard, Recycle, ShoppingBag, Leaf, Bell } from 'lucide-react';

export function ResidentOverview({ onNavigate }) {
  const modules = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Your points, activity, and quick stats',
      icon: LayoutDashboard,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'scan',
      title: 'Waste Scanner',
      description: 'Snap a photo and get instant sorting guidance',
      icon: ScanLine,
      color: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 'collection-request',
      title: 'Request Pickup',
      description: 'Schedule a waste collection at your location',
      icon: Truck,
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'my-requests',
      title: 'My Requests',
      description: 'Track, confirm, or cancel your pickup requests',
      icon: ClipboardList,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'schedules',
      title: 'Collection Schedules',
      description: 'Upcoming pickups in your district',
      icon: CalendarDays,
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      id: 'coupons',
      title: 'Coupons & Rewards',
      description: 'Redeem points for partner discounts',
      icon: Ticket,
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'See how you rank among eco-champions',
      icon: Trophy,
      color: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      id: 'recycling',
      title: 'Recycling Centers',
      description: 'Find nearest centers and schedule drop-offs',
      icon: Recycle,
      color: 'bg-lime-100',
      iconColor: 'text-lime-600',
    },
    {
      id: 'products',
      title: 'Eco Shop',
      description: 'Buy eco products with points, phone, or cash',
      icon: ShoppingBag,
      color: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
    {
      id: 'environment',
      title: 'My Environmental Impact',
      description: 'CO₂ saved, waste diverted, and trends',
      icon: Leaf,
      color: 'bg-green-100',
      iconColor: 'text-green-700',
    },
    {
      id: 'notifications',
      title: 'Messages',
      description: 'Notifications and two-way messaging',
      icon: Bell,
      color: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">GreenCare Rwanda</h1>
        <p className="text-slate-600">
          Smart waste management — scan, collect, earn points, and redeem rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onNavigate(module.id)}
              className="text-left rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`inline-flex p-3 rounded-xl ${module.color} mb-4`}>
                <Icon className={`h-6 w-6 ${module.iconColor}`} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{module.title}</h3>
              <p className="text-sm text-slate-500">{module.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
