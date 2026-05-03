
'use client';

import React from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Camera } from '@/lib/types';
import { LayoutGrid, VideoOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealtimeCameras } from '@/hooks/useRealtime';

export default function MultiCameraFeedPage() {
  const { cameras, isLoading } = useRealtimeCameras();
  const onlineCameras = cameras.filter(cam => cam.status === 'online');
  const offlineCameras = cameras.filter(cam => cam.status !== 'online');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-Camera Live Feeds"
        description="Monitor multiple camera streams simultaneously."
      >
        <LayoutGrid className="h-8 w-8 text-primary" />
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : cameras.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VideoOff size={24} /> No Cameras Configured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              There are no cameras set up in the system. Please add cameras in the settings to see their feeds here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {onlineCameras.map((camera: Camera) => (
            <Card key={camera.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="p-3 bg-card border-b">
                <CardTitle className="text-base truncate flex items-center justify-between">
                  {camera.name}
                  <Badge variant={camera.status === 'online' ? 'default' : 'destructive'} className="capitalize text-xs">
                    {camera.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Image
                    src={`https://placehold.co/600x400.png?text=${encodeURIComponent(camera.name)}`}
                    alt={`Live feed from ${camera.name}`}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint="security camera"
                    priority // Prioritize loading images for online cameras
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {offlineCameras.map((camera: Camera) => (
             <Card key={camera.id} className="overflow-hidden shadow-md opacity-70">
             <CardHeader className="p-3 bg-card border-b">
               <CardTitle className="text-base truncate flex items-center justify-between">
                 {camera.name}
                 <Badge variant="destructive" className="capitalize text-xs">
                   {camera.status}
                 </Badge>
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="aspect-video bg-muted/50 flex flex-col items-center justify-center text-muted-foreground">
                 <VideoOff size={48} className="mb-2"/>
                 <p className="text-sm">Feed Unavailable</p>
               </div>
             </CardContent>
           </Card>
          ))}
        </div>
      )}
    </div>
  );
}
