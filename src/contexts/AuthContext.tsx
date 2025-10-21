// Authentication context for shared auth state

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../lib/sample-data';
import { getAuthState, login as authLogin, logout as authLogout } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const state = getAuthState();
    setUser(state.user);
    setIsAuthenticated(state.isAuthenticated);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const state = authLogin(email, password);
      setUser(state.user);
      setIsAuthenticated(state.isAuthenticated);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
