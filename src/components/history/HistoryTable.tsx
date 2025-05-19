
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { SignInSignOutRecord } from '@/lib/types';
import { mockSignInSignOutHistory } from '@/lib/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { DateRange } from 'react-day-picker';
import { ArrowDownUp, FilterX, FileText, FileDown, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ALL_CAMERAS_VALUE = "__ALL_CAMERAS__";

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


export function HistoryTable() {
  const { toast } = useToast();
  const [historyData, setHistoryData] = useState<SignInSignOutRecord[]>(mockSignInSignOutHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [cameraFilter, setCameraFilter] = useState('');
  const [sortColumn, setSortColumn] = useState<'staffName' | 'timestamp' | 'camera' | 'type' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const uniqueCameras = useMemo(() => {
    const cameras = new Set(mockSignInSignOutHistory.map(record => record.camera));
    return Array.from(cameras);
  }, []);

  const filteredAndSortedHistory = useMemo(() => {
    let filtered = historyData;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.staffName.toLowerCase().includes(lowerSearchTerm) ||
        record.camera.toLowerCase().includes(lowerSearchTerm) ||
        record.type.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (dateRange?.from) {
        filtered = filtered.filter(record => {
            const recordDate = new Date(record.timestamp);
            let fromMatch = true;
            let toMatch = true;
            if (dateRange.from) {
                const fromDate = new Date(dateRange.from);
                fromDate.setHours(0, 0, 0, 0);
                fromMatch = recordDate >= fromDate;
            }
            if (dateRange.to) {
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                toMatch = recordDate <= toDate;
            }
            return fromMatch && toMatch;
        });
    }

    if (cameraFilter) {
      filtered = filtered.filter(record => record.camera === cameraFilter);
    }
    
    if (sortColumn) {
      filtered.sort((a, b) => {
        let valA, valB;
        if (sortColumn === 'timestamp') {
          valA = new Date(a.timestamp).getTime();
          valB = new Date(b.timestamp).getTime();
        } else {
          valA = String(a[sortColumn as keyof Omit<SignInSignOutRecord, 'timestamp'>]);
          valB = String(b[sortColumn as keyof Omit<SignInSignOutRecord, 'timestamp'>]);
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }

    return filtered;
  }, [historyData, searchTerm, dateRange, cameraFilter, sortColumn, sortDirection]);

  const handleSort = (column: 'staffName' | 'timestamp' | 'camera' | 'type') => {
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
    setCameraFilter('');
    setSortColumn(null);
  };

  const handleExportCSV = () => {
    toast({
      title: "Export CSV Clicked",
      description: "CSV export functionality would be triggered here.",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Export PDF Clicked",
      description: "PDF export functionality would be triggered here.",
    });
  };


  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg shadow-sm bg-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search logs..."
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
          <Select 
            value={cameraFilter === '' ? ALL_CAMERAS_VALUE : cameraFilter} 
            onValueChange={(selectedValue) => {
              setCameraFilter(selectedValue === ALL_CAMERAS_VALUE ? '' : selectedValue);
            }}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Filter by Camera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CAMERAS_VALUE}>All Cameras</SelectItem>
              {uniqueCameras.map(camera => (
                <SelectItem key={camera} value={camera} className="text-sm">{camera}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Snapshot</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('staffName')}>
                <div className="flex items-center gap-1">
                  Staff Name {sortColumn === 'staffName' && <ArrowDownUp size={14} />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('timestamp')}>
                <div className="flex items-center gap-1">
                  Timestamp {sortColumn === 'timestamp' && <ArrowDownUp size={14} />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('type')}>
                <div className="flex items-center gap-1">
                  Type {sortColumn === 'type' && <ArrowDownUp size={14} />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('camera')}>
                <div className="flex items-center gap-1">
                  Camera {sortColumn === 'camera' && <ArrowDownUp size={14} />}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedHistory.length > 0 ? (
              filteredAndSortedHistory.map((record) => (
                <TableRow key={record.id} className={record.staffName === 'Unrecognized Person' ? 'bg-destructive/10 hover:bg-destructive/20' : ''}>
                  <TableCell>
                    {record.snapshotImageUrl ? (
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={record.snapshotImageUrl} alt={record.staffName} data-ai-hint="person face" className="object-cover" />
                        <AvatarFallback className="rounded-md">
                          {record.staffName === 'Unrecognized Person' ? <AlertTriangle size={16}/> : record.staffName.substring(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                    )}
                  </TableCell>
                  <TableCell className={record.staffName === 'Unrecognized Person' ? 'font-semibold text-destructive' : ''}>
                    {record.staffName}
                     {record.staffName === 'Unrecognized Person' && <AlertTriangle className="inline h-4 w-4 ml-1 text-destructive" />}
                  </TableCell>
                  <TableCell>
                    <ClientSideFormattedTimestamp isoTimestamp={record.timestamp} />
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      record.type === 'signin' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      record.type === 'signout' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' // For 'sighting'
                    }`}>
                      {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{record.camera}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No records found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       {filteredAndSortedHistory.length > 10 && (
        <p className="text-xs text-muted-foreground text-center">Displaying {filteredAndSortedHistory.length} records.</p>
      )}
    </div>
  );
}
