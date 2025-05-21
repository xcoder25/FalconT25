
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, History, Users, FileText, Settings, PlayCircle, Banknote, Link as LinkIcon, Unlink, FileDown, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Mock data for demonstration
const mockPayrollHistory = [
  { id: 'payroll1', period: 'May 2024', dateRun: '2024-05-30', totalAmount: 55200.75, status: 'Paid' },
  { id: 'payroll2', period: 'April 2024', dateRun: '2024-04-28', totalAmount: 54800.50, status: 'Paid' },
  { id: 'payroll3', period: 'March 2024', dateRun: '2024-03-29', totalAmount: 55100.00, status: 'Paid' },
];

const mockPayrollSummaryData = [
  { month: 'Jan', total: 52000 },
  { month: 'Feb', total: 53500 },
  { month: 'Mar', total: 55100 },
  { month: 'Apr', total: 54800 },
  { month: 'May', total: 55200 },
  { month: 'Jun', total: 0 }, // Placeholder for current/future
];

const chartConfig = {
  total: {
    label: "Total Payroll",
    color: "hsl(var(--chart-1))",
  },
};

const mockBanks = [
  { id: 'gtbank', name: 'GTBank' },
  { id: 'access', name: 'Access Bank' },
  { id: 'zenith', name: 'Zenith Bank' },
  { id: 'uba', name: 'UBA' },
  { id: 'firstbank', name: 'First Bank' },
  { id: 'other', name: 'Other (Manual CSV)'},
];

export default function PayrollPage() {
  const { toast } = useToast();

  const [selectedBank, setSelectedBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [payoutSchedule, setPayoutSchedule] = useState<'monthly' | 'bi-weekly' | ''>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectedBankInfo, setConnectedBankInfo] = useState<{ name: string; accountNumber: string; schedule: string } | null>(null);

  const handleConnectBank = async () => {
    if (!selectedBank || !accountNumber || !apiKey || !payoutSchedule) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a bank and fill all required bank details.' });
      return;
    }
    if (selectedBank === 'other') {
        toast({ title: 'Manual CSV Selected', description: 'No connection needed for "Other". Use the CSV download option.'});
        setConnectedBankInfo({name: "Manual CSV Upload", accountNumber: "N/A", schedule: "N/A"});
        return;
    }

    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    setIsConnecting(false);
    
    const bankName = mockBanks.find(b => b.id === selectedBank)?.name || 'Selected Bank';
    setConnectedBankInfo({ name: bankName, accountNumber, schedule: payoutSchedule });
    toast({ title: 'Bank Connected!', description: `Successfully connected to ${bankName}. Payroll data can now be (simulated) synced.` });
  };

  const handleDisconnectBank = () => {
    const bankName = connectedBankInfo?.name;
    setConnectedBankInfo(null);
    setSelectedBank('');
    setAccountNumber('');
    setApiKey('');
    setPayoutSchedule('');
    toast({ title: 'Bank Disconnected', description: `${bankName || 'Bank'} integration has been disconnected.` });
  };
  
  const handleDownloadCSV = () => {
    toast({
        title: "Payroll CSV Downloaded (Simulated)",
        description: "A CSV file for manual bank upload would be generated here.",
    });
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="Payroll Management"
        description="Manage employee salaries, run payroll cycles, view history, and integrate with your bank."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Banknote className="h-6 w-6 text-primary" />
            Bank Integration & Payroll Export
          </CardTitle>
          <CardDescription>
            Connect your corporate bank account for direct payroll processing or download a CSV file for manual uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {connectedBankInfo ? (
            <div className="space-y-4 p-4 border rounded-md bg-secondary/30">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-green-500">Connected to: {connectedBankInfo.name}</p>
                  {connectedBankInfo.name !== "Manual CSV Upload" &&
                    <>
                        <p className="text-sm text-muted-foreground">Account: ****{connectedBankInfo.accountNumber.slice(-4)}</p>
                        <p className="text-sm text-muted-foreground">Payout Schedule: {connectedBankInfo.schedule.charAt(0).toUpperCase() + connectedBankInfo.schedule.slice(1)}</p>
                    </>
                  }
                </div>
                <Button onClick={handleDisconnectBank} variant="outline" size="sm">
                  <Unlink className="mr-2 h-4 w-4" /> Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bank-select">Select Your Bank</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger id="bank-select">
                    <SelectValue placeholder="Choose your bank..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBanks.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBank && selectedBank !== 'other' && (
                <>
                  <div>
                    <Label htmlFor="account-number">Corporate Account Number</Label>
                    <Input 
                      id="account-number" 
                      value={accountNumber} 
                      onChange={(e) => setAccountNumber(e.target.value)} 
                      placeholder="e.g., 0123456789" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-key">Bank API Key / Credentials</Label>
                    <Input 
                      id="api-key" 
                      type="password" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)} 
                      placeholder="Enter your bank API key (mock)" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="payout-schedule">Payout Schedule</Label>
                    <Select value={payoutSchedule} onValueChange={(value) => setPayoutSchedule(value as 'monthly' | 'bi-weekly' | '')}>
                      <SelectTrigger id="payout-schedule">
                        <SelectValue placeholder="Select schedule..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <Button onClick={handleConnectBank} disabled={isConnecting || (!selectedBank || (selectedBank !== 'other' && (!accountNumber || !apiKey || !payoutSchedule)))}>
                {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                {selectedBank === 'other' ? 'Confirm Manual CSV Method' : 'Connect Bank'}
              </Button>
            </div>
          )}
          
          <Separator className="my-6" />

          <div>
            <h3 className="text-md font-semibold mb-2">Manual Payroll Export</h3>
             <Button onClick={handleDownloadCSV} variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> Download Payroll File (CSV)
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
                You can upload this CSV file to your bank's portal manually if direct integration is not available or not configured.
            </p>
          </div>
        </CardContent>
      </Card>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Run Payroll</CardTitle>
            <PlayCircle className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Initiate a new payroll cycle for the current period. Review details before finalizing.
            </CardDescription>
            <Button className="w-full" disabled={!connectedBankInfo && selectedBank !== 'other'}>
              <PlayCircle className="mr-2 h-5 w-5" /> Start New Payroll Cycle
            </Button>
             {!connectedBankInfo && selectedBank !== 'other' && <p className="text-xs text-destructive mt-1">Connect bank or select manual CSV to enable.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$273,801.25</div>
            <p className="text-xs text-muted-foreground">
              Based on completed payroll cycles this year.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payroll Date</CardTitle>
             <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">June 28, 2024</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for end of current month.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart size={20} /> Monthly Payroll Summary</CardTitle>
          <CardDescription>Total payroll amounts disbursed each month.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPayrollSummaryData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  fontSize={12} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  fontSize={12}
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Payroll History</CardTitle>
          <CardDescription>Review past payroll cycles and download reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Date Run</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayrollHistory.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell className="font-medium">{payroll.period}</TableCell>
                  <TableCell>{new Date(payroll.dateRun).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">${payroll.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      payroll.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {payroll.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {mockPayrollHistory.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No payroll history found.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Employee Pay Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="mb-4">
                    Manage individual salary, deductions, and payment methods for each employee.
                </CardDescription>
                <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" /> Go to Employee Settings
                </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Tax &amp; Compliance</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="mb-4">
                    Access tax forms, generate compliance reports, and manage year-end processes.
                </CardDescription>
                <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> Access Tax Documents
                </Button>
            </CardContent>
          </Card>
      </div>

    </div>
  );
}
