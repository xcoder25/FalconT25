
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { HistoryTable } from '@/components/history/HistoryTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRealtimeAttendance } from '@/hooks/useRealtime';
import type { SignInSignOutRecord } from '@/lib/types';
import { BarChartBig, TrendingUp, Users, Clock } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format, subDays, startOfDay, isSameDay, parseISO } from 'date-fns';


const chartConfig = {
  signIns: {
    label: "Sign-Ins",
    color: "hsl(var(--chart-1))",
  },
};

interface DailySignIns {
  date: string;
  signIns: number;
}

export default function AttendanceLogsPage() { // Renamed from HistoryPage
  const [clientCurrentDate, setClientCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setClientCurrentDate(new Date());
  }, []);

  const { records } = useRealtimeAttendance(500);

  const attendanceSummary = useMemo(() => {
    if (!clientCurrentDate) {
        return {
            signInsToday: 0,
            signOutsToday: 0,
            uniqueStaffToday: 0,
        };
    }
    const today = startOfDay(clientCurrentDate);
    let signInsToday = 0;
    let signOutsToday = 0;
    const staffPresentToday = new Set<string>();

    records.forEach(record => {
      const recordDate = startOfDay(parseISO(record.timestamp));
      if (isSameDay(recordDate, today)) {
        if (record.type === 'signin') {
          signInsToday++;
          staffPresentToday.add(record.staffMemberId);
        } else {
          signOutsToday++;
        }
      }
    });
    return { signInsToday, signOutsToday, uniqueStaffToday: staffPresentToday.size };
  }, [clientCurrentDate, records]);

  const dailySignInsData: DailySignIns[] = useMemo(() => {
    if (!clientCurrentDate) return [];
    const data: DailySignIns[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(clientCurrentDate, i);
      const signInsOnDate = records.filter(record => 
        record.type === 'signin' && isSameDay(parseISO(record.timestamp), date)
      ).length;
      data.push({ date: format(date, 'MMM d'), signIns: signInsOnDate });
    }
    return data;
  }, [clientCurrentDate, records]);


  return (
    <div className="space-y-8">
      <PageHeader 
        title="Attendance Logs" // Updated title
        description="Monitor staff attendance, analyze trends, and export records." // Updated description
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sign-Ins Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCurrentDate ? attendanceSummary.signInsToday : '...'}</div>
            <p className="text-xs text-muted-foreground">Total sign-ins recorded for today.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sign-Outs Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCurrentDate ? attendanceSummary.signOutsToday : '...'}</div>
            <p className="text-xs text-muted-foreground">Total sign-outs recorded for today.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Staff Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCurrentDate ? attendanceSummary.uniqueStaffToday : '...'}</div>
            <p className="text-xs text-muted-foreground">Distinct staff members present today.</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChartBig size={20} /> Daily Sign-In Trends (Last 7 Days)</CardTitle>
          <CardDescription>Overview of daily sign-in activity.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {clientCurrentDate ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySignInsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
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
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="signIns" fill="var(--color-signIns)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>
          )}
        </CardContent>
      </Card>

      <HistoryTable />
    </div>
  );
}
