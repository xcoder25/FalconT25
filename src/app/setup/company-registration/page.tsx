
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLogo } from '@/components/shared/AppLogo';
import { Building2, UploadCloud, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const companyRegistrationSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  companyEmail: z.string().email('Invalid company email address.'),
  companyPhone: z.string().min(10, 'Please enter a valid phone number.').regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format."),
  companyAddress: z.string().min(10, 'Company address is required.'),
  industryType: z.string().min(1, 'Please select an industry type.'),
  companySize: z.string().min(1, 'Please select company size.'),
  companyLogo: z.any().optional(),
  registrationDocument: z.any().optional(),
});

type CompanyRegistrationFormValues = z.infer<typeof companyRegistrationSchema>;

const industryTypes = ["Technology", "Healthcare", "Finance", "Education", "Manufacturing", "Retail", "Other"];
const companySizes = ["1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees", "500+ employees"];

export default function CompanyRegistrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState<string | null>(null);

  const form = useForm<CompanyRegistrationFormValues>({
    resolver: zodResolver(companyRegistrationSchema),
    defaultValues: {
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      companyAddress: '',
      industryType: '',
      companySize: '',
    },
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      form.setValue('companyLogo', file);
    } else {
      setLogoFileName(null);
      form.setValue('companyLogo', undefined);
    }
  };

  const handleDocChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocFileName(file.name);
      form.setValue('registrationDocument', file);
    } else {
      setDocFileName(null);
      form.setValue('registrationDocument', undefined);
    }
  };

  const onSubmit = async (data: CompanyRegistrationFormValues) => {
    setIsLoading(true);
    console.log('Company Registration Data (Simulated):', data);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      localStorage.setItem('falconT25CompanyRegData', JSON.stringify({ companyName: data.companyName }));
      if (data.companyLogo && data.companyName) {
        // Simulate storing a URL for the logo. In a real app, this would be the URL after uploading to a server.
        const companyInitials = data.companyName.substring(0, 2).toUpperCase() || 'LG';
        localStorage.setItem('falconT25CompanyLogoUrl', `https://placehold.co/100x100.png?text=${companyInitials}`);
      } else {
        localStorage.removeItem('falconT25CompanyLogoUrl');
      }
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }


    toast({
      title: 'Step 1 Complete!',
      description: 'Company details saved. Proceed to admin setup.',
    });
    setIsLoading(false);
    router.push('/setup/admin-registration');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-12 duration-700 ease-out">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo iconSize={48} textSize="text-4xl" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Organization Registration (Step 1 of 2)
          </CardTitle>
          <CardDescription>Let's get your organization set up on Falcon T25.</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Your Awesome Company Inc." {...form.register('companyName')} disabled={isLoading} />
                {form.formState.errors.companyName && <p className="text-sm text-destructive">{form.formState.errors.companyName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Company Email</Label>
                <Input id="companyEmail" type="email" placeholder="contact@yourcompany.com" {...form.register('companyEmail')} disabled={isLoading} />
                {form.formState.errors.companyEmail && <p className="text-sm text-destructive">{form.formState.errors.companyEmail.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyPhone">Company Phone Number</Label>
              <Input id="companyPhone" type="tel" placeholder="+1-555-123-4567" {...form.register('companyPhone')} disabled={isLoading} />
              {form.formState.errors.companyPhone && <p className="text-sm text-destructive">{form.formState.errors.companyPhone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Company Address</Label>
              <Textarea id="companyAddress" placeholder="123 Main Street, Anytown, USA" {...form.register('companyAddress')} disabled={isLoading} className="min-h-[80px]" />
              {form.formState.errors.companyAddress && <p className="text-sm text-destructive">{form.formState.errors.companyAddress.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="industryType">Industry Type</Label>
                <Controller
                  name="industryType"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <SelectTrigger id="industryType">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.industryType && <p className="text-sm text-destructive">{form.formState.errors.industryType.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Controller
                  name="companySize"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <SelectTrigger id="companySize">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.companySize && <p className="text-sm text-destructive">{form.formState.errors.companySize.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyLogo">Company Logo (Optional)</Label>
              <Input id="companyLogo-hidden" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} className="hidden" disabled={isLoading} />
              <Button type="button" variant="outline" onClick={() => document.getElementById('companyLogo-hidden')?.click()} disabled={isLoading} className="w-full justify-start">
                <UploadCloud className="mr-2 h-4 w-4" /> {logoFileName || "Upload Logo"}
              </Button>
               <p className="text-xs text-muted-foreground">Recommended: PNG, JPG, SVG. Max 2MB.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDocument">Company Registration Document (Optional)</Label>
              <Input id="registrationDocument-hidden" type="file" accept=".pdf,.doc,.docx" onChange={handleDocChange} className="hidden" disabled={isLoading} />
              <Button type="button" variant="outline" onClick={() => document.getElementById('registrationDocument-hidden')?.click()} disabled={isLoading} className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" /> {docFileName || "Upload Document (e.g., CAC)"}
              </Button>
              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX. Max 5MB.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              Continue to Admin Setup
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
