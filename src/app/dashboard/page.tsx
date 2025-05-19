import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockStaffMembers, mockNotifications, mockCameras } from '@/lib/mockData';
import type { StaffMember, AppNotification, Camera } from '@/lib/types';
import { AlertCircle, CheckCircle2, Bell, Video, Users, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const recognizedStaff = mockStaffMembers.filter(s => s.status === 'recognized');
  const unknownStaff = mockStaffMembers.filter(s => s.status === 'unknown');

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
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
              <div className="flex gap-4 pb-4">
                {mockCameras.slice(0, 4).map((camera: Camera) => (
                  <div key={camera.id} className="shrink-0">
                    <Image
                      src={`https://placehold.co/300x200.png?text=${encodeURIComponent(camera.name)}`}
                      alt={camera.name}
                      width={300}
                      height={200}
                      className="rounded-md object-cover aspect-video shadow-md"
                      data-ai-hint="security camera"
                    />
                    <p className="mt-1 text-xs text-center text-muted-foreground">{camera.name} ({camera.status})</p>
                  </div>
                ))}
                 {mockCameras.length === 0 && <p className="text-sm text-muted-foreground">No cameras configured.</p>}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users size={20} /> Staff Status</CardTitle>
            <CardDescription>Recognized and unknown staff members.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              <div className="space-y-3">
                {recognizedStaff.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-green-600">Recognized ({recognizedStaff.length})</h4>
                    {recognizedStaff.map((staff: StaffMember) => (
                      <div key={staff.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-secondary">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={staff.imageUrl} alt={staff.name} data-ai-hint="person photo" />
                          <AvatarFallback>{staff.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{staff.name}</span>
                        <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                )}
                {unknownStaff.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mt-3 mb-1 text-red-600">Unknown ({unknownStaff.length})</h4>
                    {unknownStaff.map((staff: StaffMember) => (
                      <div key={staff.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-secondary">
                         <Avatar className="h-8 w-8">
                          <AvatarImage src={staff.imageUrl} alt={staff.name} data-ai-hint="person photo" />
                          <AvatarFallback>{staff.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{staff.name}</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </div>
                    ))}
                  </div>
                )}
                 {(recognizedStaff.length === 0 && unknownStaff.length === 0) && <p className="text-sm text-muted-foreground">No staff status to display.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell size={20} /> Real-time Notifications</CardTitle>
          <CardDescription>Latest updates and alerts from the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockNotifications.length > 0 ? (
            <ScrollArea className="h-[200px]">
            <ul className="space-y-3">
              {mockNotifications.map((notification: AppNotification) => (
                <li key={notification.id} className={`flex items-start gap-3 p-3 rounded-md ${notification.read ? 'bg-muted/50' : 'bg-secondary'}`}>
                  <div>
                    {notification.type === 'recognition' && <Award className="h-5 w-5 text-primary mt-0.5" />}
                    {notification.type === 'warning' && <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />}
                    {notification.type === 'info' && <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{new Date(notification.timestamp).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
          ) : (
             <p className="text-sm text-muted-foreground">No new notifications.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
