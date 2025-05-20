
'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { HardDrive, FileText, Image as ImageIcon, FolderArchive, ShieldCheck, Settings } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

const storageData = [
  { name: 'Images', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Documents', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Videos', value: 200, fill: 'hsl(var(--chart-3))' },
  { name: 'Other', value: 100, fill: 'hsl(var(--chart-4))' },
];
const totalStorage = 2000; // GB
const usedStorage = storageData.reduce((acc, item) => acc + item.value, 0);

const chartConfig = {
  images: { label: "Images", color: "hsl(var(--chart-1))" },
  documents: { label: "Documents", color: "hsl(var(--chart-2))" },
  videos: { label: "Videos", color: "hsl(var(--chart-3))" },
  other: { label: "Other", color: "hsl(var(--chart-4))" },
};


export default function CloudStoragePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Cloud Storage Management"
        description="Oversee your organization's cloud storage, manage files, and configure settings."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HardDrive size={20} /> Storage Overview</CardTitle>
          <CardDescription>Current storage utilization and capacity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span>{usedStorage} GB Used</span>
            <span>{totalStorage} GB Total</span>
          </div>
          <Progress value={(usedStorage / totalStorage) * 100} className="w-full h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {(totalStorage - usedStorage)} GB Free
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChart size={20} /> File Type Distribution</CardTitle>
            <CardDescription>Breakdown of storage by file categories.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pl-2">
             <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                        <Pie data={storageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {storageData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                        </Pie>
                        <Legend wrapperStyle={{fontSize: '0.8rem'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings size={20} /> Storage Settings</CardTitle>
            <CardDescription>Manage storage configurations and policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <FolderArchive className="mr-2 h-4 w-4" /> Manage Storage Buckets
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ShieldCheck className="mr-2 h-4 w-4" /> Data Retention Policies
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ImageIcon className="mr-2 h-4 w-4" /> Image & Video Optimization
            </Button>
             <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" /> Document Versioning Rules
            </Button>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="secondary" className="flex-col h-24">
                <ImageIcon className="mb-1 h-6 w-6"/>
                <span>Browse Images</span>
            </Button>
            <Button variant="secondary" className="flex-col h-24">
                <FileText className="mb-1 h-6 w-6"/>
                <span>Browse Documents</span>
            </Button>
            <Button variant="secondary" className="flex-col h-24">
                <FolderArchive className="mb-1 h-6 w-6"/>
                <span>Access Archives</span>
            </Button>
             <Button variant="destructive" className="flex-col h-24">
                <ShieldCheck className="mb-1 h-6 w-6"/>
                <span>Security Logs</span>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
