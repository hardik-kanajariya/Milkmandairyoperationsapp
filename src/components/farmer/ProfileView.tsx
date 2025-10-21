// Profile view for farmer portal - manage personal details and settings

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { 
  getFarmerById,
  getCollectionsByFarmer,
  getRouteById
} from '../../lib/sample-data';
import { getCurrentFarmerId } from '../../lib/auth';
import { formatCurrency, formatDate } from '../../lib/utils';
import { 
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Calendar,
  Award,
  Droplets,
  TrendingUp,
  Settings,
  Lock,
  Bell,
  Sun,
  Moon,
  LogOut,
  Edit2,
  Save,
  X,
  Shield,
  AlertCircle,
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileView = () => {
  const farmerId = getCurrentFarmerId();
  const farmer = farmerId ? getFarmerById(farmerId) : null;
  const route = farmer ? getRouteById(farmer.routeId) : null;
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [notifications, setNotifications] = useState({
    deliveryConfirmation: true,
    paymentAlerts: true,
    qualityAlerts: true,
    newsUpdates: false
  });

  const [personalInfo, setPersonalInfo] = useState({
    name: farmer?.name || '',
    phone: farmer?.phone || '',
    email: 'farmer@example.com'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    bankAccount: farmer?.bankAccount || '',
    upiId: farmer?.upiId || ''
  });

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

  // Calculate farmer stats
  const allCollections = getCollectionsByFarmer(farmerId!);
  const totalDeliveries = allCollections.length;
  const totalVolume = allCollections.reduce((sum, c) => sum + c.quantity, 0);
  const totalEarnings = allCollections.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0);
  const avgQuality = allCollections.length > 0 
    ? allCollections.reduce((sum, c) => sum + c.fat + c.snf, 0) / allCollections.length 
    : 0;

  const handleSavePersonal = () => {
    toast.success('Personal information updated successfully');
    setIsEditingPersonal(false);
  };

  const handleSavePayment = () => {
    toast.success('Payment details updated successfully. Changes will be verified within 24 hours.');
    setIsEditingPayment(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(farmer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{farmer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{farmer.code}</Badge>
                <Badge>{farmer.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                {farmer.rateCardId === 'premium' && (
                  <Badge variant="default" className="bg-yellow-600">
                    <Award className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {route?.name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Since {formatDate(farmer.joinDate)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalVolume)}L</div>
            <p className="text-xs text-muted-foreground">Milk delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgQuality.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Fat + SNF</p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic details</CardDescription>
            </div>
            {!isEditingPersonal ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSavePersonal}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={personalInfo.name}
                onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                disabled={!isEditingPersonal}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                disabled={!isEditingPersonal}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                disabled={!isEditingPersonal}
              />
            </div>
            <div className="space-y-2">
              <Label>Farmer ID</Label>
              <Input value={farmer.code} disabled />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Route</Label>
              <Input value={route?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Default Shift</Label>
              <Input value={farmer.defaultShift} disabled className="capitalize" />
            </div>
            <div className="space-y-2">
              <Label>Rate Card</Label>
              <Input 
                value={farmer.rateCardId === 'premium' ? 'Premium' : 'Standard'} 
                disabled 
              />
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <Input value={formatDate(farmer.joinDate)} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>Bank and UPI details for payouts</CardDescription>
            </div>
            {!isEditingPayment ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditingPayment(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditingPayment(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSavePayment}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account Number</Label>
              <Input
                id="bankAccount"
                value={paymentInfo.bankAccount}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, bankAccount: e.target.value })}
                disabled={!isEditingPayment}
                placeholder="Enter bank account number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                value={paymentInfo.upiId}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, upiId: e.target.value })}
                disabled={!isEditingPayment}
                placeholder="yourname@upi"
              />
            </div>
          </div>

          {isEditingPayment && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-2">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Security Notice
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Changes to payment details are verified within 24 hours for security. 
                    You'll receive a confirmation once approved.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Settings
          </CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </div>
              </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Delivery Confirmations</div>
                  <div className="text-xs text-muted-foreground">
                    Get notified when milk is collected
                  </div>
                </div>
                <Switch
                  checked={notifications.deliveryConfirmation}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, deliveryConfirmation: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Payment Alerts</div>
                  <div className="text-xs text-muted-foreground">
                    Alerts when payments are processed
                  </div>
                </div>
                <Switch
                  checked={notifications.paymentAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, paymentAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Quality Alerts</div>
                  <div className="text-xs text-muted-foreground">
                    Notifications about milk quality issues
                  </div>
                </div>
                <Switch
                  checked={notifications.qualityAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, qualityAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">News & Updates</div>
                  <div className="text-xs text-muted-foreground">
                    Dairy news and announcements
                  </div>
                </div>
                <Switch
                  checked={notifications.newsUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, newsUpdates: checked })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Shield className="h-4 w-4 mr-2" />
            Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Account Actions
          </CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
