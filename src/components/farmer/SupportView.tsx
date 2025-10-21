// Support view for farmer portal - help, FAQs, and contact

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { getFarmerById } from '../../lib/sample-data';
import { getCurrentFarmerId } from '../../lib/auth';
import { formatDate } from '../../lib/utils';
import { 
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  BookOpen,
  Video,
  Users,
  Smartphone,
  CreditCard,
  Droplets,
  TrendingUp,
  Settings,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  lastUpdated: string;
  message: string;
}

const faqs = [
  {
    category: 'Milk Collection',
    icon: Droplets,
    questions: [
      {
        q: 'What time should I deliver my milk?',
        a: 'Morning shift is from 6:00 AM to 9:00 AM, and evening shift is from 6:00 PM to 9:00 PM. Please deliver during your assigned shift time.'
      },
      {
        q: 'How is the quality of my milk tested?',
        a: 'We test Fat percentage, SNF (Solids Not Fat), temperature, lactometer reading, and check for adulterants like water, starch, and detergent. All tests are done using automated equipment for accuracy.'
      },
      {
        q: 'What happens if my milk fails quality checks?',
        a: 'If milk contains adulterants or fails quality parameters, it may be rejected or accepted at a lower rate. We will inform you immediately and suggest improvements.'
      },
      {
        q: 'Can I deliver milk twice a day?',
        a: 'Yes, you can deliver both morning and evening if you have sufficient production. Each delivery is recorded separately.'
      }
    ]
  },
  {
    category: 'Payments',
    icon: CreditCard,
    questions: [
      {
        q: 'When will I receive my payment?',
        a: 'Payments are processed weekly. After your milk is approved (usually within 2-3 days), payment is initiated and reaches your account within 3-5 business days.'
      },
      {
        q: 'How is my milk rate calculated?',
        a: 'Rate = Base Rate (₹22/L) + (Fat % × ₹3.5) + (SNF % × ₹2.5). Premium farmers get higher base and component rates.'
      },
      {
        q: 'How can I update my bank details?',
        a: 'Go to Profile > Payment Details and update your bank account or UPI ID. Changes are verified within 24 hours.'
      },
      {
        q: 'Can I check my payment history?',
        a: 'Yes, go to the Payments tab to see all your past payments, pending amounts, and download receipts.'
      }
    ]
  },
  {
    category: 'Quality & Pricing',
    icon: TrendingUp,
    questions: [
      {
        q: 'How can I improve my milk quality?',
        a: 'Maintain clean milking equipment, ensure proper cattle nutrition, maintain cooling temperature, and avoid water addition. Regular cattle health checkups also help.'
      },
      {
        q: 'What is a good Fat and SNF percentage?',
        a: 'Good cow milk has 3.5-5.0% Fat and 8.5-9.5% SNF. Buffalo milk typically has higher Fat (6-8%) and SNF (9-10%).'
      },
      {
        q: 'Can I get a premium rate card?',
        a: 'Premium rates are offered to farmers who consistently deliver high-quality milk (Fat > 4.5%, SNF > 9%) with zero rejections for 3 consecutive months.'
      },
      {
        q: 'Why does my rate vary daily?',
        a: 'Rates depend on Fat and SNF content which naturally varies based on cattle feed, health, and weather. The base rate remains constant.'
      }
    ]
  },
  {
    category: 'App & Technical',
    icon: Smartphone,
    questions: [
      {
        q: 'How do I check my delivery status?',
        a: 'Go to the Deliveries tab to see all your milk deliveries with quality parameters, amounts, and approval status.'
      },
      {
        q: 'What if I forgot my password?',
        a: 'Click "Forgot Password" on the login screen and follow the instructions. You will receive a reset link on your registered mobile number.'
      },
      {
        q: 'Can I use this app on multiple devices?',
        a: 'Yes, you can login on any device using your credentials. However, only one active session is allowed at a time.'
      },
      {
        q: 'How do I download my payment receipts?',
        a: 'In the Payments tab, click on any completed payment and select "Download Receipt" to get a PDF copy.'
      }
    ]
  }
];

export const SupportView = () => {
  const farmerId = getCurrentFarmerId();
  const farmer = farmerId ? getFarmerById(farmerId) : null;
  const [tickets] = useState<SupportTicket[]>([
    {
      id: 'TKT001',
      subject: 'Payment not received for last week',
      category: 'Payments',
      status: 'in-progress',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'I have not received my payment for the week ending last Sunday.'
    },
    {
      id: 'TKT002',
      subject: 'Milk rejection query',
      category: 'Quality',
      status: 'resolved',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      message: 'Why was my morning delivery rejected yesterday?'
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    message: ''
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTicket.subject || !newTicket.message) {
      toast.error('Please fill all required fields');
      return;
    }

    toast.success('Support ticket submitted successfully! We will respond within 24 hours.');
    setNewTicket({ subject: '', category: 'general', message: '' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'in-progress':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Open</Badge>;
    }
  };

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

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Get help and find answers to your questions</p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Call Us</div>
                <div className="text-sm text-muted-foreground">+91 80 1234 5678</div>
                <Badge variant="secondary" className="mt-1 text-xs">24/7 Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">WhatsApp</div>
                <div className="text-sm text-muted-foreground">+91 98765 43210</div>
                <Badge variant="secondary" className="mt-1 text-xs">Quick Response</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Email Support</div>
                <div className="text-sm text-muted-foreground">support@milkman.in</div>
                <Badge variant="secondary" className="mt-1 text-xs">Response in 24h</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">
            <BookOpen className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <FileText className="h-4 w-4 mr-2" />
            My Tickets ({tickets.length})
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Video className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {faqs.map((category, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <category.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{category.category}</h3>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, qIdx) => (
                      <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                        <AccordionTrigger className="text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Still Need Help? */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Still need help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find what you're looking for? Create a support ticket and we'll assist you.
                </p>
                <Button onClick={() => {
                  const tabsList = document.querySelector('[value="tickets"]') as HTMLButtonElement;
                  tabsList?.click();
                }}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create Support Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-4">
          {/* New Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Support Ticket</CardTitle>
              <CardDescription>We typically respond within 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="payments">Payments</option>
                    <option value="quality">Quality/Testing</option>
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account & Profile</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
              <CardDescription>Track your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No support tickets yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{ticket.subject}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ticket #{ticket.id} • {ticket.category}
                          </div>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>

                      <p className="text-sm text-muted-foreground mt-3 mb-3">
                        {ticket.message}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <span>Created: {formatDate(ticket.createdAt)}</span>
                        <span>Updated: {formatDate(ticket.lastUpdated)}</span>
                      </div>

                      {ticket.status !== 'resolved' && (
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          View Details
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Learn how to use the app effectively</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-1">Getting Started with Milkman</h4>
                  <p className="text-sm text-muted-foreground">5 min tutorial</p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-1">Understanding Quality Tests</h4>
                  <p className="text-sm text-muted-foreground">8 min tutorial</p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-1">How Payments Work</h4>
                  <p className="text-sm text-muted-foreground">6 min tutorial</p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium mb-1">Improving Milk Quality</h4>
                  <p className="text-sm text-muted-foreground">12 min tutorial</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guides & Documentation</CardTitle>
              <CardDescription>Detailed guides and best practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Farmer Handbook (PDF)
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Quality Guidelines
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Payment Schedule & Policies
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Cattle Care Best Practices
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
