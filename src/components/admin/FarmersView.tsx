// Farmers Management View

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
  farmers,
  routes,
  rateCards,
  allCollections,
  getRouteById,
  getCollectionsByFarmer,
  type Farmer
} from '../../lib/sample-data';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { 
  Users, 
  Plus, 
  Phone,
  MapPin,
  TrendingUp,
  Calendar,
  Droplets
} from 'lucide-react';

export const FarmersView = () => {
  const [isNewFarmerOpen, setIsNewFarmerOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

  // Calculate farmer stats
  const activeFarmers = farmers.filter(f => f.status === 'active').length;
  const totalFarmers = farmers.length;
  const routeDistribution = routes.map(route => ({
    route: route.name,
    count: farmers.filter(f => f.routeId === route.id).length
  }));

  // Farmer columns
  const farmerColumns: Column<Farmer>[] = [
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      render: (farmer) => <span className="font-mono font-medium">{farmer.code}</span>
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (farmer) => (
        <div>
          <div className="font-medium">{farmer.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {farmer.phone}
          </div>
        </div>
      )
    },
    {
      key: 'routeId',
      header: 'Route',
      sortable: true,
      render: (farmer) => {
        const route = getRouteById(farmer.routeId);
        return (
          <div>
            <Badge variant="outline">{route?.code}</Badge>
            <div className="text-sm text-muted-foreground mt-1">{route?.area}</div>
          </div>
        );
      }
    },
    {
      key: 'defaultShift',
      header: 'Shift',
      sortable: true,
      render: (farmer) => (
        <Badge variant={farmer.defaultShift === 'morning' ? 'default' : 'secondary'}>
          {farmer.defaultShift === 'morning' ? '🌅 Morning' : '🌆 Evening'}
        </Badge>
      )
    },
    {
      key: 'averageFat',
      header: 'Avg Quality',
      sortable: true,
      render: (farmer) => (
        <div className="text-sm">
          <div>Fat: {farmer.averageFat.toFixed(1)}%</div>
          <div className="text-muted-foreground">SNF: {farmer.averageSnf.toFixed(1)}%</div>
        </div>
      )
    },
    {
      key: 'rateCardId',
      header: 'Rate Card',
      sortable: true,
      render: (farmer) => {
        const rateCard = rateCards.find(r => r.id === farmer.rateCardId);
        return <Badge variant={farmer.rateCardId === 'premium' ? 'default' : 'secondary'}>{rateCard?.name}</Badge>;
      }
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      sortable: true,
      render: (farmer) => new Date(farmer.joinDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (farmer) => (
        <Badge variant={farmer.status === 'active' ? 'default' : 'secondary'}>
          {farmer.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (farmer) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setSelectedFarmer(farmer)}
        >
          View Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Farmers</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage farmer profiles and performance</p>
        </div>
        <Dialog open={isNewFarmerOpen} onOpenChange={setIsNewFarmerOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Farmer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Farmer</DialogTitle>
              <DialogDescription>Register a new farmer in the system</DialogDescription>
            </DialogHeader>
            <NewFarmerForm onClose={() => setIsNewFarmerOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFarmers}</div>
            <p className="text-xs text-muted-foreground">{activeFarmers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Farmers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.filter(f => f.rateCardId === 'premium').length}
            </div>
            <p className="text-xs text-muted-foreground">High quality suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(farmers.reduce((sum, f) => sum + f.averageFat, 0) / farmers.length).toFixed(1)}% / 
              {(farmers.reduce((sum, f) => sum + f.averageSnf, 0) / farmers.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Fat / SNF</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-xs text-muted-foreground">Collection routes</p>
          </CardContent>
        </Card>
      </div>

      {/* Farmers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Farmers</CardTitle>
          <CardDescription>Complete farmer database with performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={farmers}
            columns={farmerColumns}
            searchPlaceholder="Search by name, code, phone..."
            filename="farmers"
            pageSize={15}
          />
        </CardContent>
      </Card>

      {/* Route Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Farmers by Route</CardTitle>
          <CardDescription>Distribution of farmers across collection routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routeDistribution.map((item) => (
              <div key={item.route} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{item.route}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(item.count / totalFarmers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Farmer Details Dialog */}
      {selectedFarmer && (
        <Dialog open={!!selectedFarmer} onOpenChange={() => setSelectedFarmer(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Farmer Details - {selectedFarmer.code}</DialogTitle>
              <DialogDescription>{selectedFarmer.name}</DialogDescription>
            </DialogHeader>
            <FarmerDetailsView farmer={selectedFarmer} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// New Farmer Form
const NewFarmerForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Farmer Name</Label>
          <Input id="name" placeholder="Full name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" placeholder="+91 XXXXX XXXXX" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="route">Route</Label>
          <Select>
            <SelectTrigger id="route">
              <SelectValue placeholder="Select route" />
            </SelectTrigger>
            <SelectContent>
              {routes.map(route => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift">Default Shift</Label>
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

        <div className="space-y-2">
          <Label htmlFor="bankAccount">Bank Account</Label>
          <Input id="bankAccount" placeholder="Account number" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="upiId">UPI ID</Label>
          <Input id="upiId" placeholder="name@upi" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rateCard">Rate Card</Label>
          <Select>
            <SelectTrigger id="rateCard">
              <SelectValue placeholder="Select rate card" />
            </SelectTrigger>
            <SelectContent>
              {rateCards.map(card => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <Plus className="h-4 w-4 mr-2" />
          Add Farmer
        </Button>
      </div>
    </form>
  );
};

// Farmer Details View
const FarmerDetailsView = ({ farmer }: { farmer: Farmer }) => {
  const farmerCollections = getCollectionsByFarmer(farmer.id);
  const totalLiters = farmerCollections.reduce((sum, c) => sum + c.quantity, 0);
  const totalAmount = farmerCollections.reduce((sum, c) => sum + c.amount, 0);
  const avgRate = totalAmount / totalLiters;
  const route = getRouteById(farmer.routeId);
  const rateCard = rateCards.find(r => r.id === farmer.rateCardId);

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-muted-foreground">Farmer Code</Label>
          <div className="font-mono font-medium">{farmer.code}</div>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Status</Label>
          <div>
            <Badge variant={farmer.status === 'active' ? 'default' : 'secondary'}>
              {farmer.status}
            </Badge>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Phone</Label>
          <div>{farmer.phone}</div>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Join Date</Label>
          <div>{new Date(farmer.joinDate).toLocaleDateString('en-IN')}</div>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Route</Label>
          <div>{route?.name}</div>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Default Shift</Label>
          <div className="capitalize">{farmer.defaultShift}</div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmerCollections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalLiters)} L</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgRate)}/L</div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      <div>
        <h3 className="font-medium mb-3">Quality Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Average Fat Content</div>
            <div className="text-2xl font-bold">{farmer.averageFat.toFixed(2)}%</div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Average SNF Content</div>
            <div className="text-2xl font-bold">{farmer.averageSnf.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div>
        <h3 className="font-medium mb-3">Payment Information</h3>
        <div className="space-y-2 border rounded-lg p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rate Card:</span>
            <Badge>{rateCard?.name}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bank Account:</span>
            <span className="font-mono">{farmer.bankAccount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">UPI ID:</span>
            <span className="font-mono">{farmer.upiId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
