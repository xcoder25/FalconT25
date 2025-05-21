
'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ExternalLink, Zap, RefreshCw, FolderSync, CheckCircle2, XCircle, Link as LinkIcon, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [isSlackConnected, setIsSlackConnected] = useState(true);
  const [googleDriveFolders, setGoogleDriveFolders] = useState('Recognition Snapshots, Attendance Reports');
  const [lastGoogleDriveSync, setLastGoogleDriveSync] = useState<string | null>(null);

  const [isClockInSystemConnected, setIsClockInSystemConnected] = useState(false);
  const [clockInSystemUrl, setClockInSystemUrl] = useState('');

  useEffect(() => {
    // Simulate fetching last sync time
    if (isGoogleDriveConnected && !lastGoogleDriveSync) {
        setLastGoogleDriveSync(new Date(Date.now() - 1000 * 60 * 60 * 3).toLocaleString()); // 3 hours ago
    } else if (!isGoogleDriveConnected) {
        setLastGoogleDriveSync(null);
    }
  }, [isGoogleDriveConnected, lastGoogleDriveSync]);


  const handleGoogleDriveToggle = () => {
    setIsGoogleDriveConnected(!isGoogleDriveConnected);
    if (!isGoogleDriveConnected) {
      setLastGoogleDriveSync(new Date().toLocaleString()); // Simulate first sync
    }
    toast({
      title: `Google Drive ${!isGoogleDriveConnected ? 'Connected' : 'Disconnected'}`,
      description: `Google Drive sync has been ${!isGoogleDriveConnected ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSlackToggle = () => {
    setIsSlackConnected(!isSlackConnected);
     toast({
      title: `Slack Notifications ${!isSlackConnected ? 'Enabled' : 'Disabled'}`,
      description: `Notifications to Slack have been ${!isSlackConnected ? 'activated' : 'deactivated'}.`,
    });
  };

  const handleSyncNow = () => {
    setLastGoogleDriveSync(new Date().toLocaleString());
    toast({
      title: 'Sync Initiated',
      description: 'Google Drive sync started successfully. This may take a few minutes.',
    });
  };

  const handleClockInSystemToggle = () => {
    setIsClockInSystemConnected(!isClockInSystemConnected);
    toast({
      title: `External Clock-In System ${!isClockInSystemConnected ? 'Connected' : 'Disconnected'}`,
      description: `Integration has been ${!isClockInSystemConnected ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSaveClockInSystem = () => {
    if (isClockInSystemConnected && !clockInSystemUrl) {
      toast({
        variant: 'destructive',
        title: 'URL Required',
        description: 'Please enter the URL for the external clock-in system.',
      });
      return;
    }
    toast({
      title: 'Clock-In System Settings Saved',
      description: `URL set to: ${clockInSystemUrl || 'Not configured'}. Status: ${isClockInSystemConnected ? 'Connected' : 'Disconnected'}`,
    });
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="Integrations Management"
        description="Connect Falcon T25 with other services to streamline your workflows."
      />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <svg className="h-8 w-8" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M31.9996 10L15.9996 10L10 20.0004L10.0008 38L19.5269 38.0008L25.4996 28.0004L38 28.0008L38.0008 20L31.9996 10Z" fill="#FFC107"/>
                <path d="M10 20.0004L15.9996 10H32L38.0008 20L31.9996 20.0008L25.4996 28.0004H19.5269L10 20.0004Z" fill="#4CAF50"/>
                <path d="M19.5269 38.0008L25.4996 28.0004L31.9996 28.0008L25.9992 38L19.5269 38.0008Z" fill="#2196F3"/>
                <path d="M10.0008 38L19.5269 38.0008L25.9992 38L16.5004 38.0008L10.0008 28V38Z" fill="#1E88E5"/>
              </svg>
              <CardTitle className="text-xl">Google Drive Sync</CardTitle>
            </div>
            <CardDescription>Automatically back up snapshots, reports, and other data to your Google Drive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="googleDriveSwitch" className="flex flex-col space-y-1">
                <span>{isGoogleDriveConnected ? 'Sync Enabled' : 'Sync Disabled'}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {isGoogleDriveConnected ? 'Data is being synced to Google Drive.' : 'Enable to start syncing data.'}
                </span>
              </Label>
              <Switch
                id="googleDriveSwitch"
                checked={isGoogleDriveConnected}
                onCheckedChange={handleGoogleDriveToggle}
                aria-label="Toggle Google Drive Sync"
              />
            </div>

            {isGoogleDriveConnected && (
              <>
                <div>
                  <Label htmlFor="googleDriveFolders">Folders to Sync (comma-separated)</Label>
                  <Input
                    id="googleDriveFolders"
                    value={googleDriveFolders}
                    onChange={(e) => setGoogleDriveFolders(e.target.value)}
                    placeholder="e.g., Snapshots, Reports, Archives"
                  />
                </div>
                {lastGoogleDriveSync && (
                  <p className="text-xs text-muted-foreground">
                    Last synced: {lastGoogleDriveSync}
                  </p>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
            <Button variant="outline" onClick={() => window.open('https://www.google.com/drive/', '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open Google Drive
            </Button>
            {isGoogleDriveConnected && (
              <Button onClick={handleSyncNow}>
                <RefreshCw className="mr-2 h-4 w-4" /> Sync Now
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <svg className="h-8 w-8" viewBox="0 0 122.8 122.8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.9,77.3c0,2.6-2.1,4.7-4.7,4.7H12.5c-2.6,0-4.7-2.1-4.7-4.7V53.5c0-2.6,2.1-4.7,4.7-4.7h8.7 c2.6,0,4.7,2.1,4.7,4.7V77.3z" fill="#e01e5a"></path>
                <path d="M34.5,77.8c2.6,0,4.7-2.1,4.7-4.7V29.9c0-2.6-2.1-4.7-4.7-4.7s-4.7,2.1-4.7,4.7v43.2 C29.8,75.7,31.9,77.8,34.5,77.8z" fill="#e01e5a"></path>
                <path d="M69.3,25.9c-2.6,0-4.7,2.1-4.7,4.7v8.7c0,2.6,2.1,4.7,4.7,4.7h23.8c2.6,0,4.7-2.1,4.7-4.7V29.9 c0-2.6-2.1-4.7-4.7-4.7H69.3z" fill="#36c5f0"></path>
                <path d="M68.8,34.5c0-2.6-2.1-4.7-4.7-4.7H29.9c-2.6,0-4.7,2.1-4.7,4.7s2.1,4.7,4.7,4.7h34.2 C66.7,39.2,68.8,37.1,68.8,34.5z" fill="#36c5f0"></path>
                <path d="M96.9,69.3c0,2.6,2.1,4.7,4.7,4.7h8.7c2.6,0,4.7-2.1,4.7-4.7V45.5c0-2.6-2.1-4.7-4.7-4.7h-8.7 c-2.6,0-4.7,2.1-4.7,4.7V69.3z" fill="#2eb67d"></path>
                <path d="M88.3,68.8c-2.6,0-4.7,2.1-4.7,4.7v34.2c0,2.6,2.1,4.7,4.7,4.7s4.7-2.1,4.7-4.7V73.5 C93,70.9,90.9,68.8,88.3,68.8z" fill="#2eb67d"></path>
                <path d="M53.5,96.9c2.6,0,4.7-2.1,4.7-4.7v-8.7c0-2.6-2.1-4.7-4.7-4.7H29.7c-2.6,0-4.7,2.1-4.7,4.7v8.7 c0,2.6,2.1,4.7,4.7,4.7H53.5z" fill="#ecb22e"></path>
                <path d="M54,88.3c0,2.6,2.1,4.7,4.7,4.7h34.2c2.6,0,4.7-2.1,4.7-4.7s-2.1-4.7-4.7-4.7H58.7 C56.1,83.6,54,85.7,54,88.3z" fill="#ecb22e"></path>
              </svg>
              <CardTitle className="text-xl">Slack Integration</CardTitle>
            </div>
            <CardDescription>Receive real-time notifications for recognitions and alerts directly in Slack.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <Label htmlFor="slackSwitch" className="flex flex-col space-y-1">
                <span>{isSlackConnected ? 'Notifications Enabled' : 'Notifications Disabled'}</span>
                 <span className="text-xs font-normal text-muted-foreground">
                  {isSlackConnected ? 'Falcon T25 will post updates to your selected Slack channel.' : 'Enable to connect to Slack.'}
                </span>
              </Label>
              <Switch
                id="slackSwitch"
                checked={isSlackConnected}
                onCheckedChange={handleSlackToggle}
                aria-label="Toggle Slack Integration"
              />
            </div>
             {isSlackConnected && (
              <div>
                <Label htmlFor="slackChannel">Slack Channel</Label>
                <Input id="slackChannel" defaultValue="#general-alerts" placeholder="#channel-name" />
              </div>
            )}
          </CardContent>
          <CardFooter>
             <Button variant="outline" onClick={() => window.open('https://slack.com/apps', '_blank')}>
               <ExternalLink className="mr-2 h-4 w-4" /> Configure Slack App
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
            <div className="flex items-center gap-3 mb-1">
                <Clock className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">External Clock-In System</CardTitle>
            </div>
            <CardDescription>Connect to an external web-based clock-in system to sync attendance data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="clockInSystemSwitch" className="flex flex-col space-y-1">
                    <span>{isClockInSystemConnected ? 'Integration Active' : 'Integration Inactive'}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                    {isClockInSystemConnected ? 'Attempting to sync with the configured URL.' : 'Enable to connect to your clock-in website.'}
                    </span>
                </Label>
                <Switch
                    id="clockInSystemSwitch"
                    checked={isClockInSystemConnected}
                    onCheckedChange={handleClockInSystemToggle}
                    aria-label="Toggle External Clock-In System Integration"
                />
            </div>
            {isClockInSystemConnected && (
                <div>
                    <Label htmlFor="clockInSystemUrl">Clock-In Website URL</Label>
                    <Input
                        id="clockInSystemUrl"
                        type="url"
                        value={clockInSystemUrl}
                        onChange={(e) => setClockInSystemUrl(e.target.value)}
                        placeholder="https://your-clockin-system.com"
                    />
                </div>
            )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
            <Button variant="outline" disabled={!isClockInSystemConnected || !clockInSystemUrl} onClick={() => window.open(clockInSystemUrl, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open Clock-In Site
            </Button>
            <Button onClick={handleSaveClockInSystem}>
                <LinkIcon className="mr-2 h-4 w-4" /> {isClockInSystemConnected ? 'Update Settings' : 'Save & Connect'}
            </Button>
        </CardFooter>
      </Card>


       <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap size={20}/> Other Integrations</CardTitle>
            <CardDescription>Explore more ways to connect Falcon T25.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-1">
                <LinkIcon className="h-5 w-5"/>
                <span>Connect Email (IMAP)</span>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-1">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.5833 2H4.41667C3.08042 2 2 3.08042 2 4.41667V19.5833C2 20.9196 3.08042 22 4.41667 22H19.5833C20.9196 22 22 20.9196 22 19.5833V4.41667C22 3.08042 20.9196 2 19.5833 2ZM8.08333 17.3333H5.5V9.08333H8.08333V17.3333ZM6.79167 7.9025C5.90083 7.9025 5.16667 7.16833 5.16667 6.2775C5.16667 5.38667 5.90083 4.6525 6.79167 4.6525C7.6825 4.6525 8.41667 5.38667 8.41667 6.2775C8.41667 7.16833 7.6825 7.9025 6.79167 7.9025ZM18.5 17.3333H15.9167V13.4C15.9167 12.4392 15.8925 11.1967 14.565 11.1967C13.2125 11.1967 13.0008 12.255 13.0008 13.3225V17.3333H10.4167V9.08333H12.9117V10.2358H12.955C13.315 9.56667 14.2758 8.83333 15.4433 8.83333C18.0525 8.83333 18.5 10.5658 18.5 12.875V17.3333Z"/></svg>
                <span>LinkedIn Talent Hub</span>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
            </Button>
             <Button variant="outline" className="h-20 flex-col gap-1">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                <span>Custom Webhooks</span>
                <span className="text-xs text-muted-foreground">Beta</span>
            </Button>
          </CardContent>
        </Card>
    </div>
  );
}

