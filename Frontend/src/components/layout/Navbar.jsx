import { useAuth } from '@/hooks/useAuth';
import { PointsBadge } from '@/components/ui/Badge';
import { LogOut, Menu, Search, Bell, CalendarDays, ChevronDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { GreenCareLogo } from '@/app/components/ui/GreenCareLogo';

export function AppNavbar({ onMenuOpen, onLogout }) {
  const { user, points } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuOpen}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2 lg:hidden">
            <GreenCareLogo size="sm" variant="light" />
          </div>
          
          <div className="hidden lg:flex items-center gap-3 w-full max-w-md">
            {/* Search removed as requested */}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications and Calendar removed as requested */}

          {user?.role === 'resident' && <PointsBadge points={points} />}
          
          <div className="flex items-center gap-3 pl-1 pr-2 py-1 cursor-pointer group rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[14px] font-bold text-gray-900 leading-none mb-1 group-hover:text-emerald-700 transition-colors">{user?.fullName}</p>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-gray-400">{user?.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white shadow-md flex items-center justify-center text-sm font-black text-white transform group-hover:scale-105 transition-transform">
                {user?.fullName?.charAt(0) || user?.role?.charAt(0)}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors hidden sm:block" />
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onLogout} className="sm:hidden ml-1">
            <LogOut className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}
