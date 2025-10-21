// Admin dashboard with KPIs and charts

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  collectionSessions, 
  allCollections, 
  farmers, 
  routes,
  getTodaysCollections,
  getWeeklyPayouts,
  getFarmerById,
  getRouteById
} from '../../lib/sample-data';
import { formatCurrency, formatNumber, getCurrentDateIST } from '../../lib/utils';
import { 
  Droplets, 
  TrendingUp, 
  AlertTriangle, 
  CreditCard,
  Package,
  Truck,
  Clock,
  MessageSquare
} from 'lucide-react';

// Calculate dashboard metrics
const calculateMetrics = () => {
  const today = getCurrentDateIST();
  const todaySessions = getTodaysCollections();
  const thisWeekPayouts = getWeeklyPayouts(today);
  
  // Today's collection
  const todayLiters = todaySessions.reduce((sum, session) => sum + session.totalLiters, 0);
  
  // MTD collection (first to today)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const mtdSessions = collectionSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
  });
  const mtdLiters = mtdSessions.reduce((sum, session) => sum + session.totalLiters, 0);
  
  // Average quality
  const recentCollections = allCollections.slice(0, 100); // Last 100 collections
  const avgFat = recentCollections.reduce((sum, c) => sum + c.fat, 0) / recentCollections.length;
  const avgSnf = recentCollections.reduce((sum, c) => sum + c.snf, 0) / recentCollections.length;
  
  // Wastage % (simulated)
  const wastagePercent = 2.3;
  
  // Weekly payout
  const weeklyPayoutAmount = thisWeekPayouts.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    todayLiters,
    mtdLiters,
    avgFat,
    avgSnf,
    wastagePercent,
    weeklyPayoutAmount,
    pendingOrders: 23,
    onTimeDelivery: 94.5,
    complaints: 3
  };
};

// Chart data
const collectionByRoute = routes.map(route => {
  const routeCollections = allCollections.filter(c => {
    const farmer = getFarmerById(c.farmerId);
    return farmer?.routeId === route.id;
  });
  const totalLiters = routeCollections.reduce((sum, c) => sum + c.quantity, 0);
  
  return {
    route: route.code,
    liters: Math.round(totalLiters)
  };
});

const qualityTrend = collectionSessions.slice(0, 14).reverse().map(session => ({
  date: new Date(session.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  fat: session.averageFat,
  snf: session.averageSnf
}));

const productYield = [
  { product: 'Toned Milk', yield: 85, expected: 88 },
  { product: 'Full Cream', yield: 92, expected: 90 },
  { product: 'Curd', yield: 78, expected: 80 },
  { product: 'Paneer', yield: 88, expected: 85 },
  { product: 'Ghee', yield: 95, expected: 92 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdminDashboard = () => {
  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Dairy operations overview for {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Collection</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.todayLiters)} L</div>
            <p className="text-xs text-muted-foreground">
              MTD: {formatNumber(metrics.mtdLiters)} L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgFat.toFixed(1)}% / {metrics.avgSnf.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Fat / SNF content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wastage</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.wastagePercent}%</div>
            <Progress value={metrics.wastagePercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Payout</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.weeklyPayoutAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Due to farmers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Finished goods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">To fulfill</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onTimeDelivery}%</div>
            <Progress value={metrics.onTimeDelivery} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complaints}</div>
            <Badge variant="secondary" className="mt-1">Open</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Collection by Route</CardTitle>
            <CardDescription>Last 30 days total collection</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={collectionByRoute}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis />
                <Bar dataKey="liters" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Trend</CardTitle>
            <CardDescription>Average fat and SNF content</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Line type="monotone" dataKey="fat" stroke="#8884d8" name="Fat %" />
                <Line type="monotone" dataKey="snf" stroke="#82ca9d" name="SNF %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Yield */}
      <Card>
        <CardHeader>
          <CardTitle>Product Yield Analysis</CardTitle>
          <CardDescription>Actual vs expected yield by product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productYield.map((product, index) => (
              <div key={product.product} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium">{product.product}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Actual: {product.yield}%</span>
                    <span>Expected: {product.expected}%</span>
                  </div>
                  <Progress 
                    value={(product.yield / product.expected) * 100} 
                    className="h-2"
                  />
                </div>
                <Badge 
                  variant={product.yield >= product.expected ? "default" : "secondary"}
                  className="text-xs"
                >
                  {product.yield >= product.expected ? "✓" : "⚠"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};