// Account settings component for consumer portal

import { useState } from 'react';
import { User, MapPin, CreditCard, Bell, Shield, HelpCircle, LogOut, Edit, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useAuth } from '../../hooks/useAuth';

interface Address {
  id: string;
  label: string;
  address: string;
  landmark?: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  details: string;
  isDefault: boolean;
}

export const AccountSettings = () => {
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr1',
      label: 'Home',
      address: '123 Brigade Road, Bangalore, Karnataka 560001',
      landmark: 'Near Coffee Day',
      isDefault: true
    },
    {
      id: 'addr2',
      label: 'Office',
      address: '456 MG Road, Bangalore, Karnataka 560002',
      isDefault: false
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pay1',
      type: 'upi',
      details: 'priya@paytm',
      isDefault: true
    },
    {
      id: 'pay2',
      type: 'card',
      details: '**** **** **** 1234',
      isDefault: false
    }
  ]);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    deliveryReminders: true,
    newsletter: false
  });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const setDefaultPayment = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const ProfileSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Profile Information
          </CardTitle>
          <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Update your personal information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={user?.phone} />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-sm text-muted-foreground">Name</Label>
          <p className="font-medium">{user?.name}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Email</Label>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Phone</Label>
          <p className="font-medium">{user?.phone || 'Not provided'}</p>
        </div>
      </CardContent>
    </Card>
  );

  const AddressSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin size={20} />
            Delivery Addresses
          </CardTitle>
          <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus size={16} className="mr-1" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>Add a new delivery address to your account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLabel">Address Label</Label>
                  <Input id="addressLabel" placeholder="e.g., Home, Office" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullAddress">Complete Address</Label>
                  <Input id="fullAddress" placeholder="House/Flat, Street, Area, City, Pincode" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input id="landmark" placeholder="Near landmark" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">Add Address</Button>
                  <Button variant="outline" onClick={() => setIsAddAddressOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.map(address => (
          <div key={address.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{address.label}</span>
                  {address.isDefault && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{address.address}</p>
                {address.landmark && (
                  <p className="text-xs text-muted-foreground mt-1">Landmark: {address.landmark}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {!address.isDefault && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDefaultAddress(address.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteAddress(address.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const PaymentSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Payment Methods
          </CardTitle>
          <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus size={16} className="mr-1" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>Add a new payment method to your account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="h-auto py-3">
                      <div className="text-center">
                        <CreditCard size={20} className="mx-auto mb-1" />
                        <div className="text-xs">Card</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto py-3">
                      <div className="text-center">
                        <div className="w-5 h-5 mx-auto mb-1 bg-primary rounded" />
                        <div className="text-xs">UPI</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto py-3">
                      <div className="text-center">
                        <div className="w-5 h-5 mx-auto mb-1 bg-primary rounded" />
                        <div className="text-xs">Net Banking</div>
                      </div>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">Add Payment Method</Button>
                  <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map(method => (
          <div key={method.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{method.type}</span>
                    {method.isDefault && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{method.details}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!method.isDefault && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDefaultPayment(method.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deletePaymentMethod(method.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const NotificationSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={20} />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Order Updates</Label>
            <p className="text-sm text-muted-foreground">Get notified about your order status</p>
          </div>
          <Switch
            checked={notifications.orderUpdates}
            onCheckedChange={(checked) => 
              setNotifications(prev => ({ ...prev, orderUpdates: checked }))
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label>Delivery Reminders</Label>
            <p className="text-sm text-muted-foreground">Reminders before scheduled deliveries</p>
          </div>
          <Switch
            checked={notifications.deliveryReminders}
            onCheckedChange={(checked) => 
              setNotifications(prev => ({ ...prev, deliveryReminders: checked }))
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label>Promotions</Label>
            <p className="text-sm text-muted-foreground">Special offers and discounts</p>
          </div>
          <Switch
            checked={notifications.promotions}
            onCheckedChange={(checked) => 
              setNotifications(prev => ({ ...prev, promotions: checked }))
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label>Newsletter</Label>
            <p className="text-sm text-muted-foreground">Weekly updates and tips</p>
          </div>
          <Switch
            checked={notifications.newsletter}
            onCheckedChange={(checked) => 
              setNotifications(prev => ({ ...prev, newsletter: checked }))
            }
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1>Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile */}
        <ProfileSection />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Shield size={16} className="mr-2" />
              Privacy & Security
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle size={16} className="mr-2" />
              Help & Support
            </Button>
            <Separator />
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={logout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Addresses */}
      <AddressSection />

      {/* Payment Methods */}
      <PaymentSection />

      {/* Notifications */}
      <NotificationSection />
    </div>
  );
};