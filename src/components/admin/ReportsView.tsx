// Reports & Analytics View

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { 
  collectionSessions,
  allCollections,
  farmers,
  routes,
  products
} from '../../lib/sample-data';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { 
  BarChart3, 
  Download,
  TrendingUp,
  Users,
  Droplets,
  Package
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export const ReportsView = () => {
  // Collection by route
  const collectionByRoute = routes.map(route => {
    const routeCollections = allCollections.filter(c => {
      const farmer = farmers.find(f => f.id === c.farmerId);
      return farmer?.routeId === route.id;
    });
    return {
      route: route.code,
      liters: routeCollections.reduce((sum, c) => sum + c.quantity, 0),
      amount: routeCollections.reduce((sum, c) => sum + c.amount, 0)
    };
  });

  // Daily collection trend (last 14 days)
  const dailyTrend = collectionSessions
    .slice(0, 56) // 14 days * 2 shifts * 2 routes avg
    .reduce((acc, session) => {
      const date = new Date(session.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.liters += session.totalLiters;
        existing.amount += session.totalAmount;
      } else {
        acc.push({
          date,
          liters: session.totalLiters,
          amount: session.totalAmount
        });
      }
      return acc;
    }, [] as { date: string; liters: number; amount: number }[])
    .reverse()
    .slice(0, 14);

  // Farmer performance (top 10)
  const farmerPerformance = farmers
    .map(farmer => {
      const farmerCollections = allCollections.filter(c => c.farmerId === farmer.id);
      return {
        name: farmer.name,
        code: farmer.code,
        totalLiters: farmerCollections.reduce((sum, c) => sum + c.quantity, 0),
        totalAmount: farmerCollections.reduce((sum, c) => sum + c.amount, 0),
        avgFat: farmerCollections.length > 0 
          ? farmerCollections.reduce((sum, c) => sum + c.fat, 0) / farmerCollections.length 
          : 0
      };
    })
    .sort((a, b) => b.totalLiters - a.totalLiters)
    .slice(0, 10);

  // Quality distribution
  const qualityDistribution = [
    { name: 'Excellent (>4.5%)', value: allCollections.filter(c => c.fat > 4.5).length },
    { name: 'Good (4.0-4.5%)', value: allCollections.filter(c => c.fat >= 4.0 && c.fat <= 4.5).length },
    { name: 'Average (3.5-4.0%)', value: allCollections.filter(c => c.fat >= 3.5 && c.fat < 4.0).length },
    { name: 'Below Avg (<3.5%)', value: allCollections.filter(c => c.fat < 3.5).length }
  ];

  // Product sales distribution (simulated)
  const productSales = products.map((product, index) => ({
    name: product.name,
    sales: 1000 + Math.random() * 4000,
    revenue: product.price * (1000 + Math.random() * 4000)
  }));

  // Financial summary
  const totalRevenue = allCollections.reduce((sum, c) => sum + c.amount, 0);
  const totalLiters = allCollections.reduce((sum, c) => sum + c.quantity, 0);
  const avgRate = totalRevenue / totalLiters;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-sm md:text-base text-muted-foreground">Business insights and performance metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalLiters)} L</div>
            <p className="text-xs text-muted-foreground">Across all routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rate</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgRate)}/L</div>
            <p className="text-xs text-muted-foreground">Per liter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmers.length}</div>
            <p className="text-xs text-muted-foreground">Contributing regularly</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="collection" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="collection">Collection</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        {/* Collection Reports */}
        <TabsContent value="collection" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Collection Trend</CardTitle>
                <CardDescription>Milk collection volume over last 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="liters" stroke="#8884d8" name="Liters" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection by Route</CardTitle>
                <CardDescription>Distribution across routes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={collectionByRoute}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="liters" fill="#8884d8" name="Liters" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Farmers</CardTitle>
              <CardDescription>Highest volume contributors</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={farmerPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="code" type="category" width={60} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalLiters" fill="#82ca9d" name="Total Liters" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Route</CardTitle>
                <CardDescription>Financial performance by route</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={collectionByRoute}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#82ca9d" name="Amount (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
                <CardDescription>Revenue over last 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="amount" stroke="#82ca9d" name="Revenue (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Reports */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality Distribution</CardTitle>
                <CardDescription>Milk quality by fat content</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={qualityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {qualityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Quality Farmers</CardTitle>
                <CardDescription>Highest fat content suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={farmerPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="code" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgFat" fill="#FFBB28" name="Avg Fat %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Sales Volume</CardTitle>
                <CardDescription>Units sold by product</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productSales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Revenue</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productSales}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="revenue"
                    >
                      {productSales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
