// Payments view for farmer portal - shows payout history and pending payments

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  getCollectionsByFarmer, 
  getFarmerById 
} from '../../lib/sample-data';
import { getCurrentFarmerId } from '../../lib/auth';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { 
  CreditCard, 
  Calendar,
  Download,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Wallet,
  ArrowDownToLine,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line
} from 'recharts';

interface PayoutRecord {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalAmount: number;
  totalLiters: number;
  avgRate: number;
  deliveryCount: number;
  status: 'pending' | 'processing' | 'paid';
  paidDate?: string;
  transactionId?: string;
  paymentMethod?: string;
}

export const PaymentsView = () => {
  const farmerId = getCurrentFarmerId();
  const farmer = farmerId ? getFarmerById(farmerId) : null;
  const [dateRange, setDateRange] = useState<string>('90');
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
  const allCollections = getCollectionsByFarmer(farmerId!);

  // Group collections by week to create payout records
  const generatePayoutRecords = (): PayoutRecord[] => {
    const payouts: PayoutRecord[] = [];
    const today = new Date();
    
    // Generate weekly payouts for the last 13 weeks
    for (let week = 0; week < 13; week++) {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - (week * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekCollections = allCollections.filter(c => {
        const collectionDate = new Date(c.timestamp);
        return collectionDate >= weekStart && collectionDate <= weekEnd && c.status === 'approved';
      });
      
      if (weekCollections.length > 0) {
        const totalAmount = weekCollections.reduce((sum, c) => sum + c.amount, 0);
        const totalLiters = weekCollections.reduce((sum, c) => sum + c.quantity, 0);
        
        // Determine status based on week age
        let status: 'pending' | 'processing' | 'paid';
        let paidDate: string | undefined;
        let transactionId: string | undefined;
        let paymentMethod: string | undefined;
        
        if (week === 0) {
          status = 'pending'; // Current week
        } else if (week === 1) {
          status = 'processing'; // Last week
        } else {
          status = 'paid';
          paidDate = new Date(weekEnd.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days after week end
          transactionId = `TXN${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
          paymentMethod = farmer.upiId ? 'UPI' : 'Bank Transfer';
        }
        
        payouts.push({
          id: `PAYOUT-${weekStart.toISOString().split('T')[0]}`,
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          totalAmount: Math.round(totalAmount * 100) / 100,
          totalLiters: Math.round(totalLiters * 10) / 10,
          avgRate: Math.round((totalAmount / totalLiters) * 100) / 100,
          deliveryCount: weekCollections.length,
          status,
          paidDate,
          transactionId,
          paymentMethod
        });
      }
    }
    
    return payouts;
  };

  const allPayouts = generatePayoutRecords();

  // Filter by date range
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
  
  const filteredPayouts = allPayouts.filter(payout => {
    const payoutDate = new Date(payout.weekEnd);
    return payoutDate >= cutoffDate;
  });

  // Separate pending and paid
  const pendingPayouts = filteredPayouts.filter(p => p.status === 'pending' || p.status === 'processing');
  const paidPayouts = filteredPayouts.filter(p => p.status === 'paid');

  // Calculate totals
  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaid = paidPayouts.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalEarnings = filteredPayouts.reduce((sum, p) => sum + p.totalAmount, 0);

  // Chart data - monthly earnings
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthStr = month.toLocaleDateString('en-IN', { month: 'short' });
    
    const monthPayouts = allPayouts.filter(p => {
      const payoutMonth = new Date(p.weekEnd);
      return payoutMonth.getMonth() === month.getMonth() && 
             payoutMonth.getFullYear() === month.getFullYear();
    });
    
    const monthlyTotal = monthPayouts.reduce((sum, p) => sum + p.totalAmount, 0);
    
    return {
      month: monthStr,
      amount: Math.round(monthlyTotal)
    };
  }).reverse();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Payments & Payouts</h1>
        <p className="text-muted-foreground">Track your earnings and payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPayouts.length} pending week(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid (Period)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {paidPayouts.length} completed payout(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Last {dateRange} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Bank Account</div>
              <div className="font-medium">{farmer.bankAccount || 'Not configured'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">UPI ID</div>
              <div className="font-medium">{farmer.upiId || 'Not configured'}</div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Update Payment Details
          </Button>
        </CardContent>
      </Card>

      {/* Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>6-Month Earnings Trend</CardTitle>
          <CardDescription>Monthly earnings overview</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                labelStyle={{ color: '#000' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter by Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="dateRange">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payout Records Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All ({filteredPayouts.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingPayouts.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({paidPayouts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <PayoutList 
            payouts={filteredPayouts} 
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <PayoutList 
            payouts={pendingPayouts} 
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          <PayoutList 
            payouts={paidPayouts} 
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface PayoutListProps {
  payouts: PayoutRecord[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  getStatusBadge: (status: string) => JSX.Element;
}

const PayoutList = ({ payouts, expandedId, setExpandedId, getStatusBadge }: PayoutListProps) => {
  if (payouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No payout records found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Records</CardTitle>
        <CardDescription>Weekly payout history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {formatDate(payout.weekStart)} - {formatDate(payout.weekEnd)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(payout.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{formatCurrency(payout.totalAmount)}</div>
                  <div className="text-sm text-muted-foreground">
                    @{formatCurrency(payout.avgRate)}/L
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-t">
                <div>
                  <div className="text-xs text-muted-foreground">Total Volume</div>
                  <div className="font-medium">{formatNumber(payout.totalLiters)}L</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Deliveries</div>
                  <div className="font-medium">{payout.deliveryCount}</div>
                </div>
              </div>

              {payout.status === 'paid' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setExpandedId(expandedId === payout.id ? null : payout.id)}
                >
                  {expandedId === payout.id ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Payment Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      View Payment Details
                    </>
                  )}
                </Button>
              )}

              {expandedId === payout.id && payout.status === 'paid' && (
                <div className="mt-4 pt-4 border-t space-y-2 bg-muted/50 rounded p-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Payment Date:</span>
                      <div className="font-medium">{formatDate(payout.paidDate!)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment Method:</span>
                      <div className="font-medium">{payout.paymentMethod}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <div className="font-medium font-mono text-xs">{payout.transactionId}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
