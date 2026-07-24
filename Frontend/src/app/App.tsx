import { useState, useEffect, useRef } from 'react';
import { LandingPage } from '@/app/components/LandingPage';
import { AuthPage } from '@/app/components/AuthPage';
import { LoginPage } from '@/app/components/LoginPage';
import { ForgotPassword } from '@/app/components/ForgotPassword';
import { Overview } from '@/app/components/Overview';
import { Dashboard } from '@/app/components/Dashboard';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { AdminCollectionManagement } from '@/app/components/AdminCollectionManagement';
import { AdminBinStatusManagement } from '@/app/components/AdminBinStatusManagement';
import { CollectionManagement } from '@/app/components/CollectionManagement';
import { AdminCollectorManagement } from '@/app/components/AdminCollectorManagement';
import { AdminResidentManagement } from '@/app/components/AdminResidentManagement';
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
  MapPin, FileText, ScanLine, ClipboardList, CalendarDays, Trophy, Bell,
  Leaf, ShoppingBag, Recycle as RecycleIcon, Trash2,
} from 'lucide-react';
import { GreenCareLogo } from '@/app/components/ui/GreenCareLogo';
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
import { BinStatusPage } from '@/pages/collection/BinStatusPage';
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

// NEW COMPONENTS
import { BuyerAuthPage } from '@/pages/buyer/BuyerAuthPage';
import { ProductShop } from '@/pages/products/ProductShop';
import { BuyerOrders } from '@/pages/buyer/BuyerOrders';
import { BuyerProfile } from '@/pages/buyer/BuyerProfile';
import { AdminWastePipeline } from '@/pages/admin/AdminWastePipeline';

function AppContent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const userRole = user?.role || '';

  const [showLanding, setShowLanding] = useState(true);
  const [currentPage, setCurrentPage] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showBuyerAuth, setShowBuyerAuth] = useState(false);
  const [showPublicShop, setShowPublicShop] = useState(false);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticated.current = true;
      setShowLanding(false);
      setShowBuyerAuth(false);
      setShowPublicShop(false);
      if (user?.role === 'admin' && currentPage === 'overview') {
        setCurrentPage('dashboard');
      }
      if (user?.role === 'collector' && currentPage === 'overview') {
        setCurrentPage('dashboard');
      }
      if (user?.role === 'buyer' && currentPage === 'overview') {
        setCurrentPage('shop');
      }
      if (user?.role === 'resident' && currentPage === 'coupons') {
        setCurrentPage('overview');
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
    setShowBuyerAuth(false);
    setShowPublicShop(false);
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
    { id: 'bin-status', label: 'Bin Status', icon: Trash2 },
    { id: 'collectors', label: 'Collectors', icon: UserCheck },
    { id: 'residents', label: 'Residents', icon: Users },
    { id: 'zones', label: 'Zones & Routes', icon: MapPin },
    { id: 'pipeline', label: 'Waste Pipeline', icon: RecycleIcon },
    { id: 'recycling', label: 'Recycling Center', icon: Package },
    { id: 'products-admin', label: 'Eco Products', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const residentMenuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Waste Scanner', icon: ScanLine },
    { id: 'collection-request', label: 'Request Pickup', icon: Truck },
    { id: 'my-requests', label: 'My Requests', icon: ClipboardList },
    { id: 'bin-status', label: 'Bin Status', icon: Trash2 },
    { id: 'schedules', label: 'Schedules', icon: CalendarDays },
    { id: 'recycling', label: 'Recycling Centers', icon: RecycleIcon },
    { id: 'products', label: 'Eco Shop', icon: ShoppingBag },
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

  const buyerMenuItems = [
    { id: 'shop', label: 'Eco Shop', icon: ShoppingBag },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const getMenuItems = () => {
    if (userRole === 'buyer') return buyerMenuItems;
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
      case 'bin-status':
        if (userRole === 'admin') return <AdminBinStatusManagement />;
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <BinStatusPage onNavigate={handleNavigate} />
          </ProtectedRoute>
        );
      case 'schedules':
        return (
          <ProtectedRoute allowedRoles={['resident']}>
            <SchedulesPage onNavigate={handleNavigate} />
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
      case 'residents':
        return <AdminResidentManagement />;
      case 'zones':
        return <AdminZoneManagement />;
      case 'pipeline':
        return <AdminWastePipeline />;
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
      case 'shop':
        // Both Resident and Buyer can access the shop
        return <ProductShop onNavigate={handleNavigate} />;
      case 'orders':
        return (
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerOrders />
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
        if (userRole === 'buyer') return <BuyerProfile />;
        return <UserProfilePage userRole={userRole} />;
      case 'community':
        return <CommunityEngagement />;
      case 'analytics':
        return <AdminReportsPage />;
      case 'circular':
        if (userRole === 'resident' || userRole === 'buyer') return <ProductShop onNavigate={handleNavigate} />;
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

  // Handle Unauthenticated State Overrides
  if (!isAuthenticated) {
    if (showPublicShop) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GreenCareLogo size="sm" variant="light" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setShowPublicShop(false); setShowBuyerAuth(true); }}>Sign In to Buy</Button>
              <Button onClick={() => { setShowPublicShop(false); setShowLanding(true); }}>Home</Button>
            </div>
          </header>
          <div className="flex-1">
            <ProductShop />
          </div>
          <Toaster position="bottom-right" richColors closeButton duration={4000} />
        </div>
      );
    }
    
    if (showBuyerAuth) {
      return (
        <>
          <BuyerAuthPage onSuccess={() => setShowBuyerAuth(false)} />
          <Toaster position="bottom-right" richColors closeButton duration={4000} />
        </>
      );
    }

    if (showLanding) {
      return (
        <>
          <LandingPage 
            onGetStarted={handleGetStarted} 
            onShopClick={() => setShowPublicShop(true)}
            onBuyerClick={() => setShowBuyerAuth(true)}
          />
          <Toaster position="bottom-right" richColors closeButton duration={4000} />
        </>
      );
    }

    if (showForgotPassword) {
      return (
        <>
          <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
          <Toaster position="bottom-right" richColors closeButton duration={4000} />
        </>
      );
    }

    if (showLogin) {
      return (
        <>
          <LoginPage onBackToHome={handleBackToHome} onShowSignup={handleShowSignup} />
          <Toaster position="bottom-right" richColors closeButton duration={4000} />
        </>
      );
    }

    return (
      <>
        <AuthPage
          onLogin={() => {}}
          onBackToHome={handleBackToHome}
          onShowLogin={handleShowLogin}
          onBuyerClick={() => setShowBuyerAuth(true)}
        />
        <Toaster position="bottom-right" richColors closeButton duration={4000} />
      </>
    );
  }

  // Authenticated Layout
  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[image:var(--gradient-sidebar)] text-white/90 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]">
      {/* Branding */}
      <div className="p-8 pb-6">
        <GreenCareLogo size="md" variant="dark" showTagline />
      </div>

      {/* Floating Profile Card */}
      <div className="px-6 pb-6">
        <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-[20px] border border-white/10 shadow-sm flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full bg-emerald-800 flex items-center justify-center border-2 border-white/20 text-sm font-bold shadow-inner">
              {user?.fullName?.charAt(0) || userRole.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#14532D]"></span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-white truncate capitalize">{user?.fullName || userRole}</div>
            <div className="text-xs text-emerald-100/70 capitalize truncate">{userRole}</div>
          </div>
        </div>
      </div>

      {/* Navigation System */}
      <div className="flex-1 px-4 overflow-y-auto">
        <nav className="space-y-1 pb-4">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`relative w-full flex items-center gap-3 px-4 h-12 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-[image:var(--gradient-primary)] text-white shadow-md shadow-emerald-900/20'
                    : 'text-emerald-100/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`}
              >
                {isActive && <div className="absolute -left-4 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`} />
                <span className="font-medium text-[15px] truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Detached Logout */}
      <div className="p-6">
        <button 
          onClick={handleLogout} 
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-white/10 text-emerald-100/70 hover:bg-red-500/20 hover:text-red-100 hover:border-red-500/30 transition-all duration-300"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#F8FAFC]">
      <aside className="hidden lg:block w-[280px] shrink-0 border-r border-transparent">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Access all platform features</SheetDescription>
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        <AppNavbar onMenuOpen={() => setMobileMenuOpen(true)} onLogout={handleLogout} />

        <main className={`flex-1 min-h-0 p-4 lg:p-6 ${currentPage === 'profile' ? 'overflow-hidden' : 'overflow-auto'}`}>
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
