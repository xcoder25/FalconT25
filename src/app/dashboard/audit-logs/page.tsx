
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { DateRange } from 'react-day-picker';
import { ArrowDownUp, FilterX, FileText, FileDown, ClipboardList } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { AuditLogEntry } from '@/lib/types';
import { mockAuditLogEntries } from '@/lib/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ClientSideFormattedTimestamp = ({ isoTimestamp }: { isoTimestamp: string }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    setFormattedDate(new Date(isoTimestamp).toLocaleString());
  }, [isoTimestamp]);

  if (formattedDate === null) {
    return <span className="text-sm text-muted-foreground">Loading date...</span>;
  }
  return <>{formattedDate}</>;
};

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [auditData, setAuditData] = useState<AuditLogEntry[]>(mockAuditLogEntries);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortColumn, setSortColumn] = useState<'userName' | 'timestamp' | 'action' | 'details' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedLogs = useMemo(() => {
    let filtered = auditData;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(lowerSearchTerm) ||
        log.action.toLowerCase().includes(lowerSearchTerm) ||
        log.details.toLowerCase().includes(lowerSearchTerm) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(lowerSearchTerm)) ||
        (log.targetId && log.targetId.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (dateRange?.from) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        let fromMatch = true;
        let toMatch = true;
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          fromMatch = logDate >= fromDate;
        }
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          toMatch = logDate <= toDate;
        }
        return fromMatch && toMatch;
      });
    }
    
    if (sortColumn) {
      filtered.sort((a, b) => {
        let valA, valB;
        if (sortColumn === 'timestamp') {
          valA = new Date(a.timestamp).getTime();
          valB = new Date(b.timestamp).getTime();
        } else {
          valA = String(a[sortColumn as keyof Omit<AuditLogEntry, 'timestamp'>] || '');
          valB = String(b[sortColumn as keyof Omit<AuditLogEntry, 'timestamp'>] || '');
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }

    return filtered;
  }, [auditData, searchTerm, dateRange, sortColumn, sortDirection]);

  const handleSort = (column: 'userName' | 'timestamp' | 'action' | 'details') => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setDateRange(undefined);
    setSortColumn(null);
  };

  const handleExportCSV = () => {
    toast({
      title: "Export CSV Clicked",
      description: "CSV export functionality for audit logs would be triggered here.",
    });
  };

  const handleExportPDF = () => {
     toast({
      title: "Export PDF Clicked",
      description: "PDF export functionality for audit logs would be triggered here.",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Audit Logs"
        description="Track system events, user actions, and security-related activities."
      >
        <ClipboardList className="h-8 w-8 text-primary" />
      </PageHeader>

      <div className="p-4 border rounded-lg shadow-sm bg-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <Input
            placeholder="Search logs (user, action, details...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm lg:col-span-2"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={`w-full justify-start text-left font-normal text-sm ${!dateRange && "text-muted-foreground"}`}
              >
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
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
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={clearFilters} className="text-sm w-full sm:w-auto">
              <FilterX className="mr-2 h-4 w-4" /> Clear Filters
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="text-sm w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="text-sm w-full sm:w-auto">
              <FileDown className="mr-2 h-4 w-4" /> Export PDF
            </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('timestamp')}>
                <div className="flex items-center gap-1">
                  Timestamp {sortColumn === 'timestamp' && <ArrowDownUp size={14} />}
                </div>
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('action')}>
                <div className="flex items-center gap-1">
                  Action {sortColumn === 'action' && <ArrowDownUp size={14} />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('details')}>
                 <div className="flex items-center gap-1">
                  Details {sortColumn === 'details' && <ArrowDownUp size={14} />}
                </div>
              </TableHead>
              <TableHead>Target ID</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLogs.length > 0 ? (
              filteredAndSortedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <ClientSideFormattedTimestamp isoTimestamp={log.timestamp} />
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                     <Avatar className="h-8 w-8">
                        {/* In a real app, you'd fetch user's avatarUrl based on log.userId */}
                        <AvatarImage src={`https://placehold.co/80x80.png?text=${log.userName.substring(0,2).toUpperCase()}`} alt={log.userName} data-ai-hint="person initial" />
                        <AvatarFallback>{log.userName.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{log.userName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={log.details}>{log.details}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.targetId || 'N/A'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.ipAddress || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No audit logs found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {filteredAndSortedLogs.length > 10 && (
        <p className="text-xs text-muted-foreground text-center">Displaying {filteredAndSortedLogs.length} records.</p>
      )}
    </div>
  );
}
