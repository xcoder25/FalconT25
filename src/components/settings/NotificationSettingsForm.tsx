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
import { Loader2, Save } from 'lucide-react';

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  bossEmail: z.string().email({ message: "Invalid email address." }).or(z.literal('')),
  bossPhoneNumber: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10}$|^$/, { message: "Invalid phone number format." }).or(z.literal('')),
});

type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;

// Mock current settings - in a real app, this would come from an API
const currentSettings: NotificationSettingsValues = {
  emailNotifications: true,
  smsNotifications: false,
  bossEmail: 'boss@example.com',
  bossPhoneNumber: '+12345678900',
};

export function NotificationSettingsForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: currentSettings,
  });

  const onSubmit = async (data: NotificationSettingsValues) => {
    setIsSubmitting(true);
    console.log('Notification Settings Data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update mock current settings (or API)
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
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how you and the admin receive notifications from the system.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-md font-medium">General Notifications</h3>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="emailNotifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Receive email updates for important events.
                </span>
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
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
              <Label htmlFor="smsNotifications" className="flex flex-col space-y-1">
                <span>SMS Notifications</span>
                 <span className="font-normal leading-snug text-muted-foreground text-xs">
                  Receive SMS alerts for critical notifications (requires phone number).
                </span>
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
          </div>

          <div className="space-y-3">
            <h3 className="text-md font-medium">Admin Contact Configuration</h3>
            <div>
              <Label htmlFor="bossEmail">Admin Email Address</Label>
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

            <div>
              <Label htmlFor="bossPhoneNumber">Admin Phone Number (for SMS)</Label>
              <Controller
                name="bossPhoneNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    id="bossPhoneNumber"
                    type="tel"
                    placeholder="+1 555 123 4567"
                    {...field}
                    disabled={isSubmitting}
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
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
