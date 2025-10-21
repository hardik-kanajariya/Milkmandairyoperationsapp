// Farmer home dashboard

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  allCollections, 
  farmers, 
  getCollectionsByFarmer,
  getFarmerById 
} from '../../lib/sample-data';
import { getCurrentFarmerId } from '../../lib/auth';
import { formatCurrency, formatNumber, formatDate } from '../../lib/utils';
import { 
  Droplets, 
  TrendingUp, 
  Calendar,
  CreditCard,
  Phone,
  AlertCircle
} from 'lucide-react';

export const FarmerHome = () => {
  const farmerId = getCurrentFarmerId();
  const farmer = farmerId ? getFarmerById(farmerId) : null;
  
  if (!farmer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Farmer profile not found</p>
        </div>
      </div>
    );
  }

  // Get farmer's collections
  const farmerCollections = getCollectionsByFarmer(farmerId!);
  
  // Today's collection status
  const today = new Date().toISOString().split('T')[0];
  const todayCollections = farmerCollections.filter(c => 
    c.timestamp.startsWith(today)
  );
  
  // Last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayCollections = farmerCollections.filter(c => 
      c.timestamp.startsWith(dateStr)
    );
    
    const totalLiters = dayCollections.reduce((sum, c) => sum + c.quantity, 0);
    
    return {
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      liters: Math.round(totalLiters * 10) / 10
    };
  }).reverse();

  // Calculate metrics
  const recentCollections = farmerCollections.slice(0, 10);
  const avgFat = recentCollections.length > 0 
    ? recentCollections.reduce((sum, c) => sum + c.fat, 0) / recentCollections.length 
    : 0;
  const avgSnf = recentCollections.length > 0
    ? recentCollections.reduce((sum, c) => sum + c.snf, 0) / recentCollections.length 
    : 0;

  // Pending payment calculation
  const pendingCollections = farmerCollections.filter(c => c.status === 'approved');
  const pendingAmount = pendingCollections.reduce((sum, c) => sum + c.amount, 0);

  // Quality score (based on fat and SNF)
  const qualityScore = Math.min(100, Math.round(((avgFat + avgSnf) / 12) * 100));

  return (
    <div className="space-y-6 pb-20"> {/* Extra padding for mobile nav */}
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {farmer.name}</h1>
            <p className="text-muted-foreground">Farmer ID: {farmer.code}</p>
            <Badge variant="secondary" className="mt-2">
              Route {farmer.routeId} • {farmer.defaultShift} shift
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Quality Score</div>
            <div className="text-3xl font-bold text-green-600">{qualityScore}%</div>
          </div>
        </div>
      </div>

      {/* Today's Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Collection Status
          </CardTitle>
          <CardDescription>
            {formatDate(today)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayCollections.length > 0 ? (
            <div className="space-y-4">
              {todayCollections.map((collection, index) => (
                <div key={collection.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{collection.quantity}L delivered</div>
                    <div className="text-sm text-muted-foreground">
                      Fat: {collection.fat.toFixed(1)}% • SNF: {collection.snf.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(collection.amount)}</div>
                    <Badge variant={collection.status === 'approved' ? 'default' : 'secondary'}>
                      {collection.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deliveries recorded today</p>
              <Button variant="outline" className="mt-4">
                <Phone className="h-4 w-4 mr-2" />
                Request Collection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day Volume</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(last7Days.reduce((sum, day) => sum + day.liters, 0))}L
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatNumber(last7Days.reduce((sum, day) => sum + day.liters, 0) / 7)}L/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFat.toFixed(1)}% / {avgSnf.toFixed(1)}%</div>
            <Progress value={qualityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCollections.length} deliveries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volume Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Volume Trend</CardTitle>
          <CardDescription>Daily milk delivery volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days}>
              <XAxis dataKey="date" />
              <YAxis />
              <Bar dataKey="liters" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button variant="outline" className="justify-start">
            <Phone className="h-4 w-4 mr-2" />
            Request Can Pickup
          </Button>
          <Button variant="outline" className="justify-start">
            <CreditCard className="h-4 w-4 mr-2" />
            Update Bank/UPI Details
          </Button>
          <Button variant="outline" className="justify-start">
            <AlertCircle className="h-4 w-4 mr-2" />
            Report Quality Issue
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>Last 5 milk deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCollections.slice(0, 5).map((collection) => (
              <div key={collection.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                <div>
                  <div className="font-medium">{collection.quantity}L</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(collection.timestamp)} • Fat: {collection.fat.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(collection.amount)}</div>
                  <Badge variant={collection.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                    {collection.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};