
'use client';

import React, { useState, useMemo } from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { FileDown, Filter, TableProperties, Search, FileText, Sheet as SheetIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockStaffMembers, mockBranches } from '@/lib/mockData'; // Assuming these exist
import type { StaffMember, Branch } from '@/lib/types'; // Assuming these exist
import { Input } from '@/components/ui/input';

// Mock payroll summary data structure
interface PayrollSummaryEntry {
  staffId: string;
  staffName: string;
  department?: string;
  branchName?: string;
  baseSalary: number;
  allowancesTotal: number;
  deductionsTotal: number;
  netPay: number;
}

const ALL_DEPARTMENTS = "__ALL_DEPARTMENTS__";
const ALL_BRANCHES = "__ALL_BRANCHES__";

// Generate more diverse mock payroll data
const generateMockPayrollData = (staffList: StaffMember[], branches: Branch[]): PayrollSummaryEntry[] => {
  return staffList.map(staff => {
    const baseSalary = Math.floor(Math.random() * (120000 - 30000 + 1) + 30000); // Random base between 30k-120k
    const allowancesTotal = Math.floor(Math.random() * (baseSalary * 0.3)); // Allowances up to 30% of base
    const deductionsTotal = Math.floor(Math.random() * (baseSalary * 0.15)); // Deductions up to 15% of base
    const netPay = baseSalary + allowancesTotal - deductionsTotal;
    const branch = branches.find(b => b.id === staff.branchId);

    return {
      staffId: staff.id,
      staffName: staff.name,
      department: staff.department || 'N/A',
      branchName: branch?.name || 'N/A',
      baseSalary,
      allowancesTotal,
      deductionsTotal,
      netPay,
    };
  });
};


export default function PayrollExportPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });
  const [departmentFilter, setDepartmentFilter] = useState<string>(ALL_DEPARTMENTS);
  const [branchFilter, setBranchFilter] = useState<string>(ALL_BRANCHES);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const mockPayrollData = useMemo(() => generateMockPayrollData(mockStaffMembers, mockBranches), []);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(mockStaffMembers.map(s => s.department).filter(Boolean));
    return Array.from(depts) as string[];
  }, []);
  
  const uniqueBranches = useMemo(() => {
    return mockBranches.map(b => b.name);
  }, []);

  const filteredPayrollData = useMemo(() => {
    return mockPayrollData.filter(item => {
      const matchesDepartment = departmentFilter === ALL_DEPARTMENTS || item.department === departmentFilter;
      const matchesBranch = branchFilter === ALL_BRANCHES || item.branchName === branchFilter;
      const matchesSearch = searchTerm === '' || 
                            item.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase()));
      // Date range filter would be applied here if payroll data had timestamps
      return matchesDepartment && matchesBranch && matchesSearch;
    });
  }, [mockPayrollData, departmentFilter, branchFilter, searchTerm, dateRange]);

  const handleExportCSV = () => {
    toast({ title: 'Exporting CSV (Mock)', description: 'Payroll data would be compiled and downloaded as CSV.' });
  };
  const handleExportPDF = () => {
    toast({ title: 'Exporting PDF (Mock)', description: 'Payroll summary would be generated as a PDF.' });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payroll Export"
        description="Select criteria and export payroll summaries for bank uploads or reporting."
        children={<TableProperties className="h-8 w-8 text-primary" />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter size={20}/> Filter Payroll Data</CardTitle>
          <CardDescription>Select the period and filters for the payroll export.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="dateRange">Payroll Period</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateRange"
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${!dateRange && "text-muted-foreground"}`}
                >
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="departmentFilter">Department</Label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger id="departmentFilter"><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DEPARTMENTS}>All Departments</SelectItem>
                {uniqueDepartments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="branchFilter">Branch</Label>
             <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger id="branchFilter"><SelectValue placeholder="All Branches" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_BRANCHES}>All Branches</SelectItem>
                {uniqueBranches.map(branchName => <SelectItem key={branchName} value={branchName}>{branchName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="searchTerm">Search Staff/Dept</Label>
            <Input 
                id="searchTerm" 
                placeholder="Search by name or department..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search size={20}/> Payroll Summary Preview</CardTitle>
          <CardDescription>Review the filtered payroll data before exporting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Base Salary</TableHead>
                  <TableHead className="text-right">Allowances</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right font-semibold">Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayrollData.length > 0 ? filteredPayrollData.map(item => (
                  <TableRow key={item.staffId}>
                    <TableCell className="font-medium">{item.staffName}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{item.branchName}</TableCell>
                    <TableCell className="text-right">${item.baseSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-500">${item.allowancesTotal.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-500">(${item.deductionsTotal.toLocaleString()})</TableCell>
                    <TableCell className="text-right font-semibold">${item.netPay.toLocaleString()}</TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                            No payroll data matches your current filters for the selected period.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
           {filteredPayrollData.length > 0 && 
            <p className="text-xs text-muted-foreground mt-2 text-right">
                Displaying {filteredPayrollData.length} records.
            </p>}
        </CardContent>
        <CardFooter className="justify-end space-x-3">
          <Button variant="outline" onClick={handleExportCSV}><SheetIcon className="mr-2 h-4 w-4" /> Export as CSV</Button>
          <Button variant="outline" onClick={handleExportPDF}><FileText className="mr-2 h-4 w-4" /> Export as PDF</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
