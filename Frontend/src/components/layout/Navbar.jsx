import { useAuth } from '@/hooks/useAuth';
import { PointsBadge } from '@/components/ui/Badge';
import { LogOut, Menu, Recycle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function AppNavbar({ onMenuOpen, onLogout }) {
  const { user, points } = useAuth();

  return (
    <header className="bg-white border-b px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuOpen}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="bg-green-600 p-2 rounded-lg">
              <Recycle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Green Care</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'resident' && <PointsBadge points={points} />}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="hidden sm:flex">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
