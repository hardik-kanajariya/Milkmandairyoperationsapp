// Authentication guard component

import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../lib/sample-data';
import { LoginScreen } from './auth/LoginScreen';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};