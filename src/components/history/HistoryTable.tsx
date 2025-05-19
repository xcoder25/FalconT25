'use client';

import React, { useState, useMemo } from 'react';
import type { SignInSignOutRecord, StaffMember } from '@/lib/types';
import { mockSignInSignOutHistory, mockStaffMembers } from '@/lib/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/shared/DatePickerWithRange'; // Assuming this exists or will be created
import type { DateRange } from 'react-day-picker';
import { ArrowDownUp, FilterX } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';


export function HistoryTable() {
  const [historyData, setHistoryData] = useState<SignInSignOutRecord[]>(mockSignInSignOutHistory);
  const [staffNameFilter, setStaffNameFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [cameraFilter, setCameraFilter] = useState('');
  const [sortColumn, setSortColumn] = useState<'staffName' | 'timestamp' | 'camera' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const uniqueCameras = useMemo(() => {
    const cameras = new Set(mockSignInSignOutHistory.map(record => record.camera));
    return Array.from(cameras);
  }, []);

  const filteredAndSortedHistory = useMemo(() => {
    let filtered = historyData;

    if (staffNameFilter) {
      filtered = filtered.filter(record =>
        record.staffName.toLowerCase().includes(staffNameFilter.toLowerCase())
      );
    }

    if (dateRange?.from) {
        filtered = filtered.filter(record => {
            const recordDate = new Date(record.timestamp);
            let fromMatch = true;
            let toMatch = true;
            if (dateRange.from) {
                fromMatch = recordDate >= dateRange.from;
            }
            if (dateRange.to) {
                // Set time to end of day for 'to' date for inclusive range
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
          valA = a[sortColumn];
          valB = b[sortColumn];
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }


    return filtered;
  }, [historyData, staffNameFilter, dateRange, cameraFilter, sortColumn, sortDirection]);

  const handleSort = (column: 'staffName' | 'timestamp' | 'camera') => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const clearFilters = () => {
    setStaffNameFilter('');
    setDateRange(undefined);
    setCameraFilter('');
    setSortColumn(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-lg shadow-sm bg-card">
        <Input
          placeholder="Filter by Staff Name..."
          value={staffNameFilter}
          onChange={(e) => setStaffNameFilter(e.target.value)}
          className="text-sm"
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
        <Select value={cameraFilter} onValueChange={setCameraFilter}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Filter by Camera" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Cameras</SelectItem>
            {uniqueCameras.map(camera => (
              <SelectItem key={camera} value={camera} className="text-sm">{camera}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={clearFilters} className="text-sm">
          <FilterX className="mr-2 h-4 w-4" /> Clear Filters
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableHead>Type</TableHead>
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
                <TableRow key={record.id}>
                  <TableCell>{record.staffName}</TableCell>
                  <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      record.type === 'signin' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {record.type === 'signin' ? 'Sign In' : 'Sign Out'}
                    </span>
                  </TableCell>
                  <TableCell>{record.camera}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
