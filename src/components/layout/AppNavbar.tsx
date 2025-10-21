// Top navigation bar component

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  HelpCircle,
  User,
  Milk
} from 'lucide-react';

interface AppNavbarProps {
  onSearch?: (query: string) => void;
  onNavigate?: (view: string) => void;
}

export const AppNavbar = ({ onSearch, onNavigate }: AppNavbarProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'farmer': return 'secondary';
      case 'consumer': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className={`flex h-14 items-center justify-between px-4 md:px-6`}>
        {/* Left side - Logo and Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Milk className="h-6 w-6 text-primary" />
            <span className="font-semibold hidden sm:inline-block">Milkman</span>
          </div>

          {/* Search */}
          <div className={`flex-1 max-w-md hidden md:block" ${user?.role === 'admin' ? 'lg:pl-128' : ''}`}>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Global search... (Press / to focus)"
                className="pl-8"
                onKeyDown={(e) => {
                  if (e.key === '/') {
                    e.preventDefault();
                    e.currentTarget.focus();
                  }
                }}
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant={getRoleBadgeVariant(user?.role || '')} className="w-fit text-xs">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Badge>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate?.(user?.role === 'consumer' ? 'account' : 'profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate?.(user?.role === 'admin' ? 'settings' : user?.role === 'consumer' ? 'account' : 'profile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};