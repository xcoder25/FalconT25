
'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Smartphone, Monitor, Send as SendIcon, MessageCircle } from 'lucide-react'; // Added new icons

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  bossEmail: z.string().email({ message: "Invalid email address." }).or(z.literal('')),
  bossPhoneNumber: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10}$|^$/, { message: "Invalid phone number format." }).or(z.literal('')),
  desktopNotifications: z.boolean(),
  mobilePushNotifications: z.boolean(),
  telegramNotifications: z.boolean(),
  telegramUsername: z.string().optional(),
  whatsAppNotifications: z.boolean(),
  whatsAppNumber: z.string().optional(), // Simple string for now
});

type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;

// Mock current settings - in a real app, this would come from an API
const currentSettings: NotificationSettingsValues = {
  emailNotifications: true,
  smsNotifications: false,
  bossEmail: 'boss@example.com',
  bossPhoneNumber: '+12345678900',
  desktopNotifications: true,
  mobilePushNotifications: true,
  telegramNotifications: false,
  telegramUsername: '',
  whatsAppNotifications: false,
  whatsAppNumber: '',
};

export function NotificationSettingsForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: currentSettings,
  });

  const telegramEnabled = watch('telegramNotifications');
  const whatsAppEnabled = watch('whatsAppNotifications');

  const onSubmit = async (data: NotificationSettingsValues) => {
    setIsSubmitting(true);
    console.log('Notification Settings Data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    Object.assign(currentSettings, data);

    toast({
      title: 'Settings Saved!',
      description: 'Your notification preferences have been updated.',
    });
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications from Falcon T25.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-8">
          
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-foreground/90">My Notification Channels</h3>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="desktopNotifications" className="flex items-center gap-3 cursor-pointer">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                    <span>Desktop Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                    Browser notifications on your computer.
                    </span>
                </div>
              </Label>
              <Controller
                name="desktopNotifications"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="desktopNotifications"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="mobilePushNotifications" className="flex items-center gap-3 cursor-pointer">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                    <span>Mobile Push Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                    Alerts via the Falcon T25 mobile app (if installed).
                    </span>
                </div>
              </Label>
              <Controller
                name="mobilePushNotifications"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="mobilePushNotifications"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
             <div className="p-3 border rounded-md space-y-2">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="telegramNotifications" className="flex items-center gap-3 cursor-pointer">
                        <SendIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col">
                            <span>Telegram Notifications</span>
                            <span className="font-normal leading-snug text-muted-foreground text-xs">
                            Receive alerts via Telegram bot.
                            </span>
                        </div>
                    </Label>
                    <Controller
                        name="telegramNotifications"
                        control={control}
                        render={({ field }) => (
                        <Switch
                            id="telegramNotifications"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                        />
                        )}
                    />
                </div>
                {telegramEnabled && (
                    <div className="pl-8 pt-1">
                        <Label htmlFor="telegramUsername" className="text-xs">Telegram Username/ID</Label>
                        <Controller
                            name="telegramUsername"
                            control={control}
                            render={({ field }) => (
                            <Input
                                id="telegramUsername"
                                placeholder="@your_username or User ID"
                                {...field}
                                disabled={isSubmitting}
                                className="text-sm h-9 mt-0.5"
                            />
                            )}
                        />
                         {errors.telegramUsername && <p className="text-sm text-destructive mt-1">{errors.telegramUsername.message}</p>}
                    </div>
                )}
             </div>
             <div className="p-3 border rounded-md space-y-2">
                <div className="flex items-center justify-between space-x-2">
                     <Label htmlFor="whatsAppNotifications" className="flex items-center gap-3 cursor-pointer">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" /> {/* Using MessageCircle as a generic messaging icon */}
                         <div className="flex flex-col">
                            <span>WhatsApp Notifications</span>
                            <span className="font-normal leading-snug text-muted-foreground text-xs">
                            Receive alerts on WhatsApp (requires setup).
                            </span>
                        </div>
                    </Label>
                    <Controller
                        name="whatsAppNotifications"
                        control={control}
                        render={({ field }) => (
                        <Switch
                            id="whatsAppNotifications"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                        />
                        )}
                    />
                </div>
                {whatsAppEnabled && (
                    <div className="pl-8 pt-1">
                        <Label htmlFor="whatsAppNumber" className="text-xs">WhatsApp Number</Label>
                        <Controller
                            name="whatsAppNumber"
                            control={control}
                            render={({ field }) => (
                            <Input
                                id="whatsAppNumber"
                                type="tel"
                                placeholder="e.g., +12345678900"
                                {...field}
                                disabled={isSubmitting}
                                className="text-sm h-9 mt-0.5"
                            />
                            )}
                        />
                        {errors.whatsAppNumber && <p className="text-sm text-destructive mt-1">{errors.whatsAppNumber.message}</p>}
                    </div>
                )}
            </div>
          </div>


          <div className="space-y-3">
            <h3 className="text-md font-semibold text-foreground/90">System Event Notifications</h3>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="emailNotifications" className="flex items-center gap-3 cursor-pointer">
                 <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <div className="flex flex-col">
                    <span>General Email Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                    Receive email updates for recognitions, system alerts, etc.
                    </span>
                </div>
              </Label>
              <Controller
                name="emailNotifications"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="emailNotifications"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-md font-semibold text-foreground/90">Admin Alert Configuration</h3>
             <p className="text-xs text-muted-foreground">
                Configure contact details for critical system alerts, such as unrecognized person detection or major system failures.
            </p>
            <div>
              <Label htmlFor="bossEmail">Admin Email Address for Critical Alerts</Label>
              <Controller
                name="bossEmail"
                control={control}
                render={({ field }) => (
                  <Input
                    id="bossEmail"
                    type="email"
                    placeholder="admin_email@example.com"
                    {...field}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.bossEmail && <p className="text-sm text-destructive mt-1">{errors.bossEmail.message}</p>}
            </div>

            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="smsNotifications" className="flex items-center gap-3 cursor-pointer">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                 <div className="flex flex-col">
                    <span>Critical SMS Notifications to Admin</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                    Send SMS for urgent alerts to the admin phone number below.
                    </span>
                </div>
              </Label>
               <Controller
                name="smsNotifications"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="smsNotifications"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="bossPhoneNumber">Admin Phone Number for Critical SMS</Label>
              <Controller
                name="bossPhoneNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    id="bossPhoneNumber"
                    type="tel"
                    placeholder="+1 555 123 4567"
                    {...field}
                    disabled={isSubmitting || !watch('smsNotifications')}
                  />
                )}
              />
              {errors.bossPhoneNumber && <p className="text-sm text-destructive mt-1">{errors.bossPhoneNumber.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" /> Save Preferences
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
