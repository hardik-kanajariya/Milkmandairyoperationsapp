// System Settings View

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataTable, Column } from '../shared/DataTable';
import { Badge } from '../ui/badge';
import { rateCards, type RateCard } from '../../lib/sample-data';
import { formatCurrency } from '../../lib/utils';
import { 
  Settings, 
  Save,
  Plus,
  Bell,
  Lock,
  Palette,
  Database,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const SettingsView = () => {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  // Rate card columns
  const rateCardColumns: Column<RateCard>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (card) => (
        <div>
          <div className="font-medium">{card.name}</div>
          {card.isDefault && <Badge variant="secondary" className="mt-1">Default</Badge>}
        </div>
      )
    },
    {
      key: 'baseRate',
      header: 'Base Rate',
      sortable: true,
      render: (card) => formatCurrency(card.baseRate)
    },
    {
      key: 'fatRate',
      header: 'Fat Rate',
      sortable: true,
      render: (card) => `${formatCurrency(card.fatRate)} per %`
    },
    {
      key: 'snfRate',
      header: 'SNF Rate',
      sortable: true,
      render: (card) => `${formatCurrency(card.snfRate)} per %`
    },
    {
      key: 'effectiveDate',
      header: 'Effective Date',
      sortable: true,
      render: (card) => new Date(card.effectiveDate).toLocaleDateString('en-IN')
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">System Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">Configure system preferences and parameters</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-3 lg:inline-flex">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="rates">Rate Cards</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Basic dairy operation details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" defaultValue="Milkman Dairy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <Input id="gst" defaultValue="29ABCDE1234F1Z5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input id="phone" defaultValue="+91 80 1234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" defaultValue="contact@milkman.in" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="#123, MG Road, Bangalore - 560001" />
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Localization preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="asia-kolkata">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="asia-mumbai">Asia/Mumbai (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="inr">
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Volume Unit</Label>
                  <Select defaultValue="liters">
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liters">Liters (L)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Cards */}
        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rate Cards</CardTitle>
                  <CardDescription>Manage pricing structures for milk procurement</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate Card
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={rateCards}
                columns={rateCardColumns}
                searchPlaceholder="Search rate cards..."
                filename="rate-cards"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Calculation Formula</CardTitle>
              <CardDescription>How rates are calculated per liter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="font-mono text-sm">
                    <div className="font-bold mb-2">Rate per Liter = Base Rate + (Fat % × Fat Rate) + (SNF % × SNF Rate)</div>
                    <Separator className="my-3" />
                    <div className="space-y-1">
                      <div>Example for Default Rate Card:</div>
                      <div>• Base Rate: ₹22.00</div>
                      <div>• Fat Rate: ₹3.50 per %</div>
                      <div>• SNF Rate: ₹2.50 per %</div>
                      <div className="mt-2 pt-2 border-t">
                        For milk with 4.0% Fat and 8.5% SNF:
                      </div>
                      <div className="font-bold">
                        Rate = 22 + (4.0 × 3.5) + (8.5 × 2.5) = ₹57.25/L
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure email alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when inventory is below reorder level
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Quality Issues</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of quality control failures
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for pending farmer payouts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily summary email at end of day
                  </p>
                </div>
                <Switch />
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMS Notifications</CardTitle>
              <CardDescription>SMS alerts for farmers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Collection Confirmation</Label>
                  <p className="text-sm text-muted-foreground">
                    SMS to farmers after milk collection
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    SMS when payment is processed
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>Configure password requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Minimum Length</Label>
                  <p className="text-sm text-muted-foreground">
                    Require passwords to be at least 8 characters
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Special Characters</Label>
                  <p className="text-sm text-muted-foreground">
                    At least one special character required
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Expiry</Label>
                  <p className="text-sm text-muted-foreground">
                    Force password change every 90 days
                  </p>
                </div>
                <Switch />
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>Control user session behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timeout">Session Timeout (minutes)</Label>
                <Input id="timeout" type="number" defaultValue="30" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-logout on Inactivity</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out inactive users
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Backups</CardTitle>
              <CardDescription>Configure automatic data backup schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup data daily
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupTime">Backup Time</Label>
                <Input id="backupTime" type="time" defaultValue="02:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention">Retention Period (days)</Label>
                <Input id="retention" type="number" defaultValue="30" />
              </div>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Backup</CardTitle>
              <CardDescription>Create an immediate backup of all data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <div className="space-y-2">
                  <div className="font-medium">Last Backup</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date().toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">Size: 245.8 MB</div>
                </div>
              </div>
              <Button className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Create Backup Now
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
