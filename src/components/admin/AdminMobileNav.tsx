// Admin mobile navigation component

import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard,
  Milk,
  Users,
  CreditCard,
  Factory,
  Package,
  Truck,
  Calculator,
  BarChart3,
  Settings,
  FileText,
  Shield,
  Menu
} from 'lucide-react';

interface AdminMobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const navigationItems = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Operations',
    items: [
      { id: 'collection', label: 'Milk Collection', icon: Milk },
      { id: 'farmers', label: 'Farmers', icon: Users },
      { id: 'payouts', label: 'Payouts & Ledger', icon: CreditCard }
    ]
  },
  {
    title: 'Production',
    items: [
      { id: 'processing', label: 'Processing & QC', icon: Factory },
      { id: 'inventory', label: 'Inventory', icon: Package }
    ]
  },
  {
    title: 'Sales',
    items: [
      { id: 'orders', label: 'Orders & Delivery', icon: Truck },
      { id: 'pos', label: 'POS Terminal', icon: Calculator }
    ]
  },
  {
    title: 'Analytics',
    items: [
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'audit', label: 'Audit Log', icon: FileText }
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'users', label: 'Users & Roles', icon: Shield }
    ]
  }
];

export const AdminMobileNav = ({ currentView, onNavigate }: AdminMobileNavProps) => {
  return (
    <div className="lg:hidden fixed top-20 left-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold">Admin Menu</h2>
            </div>
            <ScrollArea className="h-[calc(100vh-8rem)] px-3">
              <div className="space-y-4">
                {navigationItems.map((section) => (
                  <div key={section.title}>
                    <h4 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                      {section.title}
                    </h4>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <Button
                          key={item.id}
                          variant={currentView === item.id ? 'secondary' : 'ghost'}
                          className={cn(
                            'w-full justify-start',
                            currentView === item.id && 'bg-muted font-medium'
                          )}
                          onClick={() => onNavigate(item.id)}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
