import { ScanLine, Truck, Trophy, ClipboardList, CalendarDays, LayoutDashboard, Recycle, ShoppingBag, Leaf, Bell, Trash2 } from 'lucide-react';

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
      id: 'bin-status',
      title: 'Bin Status',
      description: 'Report how full your bin is and its urgency',
      icon: Trash2,
      color: 'bg-amber-100',
      iconColor: 'text-amber-700',
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">GreenCare Rwanda</h1>
        <p className="text-sm text-slate-600">
          Smart waste management — scan, collect, earn points, and track your impact.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onNavigate(module.id)}
              className="text-left rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`inline-flex p-2 rounded-lg ${module.color} mb-3`}>
                <Icon className={`h-5 w-5 ${module.iconColor}`} />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 mb-1">{module.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{module.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
