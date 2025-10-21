// Order history component for consumer portal

import { useState } from 'react';
import { Package, MapPin, Clock, ChevronRight, RotateCcw, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { products } from '../../lib/sample-data';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  paymentMethod: string;
  trackingNumber?: string;
}

// Sample order data
const sampleOrders: Order[] = [
  {
    id: 'ORD001',
    orderNumber: 'MK2024001',
    date: '2024-01-15T08:30:00Z',
    status: 'delivered',
    items: [
      { productId: 'MILK_FULL_CREAM', quantity: 2, price: 35 },
      { productId: 'CURD_500', quantity: 1, price: 45 }
    ],
    total: 115,
    deliveryAddress: '123 Brigade Road, Bangalore',
    actualDelivery: '2024-01-16T07:00:00Z',
    paymentMethod: 'UPI'
  },
  {
    id: 'ORD002',
    orderNumber: 'MK2024002',
    date: '2024-01-18T10:15:00Z',
    status: 'shipped',
    items: [
      { productId: 'PANEER_250', quantity: 1, price: 120 },
      { productId: 'MILK_TONED', quantity: 3, price: 28 }
    ],
    total: 204,
    deliveryAddress: '123 Brigade Road, Bangalore',
    estimatedDelivery: '2024-01-19T07:00:00Z',
    paymentMethod: 'Card',
    trackingNumber: 'TRK12345'
  },
  {
    id: 'ORD003',
    orderNumber: 'MK2024003',
    date: '2024-01-20T09:45:00Z',
    status: 'processing',
    items: [
      { productId: 'GHEE_500', quantity: 1, price: 450 }
    ],
    total: 450,
    deliveryAddress: '123 Brigade Road, Bangalore',
    estimatedDelivery: '2024-01-21T07:00:00Z',
    paymentMethod: 'UPI'
  }
];

export const OrderHistory = () => {
  const [selectedTab, setSelectedTab] = useState('all');

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'processing':
        return <Clock size={16} />;
      case 'shipped':
        return <Package size={16} />;
      case 'delivered':
        return <Package size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const filterOrders = (orders: Order[], filter: string) => {
    switch (filter) {
      case 'active':
        return orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status));
      case 'delivered':
        return orders.filter(o => o.status === 'delivered');
      case 'cancelled':
        return orders.filter(o => o.status === 'cancelled');
      default:
        return orders;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const statusColor = getStatusColor(order.status);
    const StatusIcon = () => getStatusIcon(order.status);

    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ordered on {formatDate(order.date)} at {formatTime(order.date)}
              </p>
            </div>
            <Badge className={statusColor}>
              <StatusIcon />
              <span className="ml-1 capitalize">{order.status}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Order Items */}
          <div className="space-y-2">
            {order.items.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={`https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Delivery Info */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-muted-foreground mt-0.5" />
              <p className="text-sm">{order.deliveryAddress}</p>
            </div>
            
            {order.estimatedDelivery && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <p className="text-sm">
                  Expected: {formatDate(order.estimatedDelivery)} by {formatTime(order.estimatedDelivery)}
                </p>
              </div>
            )}
            
            {order.actualDelivery && (
              <div className="flex items-center gap-2">
                <Package size={16} className="text-green-600" />
                <p className="text-sm text-green-600">
                  Delivered: {formatDate(order.actualDelivery)} at {formatTime(order.actualDelivery)}
                </p>
              </div>
            )}
          </div>
          
          {/* Order Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="font-bold">Total: ₹{order.total}</p>
              <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
            </div>
            
            <div className="flex gap-2">
              {order.status === 'delivered' && (
                <Button variant="outline" size="sm">
                  <RotateCcw size={14} className="mr-1" />
                  Reorder
                </Button>
              )}
              {order.status === 'delivered' && (
                <Button variant="outline" size="sm">
                  <Star size={14} className="mr-1" />
                  Rate
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <span className="mr-1">View Details</span>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const filteredOrders = filterOrders(sampleOrders, selectedTab);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1>My Orders</h1>
        <p className="text-muted-foreground">Track and manage your dairy product orders</p>
      </div>

      {/* Order Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="space-y-4 mt-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3>No orders found</h3>
              <p className="text-muted-foreground">
                {selectedTab === 'all' 
                  ? 'You haven\'t placed any orders yet.'
                  : `No ${selectedTab} orders found.`
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};