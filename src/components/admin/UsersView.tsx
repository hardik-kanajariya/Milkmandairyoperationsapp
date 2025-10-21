// Users & Roles Management View

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DataTable, Column } from '../shared/DataTable';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { sampleUsers, ROLES, type User, type UserRole } from '../../lib/sample-data';
import { 
  Users, 
  Plus,
  Shield,
  Mail,
  Phone,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ExtendedUser extends User {
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

// Generate extended user data
const generateUsers = (): ExtendedUser[] => {
  const baseUsers: ExtendedUser[] = sampleUsers.map(user => ({
    ...user,
    status: 'active' as const,
    lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  }));

  // Add more sample users
  const additionalUsers: ExtendedUser[] = [
    {
      id: 'admin2',
      name: 'Suresh Patil',
      email: 'suresh@milkman.in',
      role: ROLES.ADMIN,
      phone: '+91 98765 43211',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2024-01-15'
    },
    {
      id: 'admin3',
      name: 'Lakshmi Menon',
      email: 'lakshmi@milkman.in',
      role: ROLES.ADMIN,
      phone: '+91 98765 43212',
      status: 'active',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: '2024-02-20'
    },
    {
      id: 'farmer2',
      name: 'Manjunath Gowda',
      email: 'manjunath@farmer.in',
      role: ROLES.FARMER,
      phone: '+91 9000000001',
      farmerId: 'F002',
      status: 'active',
      lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      createdAt: '2023-11-10'
    },
    {
      id: 'farmer3',
      name: 'Venkatesh Rao',
      email: 'venkatesh@farmer.in',
      role: ROLES.FARMER,
      phone: '+91 9000000002',
      farmerId: 'F003',
      status: 'inactive',
      createdAt: '2023-10-05'
    },
    {
      id: 'consumer2',
      name: 'Rahul Gupta',
      email: 'rahul@consumer.in',
      role: ROLES.CONSUMER,
      phone: '+91 98765 12346',
      status: 'active',
      lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: '2024-03-01'
    }
  ];

  return [...baseUsers, ...additionalUsers];
};

export const UsersView = () => {
  const [users] = useState(generateUsers());
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.role === ROLES.ADMIN).length;
  const farmerUsers = users.filter(u => u.role === ROLES.FARMER).length;
  const consumerUsers = users.filter(u => u.role === ROLES.CONSUMER).length;

  // User columns
  const userColumns: Column<ExtendedUser>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: (user) => (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (user) => {
        const variants: Record<UserRole, "default" | "secondary" | "outline"> = {
          admin: 'default',
          farmer: 'secondary',
          consumer: 'outline'
        };
        return <Badge variant={variants[user.role]}>{user.role}</Badge>;
      }
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (user) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {user.phone}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (user) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          active: 'default',
          inactive: 'secondary',
          suspended: 'destructive'
        };
        const icons = {
          active: CheckCircle2,
          inactive: XCircle,
          suspended: XCircle
        };
        const Icon = icons[user.status];
        return (
          <Badge variant={variants[user.status]}>
            <Icon className="h-3 w-3 mr-1" />
            {user.status}
          </Badge>
        );
      }
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
      render: (user) => 
        user.lastLogin ? (
          <div className="text-sm">
            {new Date(user.lastLogin).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        ) : (
          <span className="text-muted-foreground">Never</span>
        )
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (user) => new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedUser(user)}
          >
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            {user.status === 'active' ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Users & Roles</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <NewUserForm onClose={() => setIsNewUserOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{activeUsers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Admin role</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmerUsers}</div>
            <p className="text-xs text-muted-foreground">Farmer accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consumerUsers}</div>
            <p className="text-xs text-muted-foreground">Customer accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Complete user database with access levels</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={userColumns}
            searchPlaceholder="Search by name, email, phone..."
            filename="users"
            pageSize={15}
          />
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Access control matrix for different user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RolePermissions />
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User - {selectedUser.name}</DialogTitle>
              <DialogDescription>{selectedUser.email}</DialogDescription>
            </DialogHeader>
            <EditUserForm user={selectedUser} onClose={() => setSelectedUser(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// New User Form
const NewUserForm = ({ onClose }: { onClose: () => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('User created successfully');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Enter full name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="user@example.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" placeholder="+91 XXXXX XXXXX" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="farmer">Farmer</SelectItem>
            <SelectItem value="consumer">Consumer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Initial Password</Label>
        <Input id="password" type="password" placeholder="********" required />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>
    </form>
  );
};

// Edit User Form
const EditUserForm = ({ user, onClose }: { user: ExtendedUser; onClose: () => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('User updated successfully');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="editName">Full Name</Label>
        <Input id="editName" defaultValue={user.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="editEmail">Email</Label>
        <Input id="editEmail" type="email" defaultValue={user.email} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="editPhone">Phone</Label>
        <Input id="editPhone" defaultValue={user.phone} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="editRole">Role</Label>
        <Select defaultValue={user.role}>
          <SelectTrigger id="editRole">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="farmer">Farmer</SelectItem>
            <SelectItem value="consumer">Consumer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="editStatus">Status</Label>
        <Select defaultValue={user.status}>
          <SelectTrigger id="editStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
};

// Role Permissions Component
const RolePermissions = () => {
  const permissions = [
    { module: 'Dashboard', admin: true, farmer: true, consumer: true },
    { module: 'Milk Collection', admin: true, farmer: true, consumer: false },
    { module: 'Farmer Management', admin: true, farmer: false, consumer: false },
    { module: 'Payouts', admin: true, farmer: true, consumer: false },
    { module: 'Processing & QC', admin: true, farmer: false, consumer: false },
    { module: 'Inventory', admin: true, farmer: false, consumer: false },
    { module: 'Orders', admin: true, farmer: false, consumer: true },
    { module: 'POS Terminal', admin: true, farmer: false, consumer: false },
    { module: 'Reports', admin: true, farmer: false, consumer: false },
    { module: 'Settings', admin: true, farmer: false, consumer: false },
    { module: 'User Management', admin: true, farmer: false, consumer: false }
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-4 font-medium pb-2 border-b">
        <div>Module</div>
        <div className="text-center">Admin</div>
        <div className="text-center">Farmer</div>
        <div className="text-center">Consumer</div>
      </div>
      {permissions.map((perm) => (
        <div key={perm.module} className="grid grid-cols-4 gap-4 items-center py-2 border-b">
          <div className="text-sm">{perm.module}</div>
          <div className="flex justify-center">
            {perm.admin ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex justify-center">
            {perm.farmer ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex justify-center">
            {perm.consumer ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
