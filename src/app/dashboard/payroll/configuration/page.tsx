
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Percent, Trash2, PlusCircle, Save, SlidersHorizontal, CalendarDays, Briefcase, BadgePercent, XCircle, Gift, UserMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data structures
interface PayGrade { id: string; name: string; minSalary: number; maxSalary: number; }
interface Allowance { id: string; name: string; type: 'fixed' | 'percentage'; value: number; }
interface DeductionRule { id: string; name: string; description: string; type: 'fixed' | 'percentage'; value?: number; }

export default function PayrollConfigurationPage() {
  const { toast } = useToast();
  const [salaryFrequency, setSalaryFrequency] = useState<'monthly' | 'bi-weekly' | 'weekly'>('monthly');
  
  const [payGrades, setPayGrades] = useState<PayGrade[]>([
    { id: 'pg1', name: 'Entry Level', minSalary: 30000, maxSalary: 50000 },
    { id: 'pg2', name: 'Mid Level', minSalary: 50000, maxSalary: 80000 },
    { id: 'pg3', name: 'Senior Level', minSalary: 80000, maxSalary: 120000 },
  ]);
  const [allowances, setAllowances] = useState<Allowance[]>([
    { id: 'al1', name: 'Housing Allowance', type: 'fixed', value: 500 },
    { id: 'al2', name: 'Transport Allowance', type: 'fixed', value: 200 },
    { id: 'al3', name: 'Communication Allowance', type: 'percentage', value: 5 }, // 5% of base
  ]);
  const [deductions, setDeductions] = useState<DeductionRule[]>([
    { id: 'dd1', name: 'Lateness Penalty', description: 'Per hour of lateness', type: 'fixed', value: 10 },
    { id: 'dd2', name: 'Absence (Unexcused)', description: 'Per day of unexcused absence', type: 'fixed', value: 100 },
    { id: 'dd3', name: 'Standard Income Tax', description: 'Progressive tax based on income bracket', type: 'percentage' },
  ]);

  const [enablePenalties, setEnablePenalties] = useState(true);
  const [enableBonuses, setEnableBonuses] = useState(true);

  const handleSaveConfiguration = () => {
    console.log({ salaryFrequency, payGrades, allowances, deductions, enablePenalties, enableBonuses });
    toast({ title: 'Configuration Saved (Mock)', description: 'Payroll settings have been updated.' });
  };

  // Mock handlers for adding/removing items (would involve forms/dialogs in a real app)
  const addPayGrade = () => toast({ description: "Mock: Add Pay Grade dialog would open."});
  const removePayGrade = (id: string) => toast({ description: `Mock: Removed Pay Grade ${id}`});
  const addAllowance = () => toast({ description: "Mock: Add Allowance dialog would open."});
  const removeAllowance = (id: string) => toast({ description: `Mock: Removed Allowance ${id}`});
  const addDeduction = () => toast({ description: "Mock: Add Deduction Rule dialog would open."});
  const removeDeduction = (id: string) => toast({ description: `Mock: Removed Deduction ${id}`});

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payroll Configuration"
        description="Define core payroll settings, salary structures, allowances, and deductions for your organization."
        children={<SlidersHorizontal className="h-8 w-8 text-primary" />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays size={20}/> Salary Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={salaryFrequency} onValueChange={(v) => setSalaryFrequency(v as any)}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase size={20}/> Salary Levels / Pay Grades</CardTitle>
          <CardDescription>Define different pay grades and their respective salary ranges.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade Name</TableHead>
                <TableHead>Min Salary</TableHead>
                <TableHead>Max Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payGrades.map(pg => (
                <TableRow key={pg.id}>
                  <TableCell>{pg.name}</TableCell>
                  <TableCell>${pg.minSalary.toLocaleString()}</TableCell>
                  <TableCell>${pg.maxSalary.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => removePayGrade(pg.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={addPayGrade}><PlusCircle className="mr-2 h-4 w-4" /> Add Pay Grade</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BadgePercent size={20}/> Allowances</CardTitle>
          <CardDescription>Manage fixed or percentage-based allowances (e.g., housing, transport).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Allowance Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allowances.map(al => (
                <TableRow key={al.id}>
                  <TableCell>{al.name}</TableCell>
                  <TableCell className="capitalize">{al.type}</TableCell>
                  <TableCell>{al.type === 'fixed' ? `$${al.value.toLocaleString()}` : `${al.value}%`}</TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" onClick={() => removeAllowance(al.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={addAllowance}><PlusCircle className="mr-2 h-4 w-4" /> Add Allowance</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserMinus size={20}/> Deductions & Penalties</CardTitle>
          <CardDescription>Define rules for deductions, tax, lateness, or absences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Switch id="enablePenalties" checked={enablePenalties} onCheckedChange={setEnablePenalties} />
            <Label htmlFor="enablePenalties">Enable Standard Penalties (Lateness/Absence)</Label>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deduction Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value (if applicable)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deductions.map(dd => (
                <TableRow key={dd.id}>
                  <TableCell>{dd.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{dd.description}</TableCell>
                  <TableCell className="capitalize">{dd.type}</TableCell>
                  <TableCell>{dd.value ? (dd.type === 'fixed' ? `$${dd.value.toLocaleString()}`: `${dd.value}%`) : 'Rule-based'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeDeduction(dd.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={addDeduction}><PlusCircle className="mr-2 h-4 w-4" /> Add Deduction Rule</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gift size={20}/> Bonuses</CardTitle>
          <CardDescription>Configure bonus structures and criteria.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center space-x-2">
            <Switch id="enableBonuses" checked={enableBonuses} onCheckedChange={setEnableBonuses} />
            <Label htmlFor="enableBonuses">Enable Performance/Holiday Bonuses</Label>
          </div>
          {/* Placeholder for bonus configuration UI */}
          <p className="text-sm text-muted-foreground mt-4">Further bonus configuration options would appear here (e.g., defining bonus types, eligibility).</p>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSaveConfiguration}><Save className="mr-2 h-5 w-5" /> Save All Payroll Configurations</Button>
      </div>
    </div>
  );
}
