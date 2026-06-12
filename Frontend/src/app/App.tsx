import { useState } from 'react';
import { LandingPage } from '@/app/components/LandingPage';
import { AuthPage } from '@/app/components/AuthPage';
import { LoginPage } from '@/app/components/LoginPage';
import { ForgotPassword } from '@/app/components/ForgotPassword';
import { Overview } from '@/app/components/Overview';
import { Dashboard } from '@/app/components/Dashboard';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { CollectionManagement } from '@/app/components/CollectionManagement';
import { AdminCollectorManagement } from '@/app/components/AdminCollectorManagement';
import { AdminZoneManagement } from '@/app/components/AdminZoneManagement';
import { RecyclingModule } from '@/app/components/RecyclingModule';
import { UserProfile } from '@/app/components/UserProfile';
import { CommunityEngagement } from '@/app/components/CommunityEngagement';
import { CircularEconomy } from '@/app/components/CircularEconomy';
import { AnalyticsReporting } from '@/app/components/AnalyticsReporting';
import { AuditCompliance } from '@/app/components/AuditCompliance';
import { MobileCollectorApp } from '@/app/components/MobileCollectorApp';
import { IncentiveReward } from '@/app/components/IncentiveReward';
import { NotificationHub } from '@/app/components/NotificationHub';
import { Reports } from '@/app/components/Reports';
import { Button } from '@/app/components/ui/button';
import { Recycle, LayoutDashboard, Truck, Package, User, LogOut, Menu, Bell, Users, TrendingUp, Link2, Home, Shield, Smartphone, Gift, UserCheck, MapPin, FileText } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { Toaster } from '@/app/components/ui/sonner';
import { ToastContainer } from '@/hooks/useToast';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [currentPage, setCurrentPage] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleGetStarted = () => {
    setShowLanding(false);
    setShowLogin(false);
  };

  const handleBackToHome = () => {
    setShowLanding(true);
    setIsLoggedIn(false);
    setUserRole('');
    setCurrentPage('overview');
    setShowLogin(false);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  const handleShowSignup = () => {
    setShowLogin(false);
  };

  const handleLogin = (role: string) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage('overview');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setCurrentPage('overview');
    setShowLanding(true);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collection', label: 'Collections', icon: Truck },
    { id: 'collectors', label: 'Collectors', icon: UserCheck },
    { id: 'zones', label: 'Zones & Routes', icon: MapPin },
    { id: 'recycling', label: 'Recycling', icon: Package },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'circular', label: 'Circular Economy', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: Link2 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'audit', label: 'Audit Compliance', icon: Shield },
    { id: 'mobile', label: 'Mobile Collector App', icon: Smartphone },
    { id: 'incentive', label: 'Incentive Rewards', icon: Gift },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  // Collector-specific menu items
  const collectorMenuItems = [
    { id: 'dashboard', label: 'My Tasks', icon: LayoutDashboard },
    { id: 'collection', label: 'Schedule', icon: Truck },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notifications', label: 'Messages', icon: Bell },
  ];

  // Get menu items based on role
  const getMenuItems = () => {
    if (userRole === 'collector') {
      return collectorMenuItems;
    }
    if (userRole === 'resident') {
      // Exclude admin-only items for residents
      return menuItems.filter(item =>
        !['collectors', 'zones', 'audit', 'mobile'].includes(item.id)
      );
    }
    // Admin gets all items
    return menuItems;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview onNavigate={setCurrentPage} />;
      case 'dashboard':
        // Show different dashboard based on user role
        return userRole === 'admin' ? <AdminDashboard /> : <Dashboard userRole={userRole} />;
      case 'collection':
        return <CollectionManagement userRole={userRole} />;
      case 'collectors':
        return <AdminCollectorManagement />;
      case 'zones':
        return <AdminZoneManagement />;
      case 'recycling':
        return <RecyclingModule userRole={userRole} />;
      case 'profile':
        return <UserProfile userRole={userRole} />;
      case 'community':
        return <CommunityEngagement />;
      case 'circular':
        return <CircularEconomy />;
      case 'analytics':
        return <AnalyticsReporting />;
      case 'audit':
        return <AuditCompliance />;
      case 'mobile':
        return <MobileCollectorApp />;
      case 'incentive':
        return <IncentiveReward userRole={userRole} />;
      case 'notifications':
        return <NotificationHub userRole={userRole} />;
      case 'reports':
        return <Reports userRole={userRole} />;
      default:
        return <Overview onNavigate={setCurrentPage} />;
    }
  };

  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  if (!isLoggedIn) {
    if (showLogin) {
      return <LoginPage onLogin={handleLogin} onBackToHome={handleBackToHome} onShowSignup={handleShowSignup} />;
    }
    return <AuthPage onLogin={handleLogin} onBackToHome={handleBackToHome} onShowLogin={handleShowLogin} />;
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-lg">
            <Recycle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Green Care</h1>
            <p className="text-xs text-gray-600">Rwanda</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600 mb-1">Logged in as</div>
          <div className="font-medium capitalize">{userRole}</div>
        </div>

        <nav className="space-y-1">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Access all platform features and settings
                  </SheetDescription>
                  <Sidebar />
                </SheetContent>
              </Sheet>

              {/* Mobile Logo */}
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {renderPage()}
        </main>
      </div>
      <Toaster />
      <ToastContainer />
    </div>
  );
}