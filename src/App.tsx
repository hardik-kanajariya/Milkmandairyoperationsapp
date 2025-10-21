// Main Milkman application with role-based routing

import { useState, useEffect } from 'react';
import { AuthGuard } from './components/AuthGuard';
import { AppNavbar } from './components/layout/AppNavbar';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminMobileNav } from './components/admin/AdminMobileNav';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CollectionView } from './components/admin/CollectionView';
import { FarmersView } from './components/admin/FarmersView';
import { PayoutsView } from './components/admin/PayoutsView';
import { ProcessingView } from './components/admin/ProcessingView';
import { InventoryView } from './components/admin/InventoryView';
import { OrdersView } from './components/admin/OrdersView';
import { POSView } from './components/admin/POSView';
import { ReportsView } from './components/admin/ReportsView';
import { AuditView } from './components/admin/AuditView';
import { SettingsView } from './components/admin/SettingsView';
import { UsersView } from './components/admin/UsersView';
import { AdminProfileView } from './components/admin/AdminProfileView';
import { FarmerMobileNav } from './components/farmer/FarmerMobileNav';
import { FarmerHome } from './components/farmer/FarmerHome';
import { DeliveriesView } from './components/farmer/DeliveriesView';
import { PaymentsView } from './components/farmer/PaymentsView';
import { SupportView } from './components/farmer/SupportView';
import { ProfileView } from './components/farmer/ProfileView';
import { ConsumerMobileNav } from './components/consumer/ConsumerMobileNav';
import { ProductStorefront } from './components/consumer/ProductStorefront';
import { ShoppingCart } from './components/consumer/ShoppingCart';
import { OrderHistory } from './components/consumer/OrderHistory';
import { SubscriptionManager } from './components/consumer/SubscriptionManager';
import { AccountSettings } from './components/consumer/AccountSettings';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { ROLES } from './lib/sample-data';
import { Toaster } from './components/ui/sonner';

// Placeholder component for views under construction
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-muted-foreground">This view is under construction</p>
    </div>
  </div>
);

function AppContent() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [currentView, setCurrentView] = useState('dashboard');

  // Update view when user changes (e.g., after login)
  useEffect(() => {
    if (user?.role === ROLES.ADMIN) {
      setCurrentView('dashboard');
    } else if (user?.role === ROLES.FARMER) {
      setCurrentView('home');
    } else if (user?.role === ROLES.CONSUMER) {
      setCurrentView('storefront');
    }
  }, [user]);

  const renderAdminView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'collection':
        return <CollectionView />;
      case 'farmers':
        return <FarmersView />;
      case 'payouts':
        return <PayoutsView />;
      case 'processing':
        return <ProcessingView />;
      case 'inventory':
        return <InventoryView />;
      case 'orders':
        return <OrdersView />;
      case 'pos':
        return <POSView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditView />;
      case 'settings':
        return <SettingsView />;
      case 'users':
        return <UsersView />;
      case 'profile':
        return <AdminProfileView />;
      default:
        return <AdminDashboard />;
    }
  };

  const renderFarmerView = () => {
    switch (currentView) {
      case 'home':
        return <FarmerHome />;
      case 'deliveries':
        return <DeliveriesView />;
      case 'payments':
        return <PaymentsView />;
      case 'support':
        return <SupportView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <FarmerHome />;
    }
  };

  const renderConsumerView = () => {
    switch (currentView) {
      case 'storefront':
        return <ProductStorefront onNavigate={setCurrentView} />;
      case 'cart':
        return <ShoppingCart onNavigate={setCurrentView} />;
      case 'orders':
        return <OrderHistory />;
      case 'subscriptions':
        return <SubscriptionManager />;
      case 'account':
        return <AccountSettings />;
      default:
        return <ProductStorefront onNavigate={setCurrentView} />;
    }
  };

  return (
    <AuthGuard>
      <CartProvider>
        <div className="min-h-screen bg-background">
          {/* Top Navigation */}
          <AppNavbar onNavigate={setCurrentView} />

          <div className="flex">
            {/* Admin Sidebar - Desktop Only */}
            {user?.role === ROLES.ADMIN && (
              <div className="hidden lg:block">
                <AdminSidebar currentView={currentView} onNavigate={setCurrentView} />
              </div>
            )}

            {/* Main Content */}
            <main className={`flex-1 ${user?.role === ROLES.ADMIN ? 'lg:ml-0' : 'px-4'}`}>
              <div className={`${user?.role === ROLES.ADMIN ? 'p-4 lg:p-6' : 'py-6'} ${user?.role === ROLES.ADMIN ? 'max-w-full' : 'max-w-7xl'} mx-auto`}>
                {user?.role === ROLES.ADMIN && renderAdminView()}
                {user?.role === ROLES.FARMER && renderFarmerView()}
                {user?.role === ROLES.CONSUMER && renderConsumerView()}
              </div>
            </main>
          </div>

          {/* Mobile Navigation */}
          {user?.role === ROLES.ADMIN && (
            <AdminMobileNav currentView={currentView} onNavigate={setCurrentView} />
          )}
          {user?.role === ROLES.FARMER && (
            <FarmerMobileNav currentView={currentView} onNavigate={setCurrentView} />
          )}
          {user?.role === ROLES.CONSUMER && (
            <ConsumerMobileNav currentView={currentView} onNavigate={setCurrentView} />
          )}

          {/* Toast Notifications */}
          <Toaster />
        </div>
      </CartProvider>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}