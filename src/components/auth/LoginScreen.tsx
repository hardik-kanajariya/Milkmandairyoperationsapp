// Login screen component

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { sampleUsers } from '../../lib/sample-data';
import { formatPhoneNumber } from '../../lib/utils';
import { Milk, Users, ShoppingCart, Loader2 } from 'lucide-react';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (userEmail: string) => {
    setError('');
    setLoading(true);
    
    try {
      await login(userEmail, 'demo123');
      // Login successful - user will be redirected automatically
    } catch (err) {
      setError('Demo login failed. Please try again.');
      setLoading(false);
    }
    // Don't set loading to false on success - let the redirect happen
  };

  const adminUser = sampleUsers.find(u => u.role === 'admin');
  const farmerUser = sampleUsers.find(u => u.role === 'farmer');
  const consumerUser = sampleUsers.find(u => u.role === 'consumer');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Milk className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Milkman</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Dairy Operations Management System</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="demo">Demo Accounts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="text-destructive text-sm">{error}</div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="demo">
            <Card>
              <CardHeader>
                <CardTitle>Demo Accounts</CardTitle>
                <CardDescription>
                  Try different user roles with these demo accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Admin Demo */}
                {adminUser && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="font-medium">{adminUser.name}</div>
                        <div className="text-sm text-muted-foreground">{adminUser.email}</div>
                      </div>
                      <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full dairy operations management, analytics, and farmer management
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDemoLogin(adminUser.email)}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? 'Logging in...' : 'Login as Admin'}
                    </Button>
                  </div>
                )}

                {/* Farmer Demo */}
                {farmerUser && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Milk className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">{farmerUser.name}</div>
                        <div className="text-sm text-muted-foreground">{farmerUser.email}</div>
                      </div>
                      <Badge variant="secondary">Farmer</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View milk deliveries, payments, and quality metrics
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDemoLogin(farmerUser.email)}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? 'Logging in...' : 'Login as Farmer'}
                    </Button>
                  </div>
                )}

                {/* Consumer Demo */}
                {consumerUser && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">{consumerUser.name}</div>
                        <div className="text-sm text-muted-foreground">{consumerUser.email}</div>
                      </div>
                      <Badge variant="secondary">Consumer</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Browse products, place orders, and manage subscriptions
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDemoLogin(consumerUser.email)}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? 'Logging in...' : 'Login as Consumer'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Demo System • Currency: INR (₹) • Timezone: Asia/Kolkata</p>
        </div>
      </div>
    </div>
  );
};