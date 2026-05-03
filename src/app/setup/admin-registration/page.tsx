'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/shared/AppLogo';
import { UserPlus, UploadCloud, Mic, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const adminRegistrationSchema = z.object({
  adminFullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  adminRole: z.string().min(2, 'Role/title is required.'),
  adminEmail: z.string().email('Invalid email address.'),
  adminPhone: z.string().min(10, 'Please enter a valid phone number.').regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format."),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
  faceImage: z.any().optional(),
}).refine(data => data.adminPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AdminRegistrationFormValues = z.infer<typeof adminRegistrationSchema>;

export default function AdminRegistrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [faceImageName, setFaceImageName] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    // Retrieve company name from localStorage
    try {
      const companyDataString = localStorage.getItem('falconT25CompanyRegData');
      if (companyDataString) {
        setCompanyData(JSON.parse(companyDataString));
      } else {
        // If no data, redirect back to company registration
        toast({ variant: "destructive", title: "Setup Error", description: "Company details not found. Please start over." });
        router.replace('/setup/company-registration');
      }
    } catch (e) {
        console.error("Error reading from localStorage", e);
        router.replace('/setup/company-registration');
    }

  }, [router, toast]);


  const form = useForm<AdminRegistrationFormValues>({
    resolver: zodResolver(adminRegistrationSchema),
    defaultValues: {
      adminFullName: '',
      adminRole: '',
      adminEmail: '',
      adminPhone: '',
      adminPassword: '',
      confirmPassword: '',
    },
  });

  const handleFaceImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFaceImageName(file.name);
      form.setValue('faceImage', file);
    } else {
      setFaceImageName(null);
      form.setValue('faceImage', undefined);
    }
  };

  const onSubmit = async (data: AdminRegistrationFormValues) => {
    if (!companyData) return;
    
    setIsLoading(true);
    try {
      // Call the real registration function which creates the Firebase user, 
      // the tenant document, and the subscription via the API route we created.
      await register({
        email: data.adminEmail,
        password: data.adminPassword,
        displayName: data.adminFullName,
        companyName: companyData.companyName,
        companyEmail: companyData.companyEmail,
        companyPhone: companyData.companyPhone,
        companyAddress: companyData.companyAddress,
        industryType: companyData.industryType,
        companySize: companyData.companySize,
      });

      // Mark setup as complete
      localStorage.setItem('falconT25SetupComplete', 'true');
      localStorage.setItem('falconT25AdminEmail', data.adminEmail);

      toast({
        title: 'Admin Account Created!',
        description: `Setup for ${companyData.companyName} is complete. Welcome, ${data.adminFullName}!`,
        className: 'bg-green-500 text-white',
        duration: 5000,
      });
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!companyData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading company details...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-12 duration-700 ease-out">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo iconSize={40} textSize="text-3xl" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <UserPlus className="h-7 w-7 text-primary" />
            Admin Account Setup (Step 2 of 2)
          </CardTitle>
          <CardDescription>Create the primary administrator account for {companyData.companyName}.</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adminFullName">Full Name</Label>
                <Input id="adminFullName" placeholder="e.g., Jane Doe" {...form.register('adminFullName')} disabled={isLoading} />
                {form.formState.errors.adminFullName && <p className="text-sm text-destructive">{form.formState.errors.adminFullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminRole">Role/Title</Label>
                <Input id="adminRole" placeholder="e.g., CEO, IT Manager" {...form.register('adminRole')} disabled={isLoading} />
                {form.formState.errors.adminRole && <p className="text-sm text-destructive">{form.formState.errors.adminRole.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input id="adminEmail" type="email" placeholder="admin@yourcompany.com" {...form.register('adminEmail')} disabled={isLoading} />
                {form.formState.errors.adminEmail && <p className="text-sm text-destructive">{form.formState.errors.adminEmail.message}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="adminPhone">Admin Phone (Optional)</Label>
                <Input id="adminPhone" type="tel" placeholder="+1-555-987-6543" {...form.register('adminPhone')} disabled={isLoading} />
                {form.formState.errors.adminPhone && <p className="text-sm text-destructive">{form.formState.errors.adminPhone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Set Password</Label>
                <div className="relative">
                  <Input id="adminPassword" type={showPassword ? "text" : "password"} placeholder="Choose a strong password" {...form.register('adminPassword')} disabled={isLoading} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                {form.formState.errors.adminPassword && <p className="text-sm text-destructive">{form.formState.errors.adminPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                 <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Repeat password" {...form.register('confirmPassword')} disabled={isLoading} />
                   <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                {form.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faceImage">Upload Face Image (Optional for Facial Login)</Label>
              <Input id="faceImage-hidden" type="file" accept="image/png, image/jpeg" onChange={handleFaceImageChange} className="hidden" disabled={isLoading} />
              <Button type="button" variant="outline" onClick={() => document.getElementById('faceImage-hidden')?.click()} disabled={isLoading} className="w-full justify-start">
                <UploadCloud className="mr-2 h-4 w-4" /> {faceImageName || "Upload Your Photo"}
              </Button>
              <p className="text-xs text-muted-foreground">This helps set up facial recognition login. Clear, front-facing photos work best.</p>
            </div>

            <div className="space-y-2">
              <Label>Voice Login (Optional)</Label>
              <Button type="button" variant="outline" onClick={() => toast({title: "Voice Setup (Mock)", description: "Voice recording & setup process would start here."})} disabled={isLoading} className="w-full justify-start">
                <Mic className="mr-2 h-4 w-4" /> Set Up Voice Login
              </Button>
              <p className="text-xs text-muted-foreground">Record a unique phrase for voice authentication.</p>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Create Admin Account & Enter Dashboard
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
