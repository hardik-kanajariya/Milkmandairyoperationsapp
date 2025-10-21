// Orders & Delivery Management View

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DataTable, Column } from '../shared/DataTable';
import { products } from '../../lib/sample-data';
import { formatCurrency } from '../../lib/utils';
import { 
  Truck, 
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
  paymentMethod: 'online' | 'cod' | 'subscription';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  orderDate: string;
  deliveryDate?: string;
  deliverySlot?: string;
  assignedDriver?: string;
}

// Generate sample orders
const generateOrders = (): Order[] => {
  const customers = [
    { name: 'Priya Sharma', phone: '+91 98765 12345', address: '#123, MG Road, Bangalore' },
    { name: 'Rahul Gupta', phone: '+91 98765 12346', address: '#456, Indiranagar, Bangalore' },
    { name: 'Amit Patel', phone: '+91 98765 12347', address: '#789, Koramangala, Bangalore' },
    { name: 'Sneha Reddy', phone: '+91 98765 12348', address: '#321, Jayanagar, Bangalore' },
    { name: 'Vikas Kumar', phone: '+91 98765 12349', address: '#654, Whitefield, Bangalore' }
  ];
  
  const drivers = ['Raju Kumar', 'Santosh Naik', 'Vijay Reddy'];
  const orders: Order[] = [];

  for (let i = 0; i < 60; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 15));
    
    const numItems = 1 + Math.floor(Math.random() * 4);
    const items = [];
    let totalAmount = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = 1 + Math.floor(Math.random() * 3);
      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;
      
      items.push({
        productId: product.id,
        quantity,
        price: product.price
      });
    }
    
    const statusOptions: Order['status'][] = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled'];
    const status = i < 5 ? 'pending' : i < 15 ? statusOptions[1 + Math.floor(Math.random() * 3)] : 'delivered';
    
    orders.push({
      id: `ORD${String(i + 1).padStart(5, '0')}`,
      orderNumber: `ORD${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: customer.address,
      items,
      totalAmount,
      status,
      paymentMethod: Math.random() > 0.6 ? 'online' : Math.random() > 0.3 ? 'subscription' : 'cod',
      paymentStatus: status === 'delivered' ? 'paid' : status === 'cancelled' ? 'refunded' : Math.random() > 0.3 ? 'paid' : 'pending',
      orderDate: orderDate.toISOString(),
      deliveryDate: status !== 'pending' && status !== 'cancelled' 
        ? new Date(orderDate.getTime() + 86400000).toISOString() 
        : undefined,
      deliverySlot: Math.random() > 0.5 ? '6:00 AM - 8:00 AM' : '4:00 PM - 6:00 PM',
      assignedDriver: status !== 'pending' && status !== 'cancelled' 
        ? drivers[Math.floor(Math.random() * drivers.length)] 
        : undefined
    });
  }

  return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const OrdersView = () => {
  const [orders] = useState(generateOrders());

  // Stats
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const todaysOrders = orders.filter(o => {
    const orderDate = new Date(o.orderDate);
    return orderDate.toDateString() === new Date().toDateString();
  }).length;
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Order columns
  const orderColumns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      sortable: true,
      render: (order) => <span className="font-mono font-medium">{order.orderNumber}</span>
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (order) => (
        <div>
          <div className="font-medium">{order.customerName}</div>
          <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Items',
      render: (order) => (
        <div className="text-sm">
          {order.items.length} item{order.items.length > 1 ? 's' : ''}
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      sortable: true,
      render: (order) => <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
    },
    {
      key: 'status',
      header: 'Order Status',
      sortable: true,
      render: (order) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          pending: 'secondary',
          confirmed: 'outline',
          packed: 'outline',
          dispatched: 'default',
          delivered: 'default',
          cancelled: 'destructive'
        };
        return <Badge variant={variants[order.status]}>{order.status}</Badge>;
      }
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      sortable: true,
      render: (order) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          paid: 'default',
          pending: 'secondary',
          refunded: 'destructive'
        };
        return <Badge variant={variants[order.paymentStatus]}>{order.paymentStatus}</Badge>;
      }
    },
    {
      key: 'assignedDriver',
      header: 'Driver',
      render: (order) => order.assignedDriver || '-'
    },
    {
      key: 'deliverySlot',
      header: 'Delivery Slot',
      render: (order) => (
        <div className="text-sm">
          {order.deliverySlot || '-'}
        </div>
      )
    },
    {
      key: 'orderDate',
      header: 'Order Date',
      sortable: true,
      render: (order) => new Date(order.orderDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Orders & Delivery</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage customer orders and deliveries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysOrders}</div>
            <p className="text-xs text-muted-foreground">Placed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'dispatched').length}
            </div>
            <p className="text-xs text-muted-foreground">Out for delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Delivered orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>Complete order history with delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={orders}
            columns={orderColumns}
            searchPlaceholder="Search by order number, customer..."
            filename="orders"
            pageSize={15}
          />
        </CardContent>
      </Card>
    </div>
  );
};
