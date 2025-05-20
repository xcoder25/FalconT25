
'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, History, Users, FileText, Settings, PlayCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

export default function PayrollPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Payroll Management"
        description="Manage employee salaries, run payroll cycles, and view historical data."
      />

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
            <Button className="w-full">
              <PlayCircle className="mr-2 h-5 w-5" /> Start New Payroll Cycle
            </Button>
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
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Tax & Compliance</CardTitle>
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
