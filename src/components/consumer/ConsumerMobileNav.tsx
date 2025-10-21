// Consumer mobile navigation component

import { Store, ShoppingCart, Package, RotateCcw, User } from 'lucide-react';

interface ConsumerMobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const ConsumerMobileNav = ({ currentView, onNavigate }: ConsumerMobileNavProps) => {
  const navItems = [
    {
      id: 'storefront',
      label: 'Shop',
      icon: Store
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package
    },
    {
      id: 'subscriptions',
      label: 'Subscribe',
      icon: RotateCcw
    },
    {
      id: 'account',
      label: 'Account',
      icon: User
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center px-3 py-2 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};