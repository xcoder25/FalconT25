
'use client';

import React, { useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { DollarSign, Users, TrendingUp, FilePieChart, Building } from 'lucide-react';

// Mock data - In a real app, this would come from backend/calculations
const monthlyPayrollData = [
  { month: 'Jan 24', totalPayroll: 250000, paidStaff: 75, totalBonuses: 15000, totalDeductions: 8000 },
  { month: 'Feb 24', totalPayroll: 255000, paidStaff: 76, totalBonuses: 16000, totalDeductions: 8200 },
  { month: 'Mar 24', totalPayroll: 260000, paidStaff: 78, totalBonuses: 15500, totalDeductions: 8500 },
  { month: 'Apr 24', totalPayroll: 258000, paidStaff: 77, totalBonuses: 14000, totalDeductions: 8100 },
  { month: 'May 24', totalPayroll: 265000, paidStaff: 78, totalBonuses: 17000, totalDeductions: 8800 },
  { month: 'Jun 24', totalPayroll: 270000, paidStaff: 80, totalBonuses: 18000, totalDeductions: 9000 }, // Current month projection
];

const departmentPayrollData = [
  { name: 'Engineering', value: 100000, fill: 'hsl(var(--chart-1))' },
  { name: 'Sales & Marketing', value: 80000, fill: 'hsl(var(--chart-2))' },
  { name: 'Operations', value: 50000, fill: 'hsl(var(--chart-3))' },
  { name: 'HR & Admin', value: 35000, fill: 'hsl(var(--chart-4))' },
  { name: 'Support', value: 40000, fill: 'hsl(var(--chart-5))' },
];

const barChartConfig = {
  totalPayroll: { label: "Total Payroll", color: "hsl(var(--chart-1))" },
  totalBonuses: { label: "Bonuses", color: "hsl(var(--chart-2))" },
  totalDeductions: { label: "Deductions", color: "hsl(var(--chart-3))" },
};

const pieChartConfig = {
  value: { label: "Payroll Amount" },
  Engineering: { label: "Engineering", color: "hsl(var(--chart-1))" },
  "Sales & Marketing": { label: "Sales & Marketing", color: "hsl(var(--chart-2))" },
  Operations: { label: "Operations", color: "hsl(var(--chart-3))" },
  "HR & Admin": { label: "HR & Admin", color: "hsl(var(--chart-4))" },
  Support: { label: "Support", color: "hsl(var(--chart-5))" },
};


export default function PayrollReportsPage() {
  const currentMonthData = monthlyPayrollData[monthlyPayrollData.length - 1];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payroll Reports Dashboard"
        description="Visualize key payroll metrics, trends, and comparisons."
        children={<AreaChart className="h-8 w-8 text-primary" />}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll (This Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMonthData.totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">For {currentMonthData.month}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Staff (This Month)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthData.paidStaff}</div>
            <p className="text-xs text-muted-foreground">Active employees on payroll</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonuses (This Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMonthData.totalBonuses.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">Disbursed in bonuses</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions (This Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMonthData.totalDeductions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Applied as deductions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp size={20}/> Monthly Payroll Trends</CardTitle>
          <CardDescription>Comparison of total payroll, bonuses, and deductions over recent months.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={barChartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPayrollData} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                <YAxis tickFormatter={(value) => `$${value/1000}k`} tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Bar dataKey="totalPayroll" fill="var(--color-totalPayroll)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalBonuses" fill="var(--color-totalBonuses)" radius={[4, 4, 0, 0]} />
                {/* <Bar dataKey="totalDeductions" fill="var(--color-totalDeductions)" radius={[4, 4, 0, 0]} /> */}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building size={20}/> Payroll by Department (This Month)</CardTitle>
            <CardDescription>Distribution of total payroll costs across departments.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
             <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie data={departmentPayrollData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                     {departmentPayrollData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                   <Legend content={<ChartLegendContent nameKey="name" className="text-xs" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FilePieChart size={20}/> Additional Payroll Insights</CardTitle>
             <CardDescription>More detailed reports and analytics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">View Bonus Distribution Report</Button>
            <Button variant="outline" className="w-full justify-start">Analyze Deduction Trends</Button>
            <Button variant="outline" className="w-full justify-start">Compare Year-over-Year Payroll</Button>
            <Button variant="outline" className="w-full justify-start">Generate Tax Summary Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
