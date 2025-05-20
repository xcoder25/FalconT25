
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mic, Save, Loader2, Lock } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const voicePhraseSchema = z.object({
  currentPhrase: z.string().optional(), // In a real scenario, this would be validated
  newPhrase: z.string().min(5, 'New phrase must be at least 5 words/syllables long for distinctiveness.').regex(/^[a-zA-Z\s]+$/, 'Phrase should only contain letters and spaces.'),
  confirmNewPhrase: z.string(),
}).refine(data => data.newPhrase === data.confirmNewPhrase, {
  message: "New phrases don't match.",
  path: ["confirmNewPhrase"],
});

type VoicePhraseFormValues = z.infer<typeof voicePhraseSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match.",
  path: ["confirmNewPassword"],
});
type PasswordFormValues = z.infer<typeof passwordSchema>;


export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [isSavingPhrase, setIsSavingPhrase] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const voiceForm = useForm<VoicePhraseFormValues>({
    resolver: zodResolver(voicePhraseSchema),
    defaultValues: { currentPhrase: '', newPhrase: '', confirmNewPhrase: '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const handleSaveVoicePhrase = async (data: VoicePhraseFormValues) => {
    setIsSavingPhrase(true);
    // Simulate API call to save/update voice phrase
    console.log('Saving new voice phrase (mock):', data.newPhrase);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: 'Voice Phrase Updated (Mock)',
      description: 'Your new voice login phrase has been set.',
    });
    voiceForm.reset();
    setIsSavingPhrase(false);
  };

  const handleSavePassword = async (data: PasswordFormValues) => {
    setIsSavingPassword(true);
    // Simulate API call to change password
    console.log('Changing password (mock):', data.newPassword);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: 'Password Updated (Mock)',
      description: 'Your password has been successfully changed.',
    });
    passwordForm.reset();
    setIsSavingPassword(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Security Settings"
        description="Manage your account password, voice authentication, and other security features."
      >
        <Shield className="h-8 w-8 text-primary" />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mic size={20} /> Voice Login Phrase</CardTitle>
          <CardDescription>
            Set or update your voice phrase for voice authentication. Choose a phrase that is unique and easy for you to remember and say clearly.
          </CardDescription>
        </CardHeader>
        <form onSubmit={voiceForm.handleSubmit(handleSaveVoicePhrase)}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="currentPhrase">Current Voice Phrase (Optional)</Label>
              <Controller
                name="currentPhrase"
                control={voiceForm.control}
                render={({ field }) => (
                  <Input id="currentPhrase" type="text" placeholder="If changing, enter current phrase" {...field} disabled={isSavingPhrase} />
                )}
              />
               {voiceForm.formState.errors.currentPhrase && <p className="text-sm text-destructive">{voiceForm.formState.errors.currentPhrase.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPhrase">New Voice Phrase</Label>
               <Controller
                name="newPhrase"
                control={voiceForm.control}
                render={({ field }) => (
                  <Input id="newPhrase" type="text" placeholder="e.g., Falcon T25 engage" {...field} disabled={isSavingPhrase} />
                )}
              />
              {voiceForm.formState.errors.newPhrase && <p className="text-sm text-destructive">{voiceForm.formState.errors.newPhrase.message}</p>}
            </div>
             <div className="space-y-1">
              <Label htmlFor="confirmNewPhrase">Confirm New Voice Phrase</Label>
               <Controller
                name="confirmNewPhrase"
                control={voiceForm.control}
                render={({ field }) => (
                  <Input id="confirmNewPhrase" type="text" placeholder="Repeat new phrase" {...field} disabled={isSavingPhrase} />
                )}
              />
              {voiceForm.formState.errors.confirmNewPhrase && <p className="text-sm text-destructive">{voiceForm.formState.errors.confirmNewPhrase.message}</p>}
            </div>
            <p className="text-xs text-muted-foreground">
              This is a simulated feature. In a real system, you would record your voice phrase.
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSavingPhrase}>
              {isSavingPhrase ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Set Voice Phrase
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock size={20}/> Change Password</CardTitle>
          <CardDescription>Update your account password regularly to keep your account secure.</CardDescription>
        </CardHeader>
         <form onSubmit={passwordForm.handleSubmit(handleSavePassword)}>
          <CardContent className="space-y-4">
             <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
               <Controller
                name="currentPassword"
                control={passwordForm.control}
                render={({ field }) => (
                    <Input id="currentPassword" type="password" {...field} disabled={isSavingPassword} />
                )}
                />
                {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field }) => (
                    <Input id="newPassword" type="password" {...field} disabled={isSavingPassword} />
                )}
              />
              {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Controller
                name="confirmNewPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <Input id="confirmNewPassword" type="password" {...field} disabled={isSavingPassword} />
                )}
              />
              {passwordForm.formState.errors.confirmNewPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmNewPassword.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

    </div>
  );
}
