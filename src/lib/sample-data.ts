// Sample data for Milkman dairy operations system

// User roles and authentication
export const ROLES = {
  ADMIN: 'admin',
  FARMER: 'farmer',
  CONSUMER: 'consumer'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  farmerId?: string; // Links to farmer data if role is farmer
}

// Rate cards
export interface RateCard {
  id: string;
  name: string;
  baseRate: number; // per liter in INR
  fatRate: number; // per % fat
  snfRate: number; // per % SNF
  effectiveDate: string;
  isDefault: boolean;
}

export const rateCards: RateCard[] = [
  {
    id: 'default',
    name: 'Default Rate Card',
    baseRate: 22,
    fatRate: 3.5,
    snfRate: 2.5,
    effectiveDate: '2024-01-01',
    isDefault: true
  },
  {
    id: 'premium',
    name: 'Premium Quality',
    baseRate: 25,
    fatRate: 4.0,
    snfRate: 3.0,
    effectiveDate: '2024-01-01',
    isDefault: false
  }
];

// Routes
export interface Route {
  id: string;
  name: string;
  code: string;
  area: string;
}

export const routes: Route[] = [
  { id: 'R1', name: 'Route 1 - Hebbal', code: 'R1', area: 'Hebbal' },
  { id: 'R2', name: 'Route 2 - Whitefield', code: 'R2', area: 'Whitefield' },
  { id: 'R3', name: 'Route 3 - Jayanagar', code: 'R3', area: 'Jayanagar' },
  { id: 'R4', name: 'Route 4 - Indiranagar', code: 'R4', area: 'Indiranagar' }
];

// Farmers
export interface Farmer {
  id: string;
  code: string;
  name: string;
  phone: string;
  bankAccount?: string;
  upiId?: string;
  routeId: string;
  defaultShift: 'morning' | 'evening';
  joinDate: string;
  averageFat: number;
  averageSnf: number;
  rateCardId: string;
  status: 'active' | 'inactive';
}

// Generate 50 farmers
const farmerNames = [
  'Ravi Kumar', 'Suresh Reddy', 'Manjunath Gowda', 'Venkatesh Rao', 'Prakash Naik',
  'Ramesh Patil', 'Krishna Murthy', 'Srinivas Reddy', 'Rajesh Kumar', 'Mohan Das',
  'Nagesh Rao', 'Dinesh Gowda', 'Sunil Kumar', 'Praveen Reddy', 'Mahesh Patil',
  'Deepak Rao', 'Vinod Kumar', 'Ashok Reddy', 'Santosh Gowda', 'Raghav Das',
  'Kiran Kumar', 'Shankar Rao', 'Vijay Reddy', 'Pradeep Gowda', 'Sagar Patil',
  'Naveen Kumar', 'Rakesh Rao', 'Gopal Reddy', 'Hari Das', 'Jagdish Kumar',
  'Lakshman Rao', 'Murali Reddy', 'Nanda Gowda', 'Prasad Kumar', 'Rohan Patil',
  'Sachin Rao', 'Tarun Reddy', 'Umesh Das', 'Varun Kumar', 'Yogesh Rao',
  'Anil Reddy', 'Babu Gowda', 'Chandra Kumar', 'Dhanush Rao', 'Ganesh Patil',
  'Hari Kumar', 'Indra Rao', 'Jagan Reddy', 'Karthik Das', 'Loki Kumar'
];

export const farmers: Farmer[] = farmerNames.map((name, index) => ({
  id: `F${String(index + 1).padStart(3, '0')}`,
  code: `F${String(index + 1).padStart(3, '0')}`,
  name,
  phone: `+91${9000000000 + index}`,
  bankAccount: `12345678${String(index).padStart(2, '0')}`,
  upiId: `${name.toLowerCase().replace(' ', '.')}@paytm`,
  routeId: routes[index % 4].id,
  defaultShift: index % 2 === 0 ? 'morning' : 'evening',
  joinDate: new Date(2023, Math.floor(index / 10), (index % 28) + 1).toISOString().split('T')[0],
  averageFat: 3.2 + (Math.random() * 1.8), // 3.2 - 5.0%
  averageSnf: 8.0 + (Math.random() * 1.5), // 8.0 - 9.5%
  rateCardId: index < 10 ? 'premium' : 'default', // First 10 farmers get premium rates
  status: 'active'
}));

// Collection sessions
export interface CollectionSession {
  id: string;
  date: string;
  routeId: string;
  shift: 'morning' | 'evening';
  status: 'open' | 'completed' | 'approved';
  totalLiters: number;
  totalAmount: number;
  averageFat: number;
  averageSnf: number;
  collections: MilkCollection[];
}

export interface MilkCollection {
  id: string;
  sessionId: string;
  farmerId: string;
  canId: string;
  quantity: number; // liters
  fat: number; // percentage
  snf: number; // percentage
  temperature: number; // celsius
  lactometer: number;
  adulteryChecks: {
    waterAdded: boolean;
    starchAdded: boolean;
    detergent: boolean;
  };
  rate: number; // computed rate per liter
  amount: number; // total amount for this collection
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Generate collection data for last 30 days
const generateCollections = (): CollectionSession[] => {
  const sessions: CollectionSession[] = [];
  const today = new Date();
  
  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    
    routes.forEach(route => {
      ['morning', 'evening'].forEach(shift => {
        const sessionId = `${route.id}-${dateStr}-${shift}`;
        const collections: MilkCollection[] = [];
        
        // Get farmers for this route
        const routeFarmers = farmers.filter(f => f.routeId === route.id);
        
        // Random subset of farmers deliver on any given day/shift
        const deliveryFarmers = routeFarmers.filter(() => Math.random() > 0.3);
        
        deliveryFarmers.forEach(farmer => {
          const rateCard = rateCards.find(r => r.id === farmer.rateCardId) || rateCards[0];
          const quantity = 10 + Math.random() * 40; // 10-50 liters
          const fat = farmer.averageFat + (Math.random() - 0.5) * 0.8;
          const snf = farmer.averageSnf + (Math.random() - 0.5) * 0.6;
          const rate = rateCard.baseRate + (fat * rateCard.fatRate) + (snf * rateCard.snfRate);
          
          collections.push({
            id: `${sessionId}-${farmer.id}`,
            sessionId,
            farmerId: farmer.id,
            canId: `CAN${Math.floor(Math.random() * 50) + 1}`,
            quantity: Math.round(quantity * 10) / 10,
            fat: Math.round(fat * 100) / 100,
            snf: Math.round(snf * 100) / 100,
            temperature: 28 + Math.random() * 8, // 28-36°C
            lactometer: 26 + Math.random() * 6, // 26-32 LR
            adulteryChecks: {
              waterAdded: Math.random() < 0.05,
              starchAdded: Math.random() < 0.02,
              detergent: Math.random() < 0.01
            },
            rate: Math.round(rate * 100) / 100,
            amount: Math.round(quantity * rate * 100) / 100,
            timestamp: new Date(date.getTime() + (shift === 'morning' ? 6 : 18) * 60 * 60 * 1000).toISOString(),
            status: day < 3 ? 'pending' : 'approved'
          });
        });
        
        if (collections.length > 0) {
          const totalLiters = collections.reduce((sum, c) => sum + c.quantity, 0);
          const totalAmount = collections.reduce((sum, c) => sum + c.amount, 0);
          const averageFat = collections.reduce((sum, c) => sum + c.fat, 0) / collections.length;
          const averageSnf = collections.reduce((sum, c) => sum + c.snf, 0) / collections.length;
          
          sessions.push({
            id: sessionId,
            date: dateStr,
            routeId: route.id,
            shift,
            status: day < 2 ? 'open' : day < 5 ? 'completed' : 'approved',
            totalLiters: Math.round(totalLiters * 10) / 10,
            totalAmount: Math.round(totalAmount * 100) / 100,
            averageFat: Math.round(averageFat * 100) / 100,
            averageSnf: Math.round(averageSnf * 100) / 100,
            collections
          });
        }
      });
    });
  }
  
  return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const collectionSessions = generateCollections();
export const allCollections = collectionSessions.flatMap(s => s.collections);

// Products
export interface Product {
  id: string;
  name: string;
  category: string;
  fatContent?: number;
  packSize: string;
  unit: string;
  price: number;
  description: string;
  image?: string;
}

export const products: Product[] = [
  {
    id: 'MILK_TONED',
    name: 'Toned Milk',
    category: 'Milk',
    fatContent: 3.0,
    packSize: '500ml',
    unit: 'pouch',
    price: 28,
    description: 'Fresh toned milk with 3% fat content'
  },
  {
    id: 'MILK_FULL_CREAM',
    name: 'Full Cream Milk',
    category: 'Milk', 
    fatContent: 6.0,
    packSize: '500ml',
    unit: 'pouch',
    price: 35,
    description: 'Rich full cream milk with 6% fat content'
  },
  {
    id: 'CURD_500',
    name: 'Fresh Curd',
    category: 'Dairy',
    packSize: '500g',
    unit: 'cup',
    price: 45,
    description: 'Fresh homemade style curd'
  },
  {
    id: 'PANEER_250',
    name: 'Fresh Paneer',
    category: 'Dairy',
    packSize: '250g',
    unit: 'pack',
    price: 120,
    description: 'Soft fresh paneer made daily'
  },
  {
    id: 'GHEE_500',
    name: 'Pure Ghee',
    category: 'Dairy',
    packSize: '500ml',
    unit: 'bottle',
    price: 450,
    description: 'Pure cow ghee made from fresh cream'
  },
  {
    id: 'BUTTER_100',
    name: 'Fresh Butter',
    category: 'Dairy',
    packSize: '100g',
    unit: 'pack',
    price: 85,
    description: 'Creamy fresh butter'
  }
];

// Sample users for each role
export const sampleUsers: User[] = [
  {
    id: 'admin1',
    name: 'Rajesh Kumar',
    email: 'admin@milkman.in',
    role: ROLES.ADMIN,
    phone: '+91 98765 43210'
  },
  {
    id: 'farmer1', 
    name: 'Ravi Kumar',
    email: 'ravi@farmer.in',
    role: ROLES.FARMER,
    phone: '+91 9000000000',
    farmerId: 'F001'
  },
  {
    id: 'consumer1',
    name: 'Priya Sharma',
    email: 'priya@consumer.in', 
    role: ROLES.CONSUMER,
    phone: '+91 98765 12345'
  }
];

// Helper functions
export const calculateRate = (fat: number, snf: number, rateCardId: string): number => {
  const rateCard = rateCards.find(r => r.id === rateCardId) || rateCards[0];
  return rateCard.baseRate + (fat * rateCard.fatRate) + (snf * rateCard.snfRate);
};

export const getFarmerById = (id: string): Farmer | undefined => {
  return farmers.find(f => f.id === id);
};

export const getRouteById = (id: string): Route | undefined => {
  return routes.find(r => r.id === id);
};

export const getCollectionsByFarmer = (farmerId: string): MilkCollection[] => {
  return allCollections.filter(c => c.farmerId === farmerId);
};

export const getTodaysCollections = (): CollectionSession[] => {
  const today = new Date().toISOString().split('T')[0];
  return collectionSessions.filter(s => s.date === today);
};

export const getWeeklyPayouts = (weekStart: string): { farmerId: string; amount: number; status: string }[] => {
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  const weekCollections = allCollections.filter(c => {
    const collectionDate = new Date(c.timestamp);
    return collectionDate >= startDate && collectionDate <= endDate && c.status === 'approved';
  });
  
  const farmerPayouts = weekCollections.reduce((acc, collection) => {
    if (!acc[collection.farmerId]) {
      acc[collection.farmerId] = 0;
    }
    acc[collection.farmerId] += collection.amount;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(farmerPayouts).map(([farmerId, amount]) => ({
    farmerId,
    amount: Math.round(amount * 100) / 100,
    status: Math.random() > 0.7 ? 'paid' : 'pending'
  }));
};