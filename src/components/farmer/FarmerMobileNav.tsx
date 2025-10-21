// Mobile bottom navigation for farmer portal

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Home,
  Milk,
  CreditCard,
  HelpCircle,
  User
} from 'lucide-react';

interface FarmerMobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'deliveries', label: 'Deliveries', icon: Milk },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'support', label: 'Support', icon: HelpCircle },
  { id: 'profile', label: 'Profile', icon: User }
];

export const FarmerMobileNav = ({ currentView, onNavigate }: FarmerMobileNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'secondary' : 'ghost'}
            className={cn(
              'flex flex-col items-center gap-1 h-auto py-2 px-1',
              currentView === item.id && 'bg-muted'
            )}
            onClick={() => onNavigate(item.id)}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {item.id === 'support' && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 text-xs p-0 flex items-center justify-center">
                  2
                </Badge>
              )}
            </div>
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};