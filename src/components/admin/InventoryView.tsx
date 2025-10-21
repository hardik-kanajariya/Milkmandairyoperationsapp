// Inventory Management View

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
import { Progress } from '../ui/progress';
import { products, type Product } from '../../lib/sample-data';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { 
  Package, 
  Plus,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  CheckCircle2
} from 'lucide-react';

interface InventoryItem {
  id: string;
  product: Product;
  lotNumber: string;
  quantity: number;
  unit: string;
  manufactureDate: string;
  expiryDate: string;
  location: string;
  status: 'available' | 'reserved' | 'expired' | 'low-stock';
  reorderLevel: number;
}

interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  from?: string;
  to?: string;
  reason: string;
  timestamp: string;
  operator: string;
}

// Generate inventory data
const generateInventory = (): InventoryItem[] => {
  const locations = ['Cold Storage A', 'Cold Storage B', 'Warehouse 1', 'Warehouse 2', 'Dispatch Area'];
  const inventory: InventoryItem[] = [];

  products.forEach((product, index) => {
    // Create 2-5 lots per product
    const numLots = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numLots; i++) {
      const manufactureDate = new Date();
      manufactureDate.setDate(manufactureDate.getDate() - Math.floor(Math.random() * 7));
      const expiryDate = new Date(manufactureDate);
      expiryDate.setDate(expiryDate.getDate() + (product.category === 'Milk' ? 3 : 7));
      
      const quantity = 100 + Math.floor(Math.random() * 900);
      const reorderLevel = 200;
      const status = 
        expiryDate < new Date() ? 'expired' :
        quantity < reorderLevel ? 'low-stock' :
        Math.random() > 0.8 ? 'reserved' :
        'available';

      inventory.push({
        id: `INV${String(inventory.length + 1).padStart(4, '0')}`,
        product,
        lotNumber: `LOT${manufactureDate.getFullYear()}${String(manufactureDate.getMonth() + 1).padStart(2, '0')}${String(index * 10 + i).padStart(4, '0')}`,
        quantity,
        unit: product.unit,
        manufactureDate: manufactureDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        location: locations[Math.floor(Math.random() * locations.length)],
        status,
        reorderLevel
      });
    }
  });

  return inventory;
};

// Generate stock movements
const generateStockMovements = (inventory: InventoryItem[]): StockMovement[] => {
  const operators = ['Ramesh Kumar', 'Suresh Patil', 'Vijay Reddy'];
  const reasons = {
    in: ['Production', 'Purchase', 'Return from customer'],
    out: ['Sale', 'Dispatch', 'Wastage'],
    adjustment: ['Stock count adjustment', 'Damage', 'Quality rejection'],
    return: ['Customer return', 'Defective product', 'Expired']
  };
  
  const movements: StockMovement[] = [];

  for (let i = 0; i < 100; i++) {
    const item = inventory[Math.floor(Math.random() * inventory.length)];
    const type = ['in', 'out', 'adjustment', 'return'][Math.floor(Math.random() * 4)] as StockMovement['type'];
    const reasonList = reasons[type];
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 168)); // Last 7 days

    movements.push({
      id: `MOV${String(i + 1).padStart(5, '0')}`,
      itemId: item.id,
      type,
      quantity: Math.floor(Math.random() * 50) + 10,
      from: type === 'out' ? item.location : 'Production',
      to: type === 'in' ? item.location : 'Dispatch',
      reason: reasonList[Math.floor(Math.random() * reasonList.length)],
      timestamp: timestamp.toISOString(),
      operator: operators[Math.floor(Math.random() * operators.length)]
    });
  }

  return movements.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const InventoryView = () => {
  const [inventory] = useState(generateInventory());
  const [movements] = useState(generateStockMovements(inventory));
  const [isNewMovementOpen, setIsNewMovementOpen] = useState(false);

  // Stats
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(i => i.status === 'low-stock').length;
  const expiredItems = inventory.filter(i => i.status === 'expired').length;
  const totalValue = inventory.reduce((sum, item) => {
    return sum + (item.quantity * item.product.price);
  }, 0);

  // Inventory columns
  const inventoryColumns: Column<InventoryItem>[] = [
    {
      key: 'lotNumber',
      header: 'Lot Number',
      sortable: true,
      render: (item) => <span className="font-mono font-medium">{item.lotNumber}</span>
    },
    {
      key: 'product',
      header: 'Product',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium">{item.product.name}</div>
          <div className="text-sm text-muted-foreground">{item.product.packSize}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium">{formatNumber(item.quantity)}</div>
          <div className="text-sm text-muted-foreground">{item.unit}s</div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      render: (item) => <Badge variant="outline">{item.location}</Badge>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          available: 'default',
          reserved: 'secondary',
          expired: 'destructive',
          'low-stock': 'outline'
        };
        const icons = {
          available: CheckCircle2,
          reserved: Package,
          expired: AlertTriangle,
          'low-stock': TrendingDown
        };
        const Icon = icons[item.status] || Package;
        return (
          <Badge variant={variants[item.status]}>
            <Icon className="h-3 w-3 mr-1" />
            {item.status}
          </Badge>
        );
      }
    },
    {
      key: 'expiryDate',
      header: 'Expiry',
      sortable: true,
      render: (item) => {
        const expiryDate = new Date(item.expiryDate);
        const today = new Date();
        const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        return (
          <div className={daysToExpiry < 2 ? 'text-destructive font-medium' : ''}>
            {expiryDate.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
            <div className="text-xs text-muted-foreground">
              {daysToExpiry > 0 ? `${daysToExpiry} days` : 'Expired'}
            </div>
          </div>
        );
      }
    },
    {
      key: 'value',
      header: 'Value',
      sortable: true,
      render: (item) => formatCurrency(item.quantity * item.product.price)
    }
  ];

  // Movement columns
  const movementColumns: Column<StockMovement>[] = [
    {
      key: 'id',
      header: 'Movement ID',
      sortable: true,
      render: (movement) => <span className="font-mono text-sm">{movement.id}</span>
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (movement) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          in: 'default',
          out: 'secondary',
          adjustment: 'outline',
          return: 'destructive'
        };
        const icons = {
          in: TrendingUp,
          out: TrendingDown,
          adjustment: ArrowRightLeft,
          return: Package
        };
        const Icon = icons[movement.type];
        return (
          <Badge variant={variants[movement.type]}>
            <Icon className="h-3 w-3 mr-1" />
            {movement.type}
          </Badge>
        );
      }
    },
    {
      key: 'itemId',
      header: 'Product',
      render: (movement) => {
        const item = inventory.find(i => i.id === movement.itemId);
        return item?.product.name || '-';
      }
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      render: (movement) => (
        <span className={movement.type === 'in' ? 'text-green-600' : movement.type === 'out' ? 'text-red-600' : ''}>
          {movement.type === 'in' ? '+' : '-'}{formatNumber(movement.quantity)}
        </span>
      )
    },
    {
      key: 'from',
      header: 'From → To',
      render: (movement) => (
        <div className="text-sm">
          {movement.from} → {movement.to}
        </div>
      )
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (movement) => <div className="max-w-xs truncate">{movement.reason}</div>
    },
    {
      key: 'operator',
      header: 'Operator',
      sortable: true
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (movement) => new Date(movement.timestamp).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Inventory</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage stock levels and track movements</p>
        </div>
        <Dialog open={isNewMovementOpen} onOpenChange={setIsNewMovementOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Record Movement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Stock Movement</DialogTitle>
              <DialogDescription>Add a new inventory transaction</DialogDescription>
            </DialogHeader>
            <NewMovementForm onClose={() => setIsNewMovementOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">SKUs in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredItems}</div>
            <p className="text-xs text-muted-foreground">Items to dispose</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Inventory worth</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="inventory">Current Stock</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>All inventory items with stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={inventory}
                columns={inventoryColumns}
                searchPlaceholder="Search by product, lot number..."
                filename="inventory"
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
              <CardDescription>All inventory transactions and transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={movements}
                columns={movementColumns}
                searchPlaceholder="Search movements..."
                filename="stock-movements"
                pageSize={20}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <InventoryAlerts inventory={inventory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// New Movement Form
const NewMovementForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Movement Type</Label>
        <Select>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Stock In</SelectItem>
            <SelectItem value="out">Stock Out</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
            <SelectItem value="return">Return</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product">Product</Label>
        <Select>
          <SelectTrigger id="product">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map(product => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - {product.packSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" type="number" placeholder="0" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Input id="reason" placeholder="Reason for movement" />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <Plus className="h-4 w-4 mr-2" />
          Record Movement
        </Button>
      </div>
    </form>
  );
};

// Inventory Alerts Component
const InventoryAlerts = ({ inventory }: { inventory: InventoryItem[] }) => {
  const lowStock = inventory.filter(i => i.status === 'low-stock');
  const expired = inventory.filter(i => i.status === 'expired');
  const expiringSoon = inventory.filter(i => {
    const daysToExpiry = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysToExpiry > 0 && daysToExpiry <= 2;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
          <CardDescription>Items below reorder level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStock.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-muted-foreground">Lot: {item.lotNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">{item.quantity} {item.unit}s</div>
                  <div className="text-sm text-muted-foreground">Reorder: {item.reorderLevel}</div>
                </div>
                <Button variant="outline" size="sm">
                  Order
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expiring Soon</CardTitle>
          <CardDescription>Items expiring within 2 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expiringSoon.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg border-orange-200">
                <div>
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-muted-foreground">Lot: {item.lotNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-orange-600">
                    {new Date(item.expiryDate).toLocaleDateString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.quantity} {item.unit}s</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expired Items</CardTitle>
          <CardDescription>Items that need disposal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expired.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg border-destructive">
                <div>
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-sm text-muted-foreground">Lot: {item.lotNumber}</div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">Expired</Badge>
                  <div className="text-sm text-muted-foreground mt-1">{item.quantity} {item.unit}s</div>
                </div>
                <Button variant="destructive" size="sm">
                  Dispose
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
