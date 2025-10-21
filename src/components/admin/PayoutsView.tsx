// Payouts & Ledger Management View

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataTable, Column } from '../shared/DataTable';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  allCollections,
  farmers,
  getFarmerById,
  type Farmer
} from '../../lib/sample-data';
import { formatCurrency, formatNumber, cn } from '../../lib/utils';
import { 
  CreditCard, 
  Plus,
  Download,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface Payout {
  id: string;
  farmerId: string;
  amount: number;
  fromDate: string;
  toDate: string;
  status: 'pending' | 'processed' | 'completed';
  paymentMethod: 'bank' | 'upi' | 'cash';
  transactionId?: string;
  processedDate?: string;
}

interface LedgerEntry {
  id: string;
  farmerId: string;
  date: string;
  type: 'collection' | 'payment' | 'advance' | 'deduction';
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export const PayoutsView = () => {
  const [isNewPayoutOpen, setIsNewPayoutOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });

  // Generate payout data from collections
  const generatePayouts = (): Payout[] => {
    const payoutMap = new Map<string, number>();
    
    // Group collections by farmer for last 7 days
    allCollections
      .filter(c => {
        const collectionDate = new Date(c.timestamp);
        return collectionDate >= selectedDateRange.from && collectionDate <= selectedDateRange.to;
      })
      .forEach(collection => {
        const current = payoutMap.get(collection.farmerId) || 0;
        payoutMap.set(collection.farmerId, current + collection.amount);
      });

    return Array.from(payoutMap.entries()).map(([farmerId, amount], index) => ({
      id: `PAY${String(index + 1).padStart(4, '0')}`,
      farmerId,
      amount,
      fromDate: selectedDateRange.from.toISOString(),
      toDate: selectedDateRange.to.toISOString(),
      status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'processed' : 'pending',
      paymentMethod: Math.random() > 0.5 ? 'upi' : Math.random() > 0.3 ? 'bank' : 'cash',
      transactionId: Math.random() > 0.5 ? `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined,
      processedDate: Math.random() > 0.6 ? new Date().toISOString() : undefined
    }));
  };

  const payouts = useMemo(() => generatePayouts(), [selectedDateRange]);

  // Generate ledger entries
  const generateLedgerEntries = (): LedgerEntry[] => {
    const entries: LedgerEntry[] = [];
    const farmerBalances = new Map<string, number>();

    // Get collections and sort by timestamp
    const sortedCollections = [...allCollections]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(0, 200); // Last 200 transactions

    sortedCollections.forEach((collection, index) => {
      const currentBalance = farmerBalances.get(collection.farmerId) || 0;
      const newBalance = currentBalance + collection.amount;
      farmerBalances.set(collection.farmerId, newBalance);

      entries.push({
        id: `LED${String(index + 1).padStart(5, '0')}`,
        farmerId: collection.farmerId,
        date: collection.timestamp,
        type: 'collection',
        description: `Milk collection - ${collection.quantity.toFixed(1)}L @ ${collection.fat.toFixed(1)}% fat`,
        debit: collection.amount,
        credit: 0,
        balance: newBalance
      });

      // Randomly add payments
      if (Math.random() > 0.85 && newBalance > 1000) {
        const paymentAmount = Math.floor(newBalance * 0.8);
        const balanceAfterPayment = newBalance - paymentAmount;
        farmerBalances.set(collection.farmerId, balanceAfterPayment);

        entries.push({
          id: `LED${String(entries.length + 1).padStart(5, '0')}`,
          farmerId: collection.farmerId,
          date: new Date(new Date(collection.timestamp).getTime() + 86400000).toISOString(),
          type: 'payment',
          description: 'Weekly payout - Bank transfer',
          debit: 0,
          credit: paymentAmount,
          balance: balanceAfterPayment
        });
      }
    });

    return entries.reverse();
  };

  const ledgerEntries = useMemo(() => generateLedgerEntries(), []);

  // Stats
  const totalPayout = payouts.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const completedPayouts = payouts.filter(p => p.status === 'completed');

  // Payout columns
  const payoutColumns: Column<Payout>[] = [
    {
      key: 'id',
      header: 'Payout ID',
      sortable: true,
      render: (payout) => <span className="font-mono font-medium">{payout.id}</span>
    },
    {
      key: 'farmerId',
      header: 'Farmer',
      sortable: true,
      render: (payout) => {
        const farmer = getFarmerById(payout.farmerId);
        return (
          <div>
            <div className="font-medium">{farmer?.name}</div>
            <div className="text-sm text-muted-foreground">{farmer?.code}</div>
          </div>
        );
      }
    },
    {
      key: 'fromDate',
      header: 'Period',
      sortable: true,
      render: (payout) => (
        <div className="text-sm">
          <div>{new Date(payout.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
          <div className="text-muted-foreground">
            to {new Date(payout.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (payout) => <span className="font-medium">{formatCurrency(payout.amount)}</span>
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      sortable: true,
      render: (payout) => {
        const methods = {
          bank: { label: 'Bank Transfer', variant: 'default' as const },
          upi: { label: 'UPI', variant: 'secondary' as const },
          cash: { label: 'Cash', variant: 'outline' as const }
        };
        const method = methods[payout.paymentMethod];
        return <Badge variant={method.variant}>{method.label}</Badge>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (payout) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          pending: 'secondary',
          processed: 'outline',
          completed: 'default'
        };
        return <Badge variant={variants[payout.status]}>{payout.status}</Badge>;
      }
    },
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (payout) => (
        <span className="font-mono text-sm">{payout.transactionId || '-'}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (payout) => (
        <div className="flex gap-1">
          {payout.status === 'pending' && (
            <Button variant="ghost" size="sm">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Ledger columns
  const ledgerColumns: Column<LedgerEntry>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (entry) => (
        <div className="text-sm">
          {new Date(entry.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )
    },
    {
      key: 'farmerId',
      header: 'Farmer',
      sortable: true,
      render: (entry) => {
        const farmer = getFarmerById(entry.farmerId);
        return (
          <div>
            <div className="font-medium">{farmer?.name}</div>
            <div className="text-sm text-muted-foreground">{farmer?.code}</div>
          </div>
        );
      }
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (entry) => {
        const types = {
          collection: { label: 'Collection', variant: 'default' as const },
          payment: { label: 'Payment', variant: 'secondary' as const },
          advance: { label: 'Advance', variant: 'outline' as const },
          deduction: { label: 'Deduction', variant: 'destructive' as const }
        };
        const type = types[entry.type];
        return <Badge variant={type.variant}>{type.label}</Badge>;
      }
    },
    {
      key: 'description',
      header: 'Description',
      render: (entry) => <div className="max-w-xs truncate">{entry.description}</div>
    },
    {
      key: 'debit',
      header: 'Debit',
      sortable: true,
      render: (entry) => (
        <span className={cn("font-medium", entry.debit > 0 && "text-green-600")}>
          {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
        </span>
      )
    },
    {
      key: 'credit',
      header: 'Credit',
      sortable: true,
      render: (entry) => (
        <span className={cn("font-medium", entry.credit > 0 && "text-red-600")}>
          {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
        </span>
      )
    },
    {
      key: 'balance',
      header: 'Balance',
      sortable: true,
      render: (entry) => <span className="font-medium">{formatCurrency(entry.balance)}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Payouts & Ledger</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage farmer payments and transaction ledger</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewPayoutOpen} onOpenChange={setIsNewPayoutOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Process Payout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Payout</DialogTitle>
                <DialogDescription>Create a new payout for farmers</DialogDescription>
              </DialogHeader>
              <NewPayoutForm onClose={() => setIsNewPayoutOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayout)}</div>
            <p className="text-xs text-muted-foreground">{payouts.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayouts.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pendingPayouts.reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayouts.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(completedPayouts.reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farmers Paid</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(completedPayouts.map(p => p.farmerId)).size}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Transactions</CardTitle>
              <CardDescription>All farmer payouts and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={payouts}
                columns={payoutColumns}
                searchPlaceholder="Search by farmer, ID..."
                filename="payouts"
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Ledger</CardTitle>
              <CardDescription>Complete transaction history with running balances</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={ledgerEntries}
                columns={ledgerColumns}
                searchPlaceholder="Search transactions..."
                filename="ledger"
                pageSize={20}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Balances</CardTitle>
              <CardDescription>Current outstanding amounts for each farmer</CardDescription>
            </CardHeader>
            <CardContent>
              <OutstandingBalances />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// New Payout Form
const NewPayoutForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="farmer">Farmer</Label>
        <Select>
          <SelectTrigger id="farmer">
            <SelectValue placeholder="Select farmer" />
          </SelectTrigger>
          <SelectContent>
            {farmers.slice(0, 20).map(farmer => (
              <SelectItem key={farmer.id} value={farmer.id}>
                {farmer.code} - {farmer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" placeholder="0.00" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Payment Method</Label>
        <Select>
          <SelectTrigger id="method">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank">Bank Transfer</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" placeholder="Optional notes" />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Process Payout
        </Button>
      </div>
    </form>
  );
};

// Outstanding Balances Component
const OutstandingBalances = () => {
  const outstandingData = farmers.map(farmer => {
    const collections = allCollections.filter(c => c.farmerId === farmer.id);
    const totalEarned = collections.reduce((sum, c) => sum + c.amount, 0);
    const paid = totalEarned * (0.7 + Math.random() * 0.2); // Simulate 70-90% paid
    const outstanding = totalEarned - paid;

    return {
      farmer,
      totalEarned,
      paid,
      outstanding
    };
  }).filter(item => item.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding);

  return (
    <div className="space-y-3">
      {outstandingData.slice(0, 20).map((item) => (
        <div key={item.farmer.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="font-medium">{item.farmer.name}</div>
            <div className="text-sm text-muted-foreground">{item.farmer.code}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{formatCurrency(item.outstanding)}</div>
            <div className="text-sm text-muted-foreground">
              Paid: {formatCurrency(item.paid)} / {formatCurrency(item.totalEarned)}
            </div>
          </div>
          <Button variant="outline" size="sm" className="ml-4">
            Pay Now
          </Button>
        </div>
      ))}
    </div>
  );
};
