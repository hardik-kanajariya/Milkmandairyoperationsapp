// Audit Log View

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DataTable, Column } from '../shared/DataTable';
import { sampleUsers } from '../../lib/sample-data';
import { 
  Shield, 
  FileText,
  Users,
  Settings,
  Package,
  CreditCard
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  action: string;
  module: 'auth' | 'collection' | 'farmer' | 'payout' | 'inventory' | 'order' | 'settings' | 'user';
  details: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
}

// Generate sample audit logs
const generateAuditLogs = (): AuditLog[] => {
  const actions = {
    auth: ['Login', 'Logout', 'Password Change', 'Failed Login Attempt'],
    collection: ['Created Collection', 'Updated Collection', 'Approved Collection', 'Deleted Collection'],
    farmer: ['Added Farmer', 'Updated Farmer', 'Deleted Farmer', 'Changed Rate Card'],
    payout: ['Processed Payout', 'Approved Payout', 'Rejected Payout', 'Modified Payout'],
    inventory: ['Added Stock', 'Removed Stock', 'Stock Adjustment', 'Stock Transfer'],
    order: ['Created Order', 'Confirmed Order', 'Dispatched Order', 'Cancelled Order'],
    settings: ['Updated Settings', 'Changed Configuration', 'Modified Rate Card'],
    user: ['Created User', 'Updated User', 'Deleted User', 'Changed Role']
  };

  const modules: (keyof typeof actions)[] = ['auth', 'collection', 'farmer', 'payout', 'inventory', 'order', 'settings', 'user'];
  const logs: AuditLog[] = [];

  for (let i = 0; i < 200; i++) {
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - i * 15);
    
    const module = modules[Math.floor(Math.random() * modules.length)];
    const moduleActions = actions[module];
    const action = moduleActions[Math.floor(Math.random() * moduleActions.length)];
    const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    
    const status = Math.random() > 0.95 ? 'failed' : Math.random() > 0.9 ? 'warning' : 'success';
    
    logs.push({
      id: `AUDIT${String(i + 1).padStart(6, '0')}`,
      timestamp: timestamp.toISOString(),
      user: user.name,
      userId: user.id,
      action,
      module,
      details: `${action} - ${module} operation`,
      ipAddress: `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      status
    });
  }

  return logs;
};

export const AuditView = () => {
  const [logs] = useState(generateAuditLogs());

  // Stats
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate.toDateString() === new Date().toDateString();
  }).length;

  const failedOperations = logs.filter(log => log.status === 'failed').length;
  const uniqueUsers = new Set(logs.map(log => log.userId)).size;

  // Audit log columns
  const auditColumns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (log) => (
        <div className="text-sm">
          <div>{new Date(log.timestamp).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}</div>
          <div className="text-muted-foreground">
            {new Date(log.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
      )
    },
    {
      key: 'user',
      header: 'User',
      sortable: true,
      render: (log) => (
        <div>
          <div className="font-medium">{log.user}</div>
          <div className="text-sm text-muted-foreground">{log.userId}</div>
        </div>
      )
    },
    {
      key: 'module',
      header: 'Module',
      sortable: true,
      render: (log) => {
        const icons = {
          auth: Shield,
          collection: FileText,
          farmer: Users,
          payout: CreditCard,
          inventory: Package,
          order: FileText,
          settings: Settings,
          user: Users
        };
        const Icon = icons[log.module];
        return (
          <Badge variant="outline" className="gap-1">
            <Icon className="h-3 w-3" />
            {log.module}
          </Badge>
        );
      }
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (log) => <span className="font-medium">{log.action}</span>
    },
    {
      key: 'details',
      header: 'Details',
      render: (log) => <div className="max-w-md truncate text-sm">{log.details}</div>
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      sortable: true,
      render: (log) => <span className="font-mono text-sm">{log.ipAddress}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (log) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          success: 'default',
          warning: 'secondary',
          failed: 'destructive'
        };
        return <Badge variant={variants[log.status]}>{log.status}</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Audit Log</h1>
        <p className="text-sm md:text-base text-muted-foreground">System activity and security audit trail</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayLogs}</div>
            <p className="text-xs text-muted-foreground">Actions logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Operations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedOperations}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Unique users</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity by Module */}
      <Card>
        <CardHeader>
          <CardTitle>Activity by Module</CardTitle>
          <CardDescription>Operations performed across different modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['auth', 'collection', 'farmer', 'payout', 'inventory', 'order', 'settings', 'user'].map(module => {
              const moduleCount = logs.filter(log => log.module === module).length;
              const percentage = (moduleCount / logs.length) * 100;
              
              return (
                <div key={module} className="flex items-center gap-4">
                  <Badge variant="outline" className="w-24 justify-center capitalize">
                    {module}
                  </Badge>
                  <div className="flex-1">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-16 text-right">{moduleCount}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Complete system activity log with timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={logs}
            columns={auditColumns}
            searchPlaceholder="Search by user, action, module..."
            filename="audit-log"
            pageSize={20}
          />
        </CardContent>
      </Card>
    </div>
  );
};
