'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { StaffMember, AppNotification, Camera } from '@/lib/types';
import { AlertCircle, CheckCircle2, Bell, Video, Users, MessageSquare, Award, Shield, Check, Info, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRealtimeCameras, useRealtimeStaff, useRealtimeNotifications } from '@/hooks/useRealtime';

export default function DashboardPage() {
  const { cameras, isLoading: loadingCameras } = useRealtimeCameras();
  const { staff, isLoading: loadingStaff } = useRealtimeStaff();
  const { notifications, isLoading: loadingNotifications } = useRealtimeNotifications();

  const recognizedStaff = staff.filter(s => s.status === 'recognized' || s.status === 'active');
  const unknownStaff = staff.filter(s => s.status === 'unknown');

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of recognition activities and system status." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Video size={20} /> Live Camera Feeds</CardTitle>
            <CardDescription>Monitoring key areas in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCameras ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
              <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex gap-4 pb-4">
                  {cameras.slice(0, 4).map((camera: Camera) => (
                    <div key={camera.id} className="shrink-0 relative group">
                      <Image
                        src={`https://placehold.co/300x200.png?text=${encodeURIComponent(camera.name)}`}
                        alt={camera.name}
                        width={300}
                        height={200}
                        className="rounded-md object-cover aspect-video shadow-md border border-border"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <span className={`h-2.5 w-2.5 rounded-full ${camera.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      </div>
                      <p className="mt-2 text-xs text-center font-medium">{camera.name}</p>
                    </div>
                  ))}
                   {cameras.length === 0 && <p className="text-sm text-muted-foreground">No cameras configured.</p>}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users size={20} /> Recent Staff Activity</CardTitle>
            <CardDescription>Recently recognized staff members.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStaff ? (
               <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
              <ScrollArea className="h-[240px]">
                <div className="space-y-3">
                  {recognizedStaff.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold mb-2 text-green-500 uppercase tracking-wider">Recognized ({recognizedStaff.length})</h4>
                      <div className="space-y-1">
                        {recognizedStaff.slice(0, 10).map((s: StaffMember) => (
                          <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={s.imageUrl} alt={s.name} />
                              <AvatarFallback>{s.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{s.name}</span>
                            <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {unknownStaff.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold mb-2 text-red-500 uppercase tracking-wider">Unknown ({unknownStaff.length})</h4>
                      <div className="space-y-1">
                        {unknownStaff.map((s: StaffMember) => (
                          <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={s.imageUrl} alt={s.name} />
                              <AvatarFallback>{s.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{s.name}</span>
                            <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                   {(recognizedStaff.length === 0 && unknownStaff.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No staff status to display.</p>}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell size={20} /> Real-time Notifications</CardTitle>
          <CardDescription>Latest updates and alerts from the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingNotifications ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
          ) : notifications.length > 0 ? (
            <ScrollArea className="h-[200px] pr-4">
              <ul className="space-y-3">
                {notifications.slice(0, 10).map((notification: AppNotification) => (
                  <li key={notification.id} className={`flex items-start gap-3 p-3 rounded-xl border ${notification.read ? 'bg-muted/30 border-transparent' : 'bg-card border-border shadow-sm'}`}>
                    <div className="shrink-0 mt-0.5">
                      {notification.type === 'recognition' && <Award className="h-5 w-5 text-purple-500" />}
                      {notification.type === 'warning' && <Shield className="h-5 w-5 text-red-500" />}
                      {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
                      {notification.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                      {notification.type === 'success' && <Check className="h-5 w-5 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate">{notification.title}</p>
                        {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
             <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 opacity-20 mb-2" />
                <p className="text-sm">No new notifications.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
