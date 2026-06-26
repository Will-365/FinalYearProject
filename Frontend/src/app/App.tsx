import { useState, useEffect, useRef } from 'react';
import { LandingPage } from '@/app/components/LandingPage';
import { AuthPage } from '@/app/components/AuthPage';
import { LoginPage } from '@/app/components/LoginPage';
import { ForgotPassword } from '@/app/components/ForgotPassword';
import { Overview } from '@/app/components/Overview';
import { Dashboard } from '@/app/components/Dashboard';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { AdminCollectionManagement } from '@/app/components/AdminCollectionManagement';
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
import {
  Recycle, LayoutDashboard, Truck, Package, User, LogOut,
  Users, TrendingUp, Link2, Home, Shield, Smartphone, Gift, UserCheck,
  MapPin, FileText, ScanLine, ClipboardList, CalendarDays, Trophy, Ticket, Bell,
  Leaf, ShoppingBag, Recycle as RecycleIcon,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { Toaster } from '@/app/components/ui/sonner';
import { ToastContainer } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppNavbar } from '@/components/layout/Navbar';
import { ScanPage } from '@/pages/scan/ScanPage';
import { CollectionRequestPage } from '@/pages/collection/CollectionRequestPage';
import { MyRequestsPage } from '@/pages/collection/MyRequestsPage';
import { SchedulesPage } from '@/pages/collection/SchedulesPage';
import { CouponsPage } from '@/pages/coupons/CouponsPage';
import { LeaderboardPage } from '@/pages/leaderboard/LeaderboardPage';
import { ResidentDashboard } from '@/pages/dashboard/ResidentDashboard';
import { ResidentOverview } from '@/pages/dashboard/ResidentOverview';
import { CollectorTasksPage } from '@/pages/collector/CollectorTasksPage';
import { CollectorReportsPage } from '@/pages/collector/CollectorReportsPage';
import { CollectorMessagesPage } from '@/pages/collector/CollectorMessagesPage';
import { CollectorProfilePage } from '@/pages/profile/CollectorProfilePage';
import { UserProfilePage } from '@/pages/profile/UserProfilePage';
import { ResidentRecyclingPage } from '@/pages/recycling/ResidentRecyclingPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { EnvironmentalImpactPage } from '@/pages/reports/EnvironmentalImpactPage';
import { AdminReportsPage } from '@/pages/reports/AdminReportsPage';
import { AdminProductManagement } from '@/app/components/AdminProductManagement';
import { AdminMessagesPage } from '@/pages/messaging/AdminMessagesPage';
import { ResidentNotificationsPage } from '@/pages/messaging/ResidentNotificationsPage';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const userRole = user?.role || '';

  const [showLanding, setShowLanding] = useState(true);
  const [currentPage, setCurrentPage] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticated.current = true;
      setShowLanding(false);
      if (user?.role === 'admin' && currentPage === 'overview') {
        setCurrentPage('dashboard');
      }
      if (user?.role === 'collector' && currentPage === 'overview') {
        setCurrentPage('dashboard');
      }
    } else if (wasAuthenticated.current && !isLoading) {
      setShowLogin(true);
      wasAuthenticated.current = false;
    }
  }, [isAuthenticated, isLoading, user?.role, currentPage]);

  const handleGetStarted = () => {
    setShowLanding(false);
    setShowLogin(false);
  };

  const handleBackToHome = () => {
    setShowLanding(true);
    logout();
    setCurrentPage('overview');
    setShowLogin(false);
  };

  const handleShowLogin = () => setShowLogin(true);
  const handleShowSignup = () => setShowLogin(false);

  const handleLogout = () => {
    logout();
    setCurrentPage('overview');
    setShowLanding(true);
  };

  const handleNavigate = (page: string) => setCurrentPage(page);

  const adminMenuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collection', label: 'Collections', icon: Truck },
    { id: 'collectors', label: 'Collectors', icon: UserCheck },
    { id: 'zones', label: 'Zones & Routes', icon: MapPin },
    { id: 'recycling', label: 'Recycling', icon: Package },
    { id: 'products-admin', label: 'Eco Products', icon: ShoppingBag },
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

  const residentMenuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Waste Scanner', icon: ScanLine },
    { id: 'collection-request', label: 'Request Pickup', icon: Truck },
    { id: 'my-requests', label: 'My Requests', icon: ClipboardList },
    { id: 'schedules', label: 'Schedules', icon: CalendarDays },
    { id: 'recycling', label: 'Recycling Centers', icon: RecycleIcon },
    { id: 'products', label: 'Eco Shop', icon: ShoppingBag },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'environment', label: 'My Impact', icon: Leaf },
    { id: 'notifications', label: 'Messages', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const collectorMenuItems = [
    { id: 'dashboard', label: 'My Tasks', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notifications', label: 'Messages', icon: Bell },
  ];

  const getMenuItems = () => {
    if (userRole === 'collector') return collectorMenuItems;
    if (userRole === 'resident') return residentMenuItems;
    return adminMenuItems;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return userRole === 'resident'
          ? <ResidentOverview onNavigate={setCurrentPage} />
          : <Overview onNavigate={setCurrentPage} />;
      case 'dashboard':
        if (userRole === 'admin') return <AdminDashboard onNavigate={setCurrentPage} />;
        if (userRole === 'resident') return <ResidentDashboard onNavigate={handleNavigate} />;
        if (userRole === 'collector') return <CollectorTasksPage />;
        return <Dashboard userRole={userRole} />;
      case 'scan':
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <ScanPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'collection-request':
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <CollectionRequestPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'my-requests':
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <MyRequestsPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'schedules':
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <SchedulesPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'coupons':
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <CouponsPage />
          </ProtectedRoute>
        );
      case 'leaderboard':
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <LeaderboardPage />
          </ProtectedRoute>
        );
      case 'collection':
        if (userRole === 'admin') return <AdminCollectionManagement />;
        if (userRole === 'collector') {
          return (
            <ProtectedRoute allowedRoles={['collector']}>
              <SchedulesPage onNavigate={handleNavigate} />
            </ProtectedRoute>
          );
        }
        return <CollectionManagement userRole={userRole} />;
      case 'collectors':
        return <AdminCollectorManagement />;
      case 'zones':
        return <AdminZoneManagement />;
      case 'products-admin':
        return <AdminProductManagement onNavigate={handleNavigate} />;
      case 'recycling':
        if (userRole === 'admin') return <RecyclingModule userRole={userRole} />;
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <ResidentRecyclingPage />
          </ProtectedRoute>
        );
      case 'products':
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <ProductsPage />
          </ProtectedRoute>
        );
      case 'environment':
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <EnvironmentalImpactPage />
          </ProtectedRoute>
        );
      case 'recycling-admin':
        return <RecyclingModule userRole="admin" />;
      case 'profile':
        if (userRole === 'collector') return <CollectorProfilePage />;
        return <UserProfilePage userRole={userRole} />;
      case 'community':
        return <CommunityEngagement />;
      case 'analytics':
        return <AdminReportsPage />;
      case 'circular':
        if (userRole === 'resident') return <ProductsPage />;
        return <AdminReportsPage />;
      case 'audit':
        return <AuditCompliance />;
      case 'mobile':
        if (userRole === 'collector') return <CollectorTasksPage />;
        return <MobileCollectorApp />;
      case 'incentive':
        return <IncentiveReward userRole={userRole} />;
      case 'notifications':
        if (userRole === 'collector') return <CollectorMessagesPage />;
        if (userRole === 'admin') return <AdminMessagesPage />;
        if (userRole === 'resident') return <ResidentNotificationsPage />;
        return <NotificationHub userRole={userRole} />;
      case 'reports':
        if (userRole === 'collector') return <CollectorReportsPage />;
        if (userRole === 'admin') return <AdminReportsPage />;
        if (userRole === 'resident') return <EnvironmentalImpactPage />;
        return <Reports userRole={userRole} />;
      default:
        return <Overview onNavigate={setCurrentPage} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-green-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (showLanding && !isAuthenticated) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (showForgotPassword && !isAuthenticated) {
    return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  if (!isAuthenticated) {
    if (showLogin) {
      return <LoginPage onBackToHome={handleBackToHome} onShowSignup={handleShowSignup} />;
    }
    return (
      <AuthPage
        onLogin={() => {}}
        onBackToHome={handleBackToHome}
        onShowLogin={handleShowLogin}
      />
    );
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
          <div className="font-medium capitalize">{user?.fullName || userRole}</div>
          <div className="text-xs text-gray-500 capitalize">{userRole}</div>
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
        <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-50">
      <aside className="hidden lg:block w-64 bg-white border-r shrink-0">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Access all platform features</SheetDescription>
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        <AppNavbar onMenuOpen={() => setMobileMenuOpen(true)} onLogout={handleLogout} />

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {renderPage()}
        </main>
      </div>
      <Toaster position="bottom-right" richColors closeButton duration={4000} />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
