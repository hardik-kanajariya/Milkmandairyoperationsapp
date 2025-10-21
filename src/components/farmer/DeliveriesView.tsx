// Deliveries view for farmer portal - shows collection history

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { 
  getCollectionsByFarmer, 
  getFarmerById,
  MilkCollection 
} from '../../lib/sample-data';
import { getCurrentFarmerId } from '../../lib/auth';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { 
  Droplets, 
  Calendar,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip
} from 'recharts';

export const DeliveriesView = () => {
  const farmerId = getCurrentFarmerId();
  const farmer = farmerId ? getFarmerById(farmerId) : null;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  // Get all collections
  const allDeliveries = getCollectionsByFarmer(farmerId!);

  // Filter by date range
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
  
  const filteredDeliveries = allDeliveries.filter(delivery => {
    const deliveryDate = new Date(delivery.timestamp);
    const matchesDateRange = deliveryDate >= cutoffDate;
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      delivery.canId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDateRange && matchesStatus && matchesSearch;
  });

  // Calculate summary stats
  const totalQuantity = filteredDeliveries.reduce((sum, d) => sum + d.quantity, 0);
  const totalAmount = filteredDeliveries.reduce((sum, d) => sum + d.amount, 0);
  const avgFat = filteredDeliveries.length > 0 
    ? filteredDeliveries.reduce((sum, d) => sum + d.fat, 0) / filteredDeliveries.length 
    : 0;
  const avgSnf = filteredDeliveries.length > 0
    ? filteredDeliveries.reduce((sum, d) => sum + d.snf, 0) / filteredDeliveries.length 
    : 0;
  const avgRate = filteredDeliveries.length > 0
    ? filteredDeliveries.reduce((sum, d) => sum + d.rate, 0) / filteredDeliveries.length
    : 0;

  // Status counts
  const statusCounts = {
    pending: filteredDeliveries.filter(d => d.status === 'pending').length,
    approved: filteredDeliveries.filter(d => d.status === 'approved').length,
    rejected: filteredDeliveries.filter(d => d.status === 'rejected').length
  };

  // Chart data - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayDeliveries = allDeliveries.filter(d => 
      d.timestamp.startsWith(dateStr)
    );
    
    const liters = dayDeliveries.reduce((sum, d) => sum + d.quantity, 0);
    const avgFat = dayDeliveries.length > 0
      ? dayDeliveries.reduce((sum, d) => sum + d.fat, 0) / dayDeliveries.length
      : 0;
    
    return {
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      liters: Math.round(liters * 10) / 10,
      fat: Math.round(avgFat * 10) / 10
    };
  }).reverse();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Milk Deliveries</h1>
        <p className="text-muted-foreground">Track your collection history and quality metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalQuantity)}L</div>
            <p className="text-xs text-muted-foreground">
              {filteredDeliveries.length} deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(avgRate)}/L
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
            <p className="text-xs text-muted-foreground">Fat / SNF</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge variant="secondary">{statusCounts.pending} Pending</Badge>
              <Badge>{statusCounts.approved} OK</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>7-Day Volume Trend</CardTitle>
            <CardDescription>Daily milk delivery in liters</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7Days}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="liters" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fat Content Trend</CardTitle>
            <CardDescription>Average fat percentage per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={last7Days}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="fat" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by Can ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="dateRange">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateRange('30');
            }}>
              Clear Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Records</CardTitle>
          <CardDescription>
            Showing {filteredDeliveries.length} of {allDeliveries.length} deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deliveries found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Can: {delivery.canId}</span>
                        <Badge variant={getStatusVariant(delivery.status)} className="text-xs">
                          {getStatusIcon(delivery.status)}
                          <span className="ml-1">{delivery.status}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(delivery.timestamp)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(delivery.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        @{formatCurrency(delivery.rate)}/L
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3 border-t border-b my-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Quantity</div>
                      <div className="font-medium">{delivery.quantity}L</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Fat</div>
                      <div className="font-medium">{delivery.fat.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">SNF</div>
                      <div className="font-medium">{delivery.snf.toFixed(2)}%</div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setExpandedId(expandedId === delivery.id ? null : delivery.id)}
                  >
                    {expandedId === delivery.id ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show Details
                      </>
                    )}
                  </Button>

                  {expandedId === delivery.id && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Temperature:</span>
                          <span className="ml-2 font-medium">{delivery.temperature.toFixed(1)}°C</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lactometer:</span>
                          <span className="ml-2 font-medium">{delivery.lactometer.toFixed(1)} LR</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Session ID:</span>
                          <span className="ml-2 font-medium text-xs">{delivery.sessionId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Collection ID:</span>
                          <span className="ml-2 font-medium text-xs">{delivery.id}</span>
                        </div>
                      </div>
                      
                      {/* Adultery checks */}
                      <div className="bg-muted/50 rounded p-3 mt-3">
                        <div className="text-sm font-medium mb-2">Quality Checks</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            {delivery.adulteryChecks.waterAdded ? (
                              <XCircle className="h-3 w-3 text-red-600" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            )}
                            <span>Water</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {delivery.adulteryChecks.starchAdded ? (
                              <XCircle className="h-3 w-3 text-red-600" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            )}
                            <span>Starch</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {delivery.adulteryChecks.detergent ? (
                              <XCircle className="h-3 w-3 text-red-600" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            )}
                            <span>Detergent</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
