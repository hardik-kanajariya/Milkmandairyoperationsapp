// Milk Collection Management View

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataTable, Column } from '../shared/DataTable';
import { 
  collectionSessions, 
  allCollections,
  farmers,
  routes,
  getFarmerById,
  getRouteById,
  rateCards,
  type CollectionSession,
  type MilkCollection
} from '../../lib/sample-data';
import { formatCurrency, formatNumber, getCurrentDateIST } from '../../lib/utils';
import { 
  Milk, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Thermometer,
  Droplets
} from 'lucide-react';

export const CollectionView = () => {
  const [selectedSession, setSelectedSession] = useState<CollectionSession | null>(null);
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);

  // Session columns
  const sessionColumns: Column<CollectionSession>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (session) => new Date(session.date).toLocaleDateString('en-IN', { 
        day: '2-digit',
        month: 'short',
        year: 'numeric' 
      })
    },
    {
      key: 'routeId',
      header: 'Route',
      sortable: true,
      render: (session) => {
        const route = getRouteById(session.routeId);
        return <Badge variant="outline">{route?.code}</Badge>;
      }
    },
    {
      key: 'shift',
      header: 'Shift',
      sortable: true,
      render: (session) => (
        <Badge variant={session.shift === 'morning' ? 'default' : 'secondary'}>
          {session.shift === 'morning' ? '🌅 Morning' : '🌆 Evening'}
        </Badge>
      )
    },
    {
      key: 'totalLiters',
      header: 'Volume (L)',
      sortable: true,
      render: (session) => <span className="font-medium">{formatNumber(session.totalLiters)}</span>
    },
    {
      key: 'averageFat',
      header: 'Avg Fat %',
      sortable: true,
      render: (session) => `${session.averageFat.toFixed(2)}%`
    },
    {
      key: 'averageSnf',
      header: 'Avg SNF %',
      sortable: true,
      render: (session) => `${session.averageSnf.toFixed(2)}%`
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: (session) => <span className="font-medium">{formatCurrency(session.totalAmount)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (session) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          open: 'secondary',
          completed: 'default',
          approved: 'outline'
        };
        return <Badge variant={variants[session.status]}>{session.status}</Badge>;
      }
    },
    {
      key: 'collections',
      header: 'Collections',
      render: (session) => session.collections.length
    }
  ];

  // Collection columns for detailed view
  const collectionColumns: Column<MilkCollection>[] = [
    {
      key: 'farmerId',
      header: 'Farmer',
      sortable: true,
      render: (collection) => {
        const farmer = getFarmerById(collection.farmerId);
        return (
          <div>
            <div className="font-medium">{farmer?.name}</div>
            <div className="text-sm text-muted-foreground">{farmer?.code}</div>
          </div>
        );
      }
    },
    {
      key: 'canId',
      header: 'Can ID',
      sortable: true
    },
    {
      key: 'quantity',
      header: 'Quantity (L)',
      sortable: true,
      render: (collection) => <span className="font-medium">{formatNumber(collection.quantity)}</span>
    },
    {
      key: 'fat',
      header: 'Fat %',
      sortable: true,
      render: (collection) => `${collection.fat.toFixed(2)}%`
    },
    {
      key: 'snf',
      header: 'SNF %',
      sortable: true,
      render: (collection) => `${collection.snf.toFixed(2)}%`
    },
    {
      key: 'temperature',
      header: 'Temp (°C)',
      sortable: true,
      render: (collection) => (
        <span className={collection.temperature > 34 ? 'text-destructive' : ''}>
          {collection.temperature.toFixed(1)}°C
        </span>
      )
    },
    {
      key: 'rate',
      header: 'Rate/L',
      sortable: true,
      render: (collection) => formatCurrency(collection.rate)
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (collection) => <span className="font-medium">{formatCurrency(collection.amount)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (collection) => {
        const hasIssues = 
          collection.adulteryChecks.waterAdded || 
          collection.adulteryChecks.starchAdded || 
          collection.adulteryChecks.detergent ||
          collection.temperature > 34;
        
        if (hasIssues) {
          return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Issue</Badge>;
        }
        
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          pending: 'secondary',
          approved: 'default',
          rejected: 'destructive'
        };
        return <Badge variant={variants[collection.status]}>{collection.status}</Badge>;
      }
    }
  ];

  // Calculate today's stats
  const todaySessions = collectionSessions.filter(s => s.date === getCurrentDateIST());
  const todayLiters = todaySessions.reduce((sum, s) => sum + s.totalLiters, 0);
  const todayAmount = todaySessions.reduce((sum, s) => sum + s.totalAmount, 0);
  const todayCollections = todaySessions.reduce((sum, s) => s.collections.length + sum, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Milk Collection</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track and manage milk collection sessions</p>
        </div>
        <Dialog open={isNewCollectionOpen} onOpenChange={setIsNewCollectionOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Milk Collection</DialogTitle>
              <DialogDescription>Add a new milk collection entry</DialogDescription>
            </DialogHeader>
            <NewCollectionForm onClose={() => setIsNewCollectionOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Milk className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-xs text-muted-foreground">Across all routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Volume</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(todayLiters)} L</div>
            <p className="text-xs text-muted-foreground">{todayCollections} collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Value</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayAmount)}</div>
            <p className="text-xs text-muted-foreground">Total payable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {collectionSessions.filter(s => s.status === 'open' || s.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Sessions to review</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="sessions">Collection Sessions</TabsTrigger>
          <TabsTrigger value="all-collections">All Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Sessions</CardTitle>
              <CardDescription>All milk collection sessions organized by route and shift</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={collectionSessions}
                columns={sessionColumns}
                searchPlaceholder="Search sessions..."
                filename="collection-sessions"
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Collections</CardTitle>
              <CardDescription>Detailed view of all milk collections from farmers</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={allCollections}
                columns={collectionColumns}
                searchPlaceholder="Search by farmer, can ID..."
                filename="all-collections"
                pageSize={20}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// New Collection Form Component
const NewCollectionForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="canId">Can ID</Label>
          <Input id="canId" placeholder="e.g., CAN001" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity (Liters)</Label>
          <Input id="quantity" type="number" step="0.1" placeholder="0.0" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fat">Fat %</Label>
          <Input id="fat" type="number" step="0.1" placeholder="0.0" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="snf">SNF %</Label>
          <Input id="snf" type="number" step="0.1" placeholder="0.0" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature (°C)</Label>
          <Input id="temperature" type="number" step="0.1" placeholder="0.0" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lactometer">Lactometer Reading</Label>
          <Input id="lactometer" type="number" step="0.1" placeholder="0.0" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift">Shift</Label>
          <Select>
            <SelectTrigger id="shift">
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Save Collection
        </Button>
      </div>
    </form>
  );
};
