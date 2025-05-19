'use client';

import React, { useState } from 'react'; // Explicitly import React
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { mockUsers, mockRecognitionValues } from '@/lib/mockData';
import type { User, RecognitionValue } from '@/lib/types';
import { AiReasonSuggester } from './AiReasonSuggester';
import { Loader2, Send } from 'lucide-react';

const nominationFormSchema = z.object({
  colleagueId: z.string().min(1, 'Please select a colleague.'),
  recognitionValueId: z.string().min(1, 'Please select a recognition value.'),
  customReason: z.string().optional(),
  personalMessage: z.string().min(10, 'Personal message must be at least 10 characters.').max(500, 'Message too long.'),
});

type NominationFormValues = z.infer<typeof nominationFormSchema>;

export function NominationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<NominationFormValues>({
    resolver: zodResolver(nominationFormSchema),
    defaultValues: {
      personalMessage: '',
      customReason: '',
    }
  });

  const selectedRecognitionValue = watch('recognitionValueId');
  const isCustomReason = mockRecognitionValues.find(v => v.id === selectedRecognitionValue)?.name === 'Custom Reason' || !selectedRecognitionValue;


  const onSubmit = async (data: NominationFormValues) => {
    setIsSubmitting(true);
    console.log('Nomination Data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const finalReason = (isCustomReason && data.customReason) 
      ? data.customReason 
      : mockRecognitionValues.find(v => v.id === data.recognitionValueId)?.name || 'Outstanding Work';

    toast({
      title: 'Nomination Submitted!',
      description: `${mockUsers.find(u=>u.id === data.colleagueId)?.name} nominated for ${finalReason}.`,
      variant: 'default',
    });
    // Reset form if needed, or redirect
    setIsSubmitting(false);
    // Ideally reset form:
    // reset(); // if using react-hook-form's reset
  };

  const handleAiReasonSelect = (reason: string) => {
    if (isCustomReason) {
      setValue('customReason', reason, { shouldValidate: true });
    } else {
      // Find 'Custom Reason' value or handle appropriately
      const customValue = mockRecognitionValues.find(v => v.name === 'Custom Reason');
      if (customValue) {
        setValue('recognitionValueId', customValue.id);
      }
      setValue('customReason', reason, { shouldValidate: true });
    }
  };

  // Ensure "Custom Reason" is an option if it doesn't exist
  const recognitionValuesWithOptions = [...mockRecognitionValues];
  if (!recognitionValuesWithOptions.find(v => v.name === "Custom Reason")) {
    recognitionValuesWithOptions.push({id: "custom", name: "Custom Reason", description: "Provide your own reason for recognition."});
  }


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Nominate a Colleague</CardTitle>
        <CardDescription>Recognize someone for their oustanding contributions.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="colleagueId">Colleague to Recognize</Label>
              <Controller
                name="colleagueId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <SelectTrigger id="colleagueId">
                      <SelectValue placeholder="Select a colleague" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user: User) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.colleagueId && <p className="text-sm text-destructive mt-1">{errors.colleagueId.message}</p>}
            </div>

            <div>
              <Label htmlFor="recognitionValueId">Recognition Value</Label>
              <Controller
                name="recognitionValueId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <SelectTrigger id="recognitionValueId">
                      <SelectValue placeholder="Select a value" />
                    </SelectTrigger>
                    <SelectContent>
                      {recognitionValuesWithOptions.map((value: RecognitionValue) => (
                        <SelectItem key={value.id} value={value.id}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.recognitionValueId && <p className="text-sm text-destructive mt-1">{errors.recognitionValueId.message}</p>}
            </div>
          </div>
          
          {isCustomReason && (
            <div>
              <Label htmlFor="customReason">Custom Reason for Recognition</Label>
              <Controller
                name="customReason"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="customReason"
                    placeholder="Describe why this colleague deserves recognition..."
                    {...field}
                    className="min-h-[80px]"
                    disabled={isSubmitting}
                  />
                )}
              />
               {/* Custom reason might be optional if AI is used or a pre-defined value selected */}
            </div>
          )}

          <AiReasonSuggester onReasonSelect={handleAiReasonSelect} />

          <div>
            <Label htmlFor="personalMessage">Personal Message (optional)</Label>
            <Controller
              name="personalMessage"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="personalMessage"
                  placeholder="Add a personal touch to your recognition..."
                  {...field}
                  className="min-h-[100px]"
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.personalMessage && <p className="text-sm text-destructive mt-1">{errors.personalMessage.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" /> Submit Nomination
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
