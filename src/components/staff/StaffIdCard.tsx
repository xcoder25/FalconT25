
'use client';

import React from 'react';
import type { StaffMember } from '@/lib/types';
import { AppLogo } from '@/components/shared/AppLogo';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface StaffIdCardProps {
  staff: StaffMember;
}

export function StaffIdCard({ staff }: StaffIdCardProps) {
  return (
    <Card className="w-[320px] max-w-sm shadow-2xl rounded-xl overflow-hidden bg-card border-primary/50 transform scale-105">
      <div className="bg-primary text-primary-foreground p-3 text-center">
        <AppLogo iconSize={24} textSize="text-lg" className="justify-center" />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="text-center mb-3">
           <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Staff Identification</p>
        </div>
        
        <div className="flex flex-col items-center space-y-3">
          <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-primary/70 shadow-lg">
            <Image
              src={staff.imageUrl || 'https://placehold.co/150x150.png?text=N/A'}
              alt={`${staff.name}'s photo`}
              width={128}
              height={128}
              className="object-cover w-full h-full"
              data-ai-hint="person photo"
            />
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">{staff.name}</h2>
            <p className="text-sm text-primary font-medium">{staff.department || 'General Department'}</p>
          </div>
        </div>

        <Separator className="my-3 bg-border/50" />
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Staff ID:</span>
            <span className="text-foreground font-mono">{staff.id.substring(0,12)}</span> 
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Email:</span>
            <span className="text-foreground truncate">{staff.email}</span>
          </div>
           <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Status:</span>
            <span className={`font-semibold ${staff.status === 'active' || staff.status === 'recognized' ? 'text-green-400' : 'text-yellow-400'}`}>
                {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">
                This card is the property of Falcon T25.
            </p>
            <p className="text-xs text-muted-foreground">
                If found, please return to an authorized representative.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
