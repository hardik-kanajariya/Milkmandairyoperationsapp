// Subscription management component for consumer portal

import { useState } from 'react';
import { Calendar, Clock, Edit, Pause, Play, Plus, Trash2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { products } from '../../lib/sample-data';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface SubscriptionItem {
  productId: string;
  quantity: number;
}

interface Subscription {
  id: string;
  name: string;
  items: SubscriptionItem[];
  frequency: 'daily' | 'alternate' | 'weekly' | 'monthly';
  deliveryTime: string;
  deliveryAddress: string;
  isActive: boolean;
  nextDelivery: string;
  startDate: string;
  totalAmount: number;
  deliveryDays?: string[]; // For weekly subscriptions
}

// Sample subscription data
const sampleSubscriptions: Subscription[] = [
  {
    id: 'SUB001',
    name: 'Daily Milk & Curd',
    items: [
      { productId: 'MILK_FULL_CREAM', quantity: 2 },
      { productId: 'CURD_500', quantity: 1 }
    ],
    frequency: 'daily',
    deliveryTime: '07:00',
    deliveryAddress: '123 Brigade Road, Bangalore',
    isActive: true,
    nextDelivery: '2024-01-21T07:00:00Z',
    startDate: '2024-01-01',
    totalAmount: 115
  },
  {
    id: 'SUB002',
    name: 'Weekly Dairy Pack',
    items: [
      { productId: 'MILK_TONED', quantity: 5 },
      { productId: 'PANEER_250', quantity: 1 },
      { productId: 'BUTTER_100', quantity: 1 }
    ],
    frequency: 'weekly',
    deliveryTime: '08:00',
    deliveryAddress: '123 Brigade Road, Bangalore',
    isActive: false,
    nextDelivery: '2024-01-28T08:00:00Z',
    startDate: '2024-01-01',
    totalAmount: 345,
    deliveryDays: ['monday', 'friday']
  }
];

export const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState(sampleSubscriptions);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const toggleSubscription = (id: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
      )
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  const getFrequencyText = (frequency: string, deliveryDays?: string[]) => {
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'alternate':
        return 'Every alternate day';
      case 'weekly':
        return deliveryDays ? `Weekly on ${deliveryDays.join(', ')}` : 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency;
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

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}:00`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const SubscriptionCard = ({ subscription }: { subscription: Subscription }) => {
    return (
      <Card className={subscription.isActive ? 'border-primary' : 'border-muted'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{subscription.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {getFrequencyText(subscription.frequency, subscription.deliveryDays)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
                {subscription.isActive ? 'Active' : 'Paused'}
              </Badge>
              <Switch
                checked={subscription.isActive}
                onCheckedChange={() => toggleSubscription(subscription.id)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Subscription Items */}
          <div className="space-y-2">
            {subscription.items.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={`https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop&crop=center`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × ₹{product.price} = ₹{item.quantity * product.price}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Delivery Details */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <span className="text-sm">Delivery at {formatTime(subscription.deliveryTime)}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-muted-foreground mt-0.5" />
              <span className="text-sm">{subscription.deliveryAddress}</span>
            </div>
            {subscription.isActive && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="text-sm">
                  Next delivery: {formatDate(subscription.nextDelivery)}
                </span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="font-bold">₹{subscription.totalAmount}</p>
              <p className="text-xs text-muted-foreground">per delivery</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit size={14} className="mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => deleteSubscription(subscription.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CreateSubscriptionDialog = () => {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [frequency, setFrequency] = useState('daily');
    const [deliveryTime, setDeliveryTime] = useState('07:00');
    const [deliveryDays, setDeliveryDays] = useState<string[]>([]);

    const weekDays = [
      { id: 'monday', label: 'Monday' },
      { id: 'tuesday', label: 'Tuesday' },
      { id: 'wednesday', label: 'Wednesday' },
      { id: 'thursday', label: 'Thursday' },
      { id: 'friday', label: 'Friday' },
      { id: 'saturday', label: 'Saturday' },
      { id: 'sunday', label: 'Sunday' }
    ];

    const toggleDay = (day: string) => {
      setDeliveryDays(prev => 
        prev.includes(day) 
          ? prev.filter(d => d !== day)
          : [...prev, day]
      );
    };

    return (
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Subscription</DialogTitle>
            <DialogDescription>Set up a recurring delivery for your favorite products</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Product Selection */}
            <div className="space-y-3">
              <Label>Select Products</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map(product => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={product.id}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts(prev => [...prev, product.id]);
                        } else {
                          setSelectedProducts(prev => prev.filter(id => id !== product.id));
                        }
                      }}
                    />
                    <label htmlFor={product.id} className="text-sm flex-1 cursor-pointer">
                      {product.name} - ₹{product.price}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Frequency */}
            <div className="space-y-3">
              <Label>Delivery Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="alternate">Alternate Days</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Delivery Days (for weekly) */}
            {frequency === 'weekly' && (
              <div className="space-y-3">
                <Label>Delivery Days</Label>
                <div className="grid grid-cols-2 gap-2">
                  {weekDays.map(day => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id}
                        checked={deliveryDays.includes(day.id)}
                        onCheckedChange={() => toggleDay(day.id)}
                      />
                      <label htmlFor={day.id} className="text-sm cursor-pointer">
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Delivery Time */}
            <div className="space-y-3">
              <Label>Preferred Delivery Time</Label>
              <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">6:00 AM</SelectItem>
                  <SelectItem value="07:00">7:00 AM</SelectItem>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                Create Subscription
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>My Subscriptions</h1>
          <p className="text-muted-foreground">Manage your regular dairy deliveries</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              New Subscription
            </Button>
          </DialogTrigger>
          <CreateSubscriptionDialog />
        </Dialog>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map(subscription => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3>No subscriptions yet</h3>
          <p className="text-muted-foreground mb-4">
            Set up regular deliveries for your favorite dairy products
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create Your First Subscription
          </Button>
        </div>
      )}

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Subscription Benefits</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Save up to 10% on regular orders</li>
            <li>• Never run out of your daily essentials</li>
            <li>• Flexible scheduling and easy modifications</li>
            <li>• Priority delivery slots</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};