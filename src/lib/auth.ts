// Authentication and role management for Milkman

import { User, UserRole, ROLES, sampleUsers } from './sample-data';

// Simple in-memory auth for prototype
let currentUser: User | null = null;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Login function - in real app this would validate credentials
export const login = (email: string, password: string): AuthState => {
  // For prototype, accept any password for sample users
  const user = sampleUsers.find(u => u.email === email);
  
  if (user) {
    currentUser = user;
    // Store in localStorage for persistence
    localStorage.setItem('milkman_auth', JSON.stringify(user));
    return { user, isAuthenticated: true };
  }
  
  throw new Error('Invalid credentials');
};

// Logout function
export const logout = (): void => {
  currentUser = null;
  localStorage.removeItem('milkman_auth');
};

// Get current auth state
export const getAuthState = (): AuthState => {
  if (currentUser) {
    return { user: currentUser, isAuthenticated: true };
  }
  
  // Try to restore from localStorage
  try {
    const stored = localStorage.getItem('milkman_auth');
    if (stored) {
      const user = JSON.parse(stored) as User;
      currentUser = user;
      return { user, isAuthenticated: true };
    }
  } catch (e) {
    // Invalid stored data, clear it
    localStorage.removeItem('milkman_auth');
  }
  
  return { user: null, isAuthenticated: false };
};

// Role-based access control
export const hasRole = (requiredRole: UserRole): boolean => {
  const { user } = getAuthState();
  return user?.role === requiredRole;
};

export const requireRole = (requiredRole: UserRole): void => {
  if (!hasRole(requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
};

// Check if user can access admin features
export const canAccessAdmin = (): boolean => {
  return hasRole(ROLES.ADMIN);
};

// Check if user can access farmer features
export const canAccessFarmer = (): boolean => {
  return hasRole(ROLES.FARMER);
};

// Check if user can access consumer features  
export const canAccessConsumer = (): boolean => {
  return hasRole(ROLES.CONSUMER);
};

// Get user's farmer ID if they are a farmer
export const getCurrentFarmerId = (): string | null => {
  const { user } = getAuthState();
  return user?.role === ROLES.FARMER ? user.farmerId || null : null;
};