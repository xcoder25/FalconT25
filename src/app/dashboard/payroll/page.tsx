
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, History, Users, FileText, Settings, PlayCircle, SlidersHorizontal, FileSignature, TableProperties, AreaChart, ChevronRight, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

const mockPayrollSummaryData = [
  { month: 'Jan', total: 52000 },
  { month: 'Feb', total: 53500 },
  { month: 'Mar', total: 55100 },
  { month: 'Apr', total: 54800 },
  { month: 'May', total: 55200 },
  { month: 'Jun', total: 0 }, 
];

const chartConfig = {
  total: {
    label: "Total Payroll",
    color: "hsl(var(--chart-1))",
  },
};

interface PayrollSubPageLinkProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

const PayrollSubPageLink: React.FC<PayrollSubPageLinkProps> = ({ title, description, href, icon: Icon }) => {
  const router = useRouter();
  return (
    <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50"
        onClick={() => router.push(href)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button variant="link" className="p-0 text-sm">
          Go to {title} <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function PayrollPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Payroll Management Hub"
        description="Central dashboard for payroll operations, setup, and reporting."
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PayrollSubPageLink 
          title="Payroll Configuration"
          description="Set salary frequencies, pay grades, allowances, and deductions."
          href="/dashboard/payroll/configuration"
          icon={SlidersHorizontal}
        />
        <PayrollSubPageLink 
          title="Salary Templates"
          description="Create and manage salary templates for different roles."
          href="/dashboard/payroll/templates"
          icon={FileSignature}
        />
        <PayrollSubPageLink 
          title="Payroll Export"
          description="Generate payroll files for bank uploads and record-keeping."
          href="/dashboard/payroll/export"
          icon={TableProperties}
        />
        <PayrollSubPageLink 
          title="Payroll Reports"
          description="View visual statistics and compare payroll data across periods."
          href="/dashboard/payroll/reports"
          icon={AreaChart}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Run Payroll</CardTitle>
          <PlayCircle className="h-6 w-6 text-primary" />
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Initiate a new payroll cycle for the current period. Review details before finalizing.
          </CardDescription>
          <Button className="w-full sm:w-auto" onClick={() => alert("Mock: Navigate to Run Payroll Process")}>
            <PlayCircle className="mr-2 h-5 w-5" /> Start New Payroll Cycle
          </Button>
        </CardContent>
      </Card>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid (YTD - Mock)</CardTitle>
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
            <CardTitle className="text-sm font-medium">Next Payroll Date (Mock)</CardTitle>
             <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">June 28, 2024</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for end of current month.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees (Mock)</CardTitle>
             <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <p className="text-xs text-muted-foreground">
              Currently on active payroll.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Monthly Payroll Summary (Mock)</CardTitle>
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
    </div>
  );
}
