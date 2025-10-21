// Processing & Quality Control View

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { DataTable, Column } from '../shared/DataTable';
import { Progress } from '../ui/progress';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { 
  Factory, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Package,
  Clock,
  Beaker
} from 'lucide-react';

interface ProcessingBatch {
  id: string;
  batchNumber: string;
  productType: string;
  inputMilk: number; // liters
  expectedYield: number;
  actualYield: number;
  status: 'pending' | 'processing' | 'completed' | 'qc-failed';
  startTime: string;
  endTime?: string;
  qualityScore?: number;
  operator: string;
  notes?: string;
}

interface QCTest {
  id: string;
  batchId: string;
  testType: string;
  parameter: string;
  expectedValue: string;
  actualValue: string;
  status: 'pass' | 'fail' | 'pending';
  testedBy: string;
  testedAt: string;
}

// Generate sample processing batches
const generateBatches = (): ProcessingBatch[] => {
  const products = ['Toned Milk', 'Full Cream Milk', 'Curd', 'Paneer', 'Ghee', 'Butter'];
  const operators = ['Ramesh Kumar', 'Suresh Patil', 'Vijay Reddy', 'Mahesh Rao'];
  const batches: ProcessingBatch[] = [];

  for (let i = 0; i < 50; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const inputMilk = 100 + Math.random() * 900; // 100-1000L
    const expectedYield = inputMilk * (0.85 + Math.random() * 0.1);
    const actualYield = expectedYield * (0.95 + Math.random() * 0.1);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
    
    const status = i < 5 ? 'processing' : i < 10 ? 'pending' : Math.random() > 0.95 ? 'qc-failed' : 'completed';
    
    batches.push({
      id: `BATCH${String(i + 1).padStart(4, '0')}`,
      batchNumber: `B${startDate.getFullYear()}${String(startDate.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
      productType: product,
      inputMilk: Math.round(inputMilk * 10) / 10,
      expectedYield: Math.round(expectedYield * 10) / 10,
      actualYield: Math.round(actualYield * 10) / 10,
      status,
      startTime: startDate.toISOString(),
      endTime: status === 'completed' || status === 'qc-failed' 
        ? new Date(startDate.getTime() + (2 + Math.random() * 6) * 3600000).toISOString() 
        : undefined,
      qualityScore: status === 'completed' ? 85 + Math.random() * 15 : undefined,
      operator: operators[Math.floor(Math.random() * operators.length)],
      notes: Math.random() > 0.7 ? 'Standard processing parameters followed' : undefined
    });
  }

  return batches.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
};

// Generate QC tests
const generateQCTests = (): QCTest[] => {
  const testTypes = ['Microbiological', 'Chemical', 'Physical', 'Organoleptic'];
  const parameters = {
    'Microbiological': ['Total Plate Count', 'Coliform', 'E.coli', 'Salmonella'],
    'Chemical': ['Fat %', 'SNF %', 'Added Water', 'Preservatives'],
    'Physical': ['Temperature', 'pH Level', 'Density', 'Viscosity'],
    'Organoleptic': ['Taste', 'Odor', 'Color', 'Texture']
  };
  const testers = ['Dr. Priya Sharma', 'Dr. Anil Kumar', 'Lakshmi Menon'];
  
  const tests: QCTest[] = [];
  const batches = generateBatches().slice(0, 20);

  batches.forEach((batch, batchIndex) => {
    const numTests = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numTests; i++) {
      const testType = testTypes[Math.floor(Math.random() * testTypes.length)];
      const params = parameters[testType as keyof typeof parameters];
      const parameter = params[Math.floor(Math.random() * params.length)];
      
      tests.push({
        id: `QC${String(tests.length + 1).padStart(5, '0')}`,
        batchId: batch.id,
        testType,
        parameter,
        expectedValue: '< 10^5 cfu/ml',
        actualValue: '< 10^4 cfu/ml',
        status: Math.random() > 0.9 ? 'fail' : 'pass',
        testedBy: testers[Math.floor(Math.random() * testers.length)],
        testedAt: new Date(new Date(batch.startTime).getTime() + 3600000).toISOString()
      });
    }
  });

  return tests;
};

export const ProcessingView = () => {
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [batches] = useState(generateBatches());
  const [qcTests] = useState(generateQCTests());

  // Stats
  const activeBatches = batches.filter(b => b.status === 'processing').length;
  const pendingBatches = batches.filter(b => b.status === 'pending').length;
  const completedToday = batches.filter(b => {
    const endTime = b.endTime ? new Date(b.endTime) : null;
    return endTime && endTime.toDateString() === new Date().toDateString();
  }).length;
  const avgYieldEfficiency = batches
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.actualYield / b.expectedYield * 100), 0) / 
    batches.filter(b => b.status === 'completed').length;

  // Batch columns
  const batchColumns: Column<ProcessingBatch>[] = [
    {
      key: 'batchNumber',
      header: 'Batch #',
      sortable: true,
      render: (batch) => <span className="font-mono font-medium">{batch.batchNumber}</span>
    },
    {
      key: 'productType',
      header: 'Product',
      sortable: true,
      render: (batch) => <Badge variant="outline">{batch.productType}</Badge>
    },
    {
      key: 'inputMilk',
      header: 'Input (L)',
      sortable: true,
      render: (batch) => formatNumber(batch.inputMilk)
    },
    {
      key: 'actualYield',
      header: 'Yield',
      sortable: true,
      render: (batch) => (
        <div>
          <div className="font-medium">{formatNumber(batch.actualYield)}</div>
          <div className="text-sm text-muted-foreground">
            {((batch.actualYield / batch.expectedYield) * 100).toFixed(1)}%
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (batch) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          pending: 'secondary',
          processing: 'default',
          completed: 'outline',
          'qc-failed': 'destructive'
        };
        return <Badge variant={variants[batch.status]}>{batch.status}</Badge>;
      }
    },
    {
      key: 'qualityScore',
      header: 'Quality',
      sortable: true,
      render: (batch) => 
        batch.qualityScore ? (
          <div className="flex items-center gap-2">
            <div className="w-12">{batch.qualityScore.toFixed(0)}</div>
            <Progress value={batch.qualityScore} className="w-20" />
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
    },
    {
      key: 'operator',
      header: 'Operator',
      sortable: true
    },
    {
      key: 'startTime',
      header: 'Started',
      sortable: true,
      render: (batch) => new Date(batch.startTime).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ];

  // QC Test columns
  const qcColumns: Column<QCTest>[] = [
    {
      key: 'id',
      header: 'Test ID',
      sortable: true,
      render: (test) => <span className="font-mono text-sm">{test.id}</span>
    },
    {
      key: 'batchId',
      header: 'Batch',
      sortable: true,
      render: (test) => {
        const batch = batches.find(b => b.id === test.batchId);
        return <span className="font-mono text-sm">{batch?.batchNumber}</span>;
      }
    },
    {
      key: 'testType',
      header: 'Test Type',
      sortable: true,
      render: (test) => <Badge variant="outline">{test.testType}</Badge>
    },
    {
      key: 'parameter',
      header: 'Parameter',
      sortable: true
    },
    {
      key: 'actualValue',
      header: 'Result',
      render: (test) => (
        <div className="text-sm">
          <div>Expected: {test.expectedValue}</div>
          <div className="font-medium">Actual: {test.actualValue}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (test) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          pass: 'default',
          fail: 'destructive',
          pending: 'secondary'
        };
        return <Badge variant={variants[test.status]}>{test.status}</Badge>;
      }
    },
    {
      key: 'testedBy',
      header: 'Tested By',
      sortable: true
    },
    {
      key: 'testedAt',
      header: 'Tested At',
      sortable: true,
      render: (test) => new Date(test.testedAt).toLocaleString('en-IN', {
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
          <h1 className="text-2xl md:text-3xl font-bold">Processing & QC</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage processing batches and quality control</p>
        </div>
        <Dialog open={isNewBatchOpen} onOpenChange={setIsNewBatchOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Processing Batch</DialogTitle>
              <DialogDescription>Start a new processing batch</DialogDescription>
            </DialogHeader>
            <NewBatchForm onClose={() => setIsNewBatchOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBatches}</div>
            <p className="text-xs text-muted-foreground">In processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBatches}</div>
            <p className="text-xs text-muted-foreground">Awaiting start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">Batches finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgYieldEfficiency.toFixed(1)}%</div>
            <Progress value={avgYieldEfficiency} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="batches">Processing Batches</TabsTrigger>
          <TabsTrigger value="qc">Quality Control</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Batches</CardTitle>
              <CardDescription>All processing batches and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={batches}
                columns={batchColumns}
                searchPlaceholder="Search batches..."
                filename="processing-batches"
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control Tests</CardTitle>
              <CardDescription>QC test results for all batches</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={qcTests}
                columns={qcColumns}
                searchPlaceholder="Search tests..."
                filename="qc-tests"
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Yield Efficiency by Product</CardTitle>
                <CardDescription>Average yield vs expected</CardDescription>
              </CardHeader>
              <CardContent>
                <YieldAnalytics batches={batches} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QC Pass Rate</CardTitle>
                <CardDescription>Quality control metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <QCAnalytics tests={qcTests} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// New Batch Form
const NewBatchForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product">Product Type</Label>
        <Select>
          <SelectTrigger id="product">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toned">Toned Milk</SelectItem>
            <SelectItem value="fullcream">Full Cream Milk</SelectItem>
            <SelectItem value="curd">Curd</SelectItem>
            <SelectItem value="paneer">Paneer</SelectItem>
            <SelectItem value="ghee">Ghee</SelectItem>
            <SelectItem value="butter">Butter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inputMilk">Input Milk (Liters)</Label>
        <Input id="inputMilk" type="number" step="0.1" placeholder="0.0" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="operator">Operator</Label>
        <Select>
          <SelectTrigger id="operator">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ramesh">Ramesh Kumar</SelectItem>
            <SelectItem value="suresh">Suresh Patil</SelectItem>
            <SelectItem value="vijay">Vijay Reddy</SelectItem>
            <SelectItem value="mahesh">Mahesh Rao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Optional processing notes" />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Start Batch
        </Button>
      </div>
    </form>
  );
};

// Yield Analytics Component
const YieldAnalytics = ({ batches }: { batches: ProcessingBatch[] }) => {
  const products = Array.from(new Set(batches.map(b => b.productType)));
  const analytics = products.map(product => {
    const productBatches = batches.filter(b => b.productType === product && b.status === 'completed');
    const avgYield = productBatches.length > 0
      ? productBatches.reduce((sum, b) => sum + (b.actualYield / b.expectedYield * 100), 0) / productBatches.length
      : 0;
    
    return { product, avgYield, count: productBatches.length };
  });

  return (
    <div className="space-y-4">
      {analytics.map((item) => (
        <div key={item.product}>
          <div className="flex justify-between mb-2">
            <span className="font-medium">{item.product}</span>
            <span className="text-sm text-muted-foreground">{item.avgYield.toFixed(1)}%</span>
          </div>
          <Progress value={item.avgYield} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">{item.count} batches</div>
        </div>
      ))}
    </div>
  );
};

// QC Analytics Component
const QCAnalytics = ({ tests }: { tests: QCTest[] }) => {
  const testTypes = Array.from(new Set(tests.map(t => t.testType)));
  const analytics = testTypes.map(type => {
    const typeTests = tests.filter(t => t.testType === type);
    const passRate = (typeTests.filter(t => t.status === 'pass').length / typeTests.length) * 100;
    
    return { type, passRate, total: typeTests.length };
  });

  return (
    <div className="space-y-4">
      {analytics.map((item) => (
        <div key={item.type}>
          <div className="flex justify-between mb-2">
            <span className="font-medium">{item.type}</span>
            <span className="text-sm text-muted-foreground">{item.passRate.toFixed(1)}% pass</span>
          </div>
          <Progress value={item.passRate} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">{item.total} tests</div>
        </div>
      ))}
    </div>
  );
};
