
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/shared/AppLogo';
import { Eye, EyeOff, Loader2, UploadCloud, Building, UserPlus, Mic, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const loginFormSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
type LoginFormValues = z.infer<typeof loginFormSchema>;

const setupFormSchema = z.object({
  orgName: z.string().min(2, 'Organization name must be at least 2 characters.'),
  orgEmail: z.string().email('Invalid organization email.'),
  orgPhone: z.string().min(10, 'Please enter a valid phone number.').regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format."),
  companyLogo: z.any().optional(), 
  adminFullName: z.string().min(2, 'Admin full name is required.'),
  adminEmail: z.string().email('Invalid admin email address.'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters.'),
});
type SetupFormValues = z.infer<typeof setupFormSchema>;

type VoiceLoginStatus = 'idle' | 'prompting' | 'denied' | 'recording' | 'authenticating' | 'success' | 'error';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [isOrgSetup, setIsOrgSetup] = useState(false); 

  const [voiceLoginStatus, setVoiceLoginStatus] = useState<VoiceLoginStatus>('idle');
  const [voiceLoginMessage, setVoiceLoginMessage] = useState('');


  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const setupForm = useForm<SetupFormValues>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      orgName: '',
      orgEmail: '',
      orgPhone: '',
      adminFullName: '',
      adminEmail: '',
      adminPassword: '',
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setIsLoginLoading(true);
    setLoginError('');
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (data.email === 'xcoder2442@gmail.com' && data.password === '123456') {
      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
      router.push('/dashboard');
    } else {
      setLoginError('Invalid username or password.');
      loginForm.resetField('password');
    }
    setIsLoginLoading(false);
  };

  const handleSetup = async (data: SetupFormValues) => {
    setIsSetupLoading(true);
    setSetupError('');
    console.log('Setup Data:', data); 
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Setup Successful!',
      description: `${data.orgName} has been registered. Please login with your new admin account.`,
    });
    setIsOrgSetup(true); 
    setIsSetupLoading(false);
    setupForm.reset();
    setLogoFileName(null);
    loginForm.setValue('email', data.adminEmail);
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      setupForm.setValue('companyLogo', file); 
    } else {
      setLogoFileName(null);
      setupForm.setValue('companyLogo', undefined);
    }
  };

  const handleVoiceLogin = async () => {
    setVoiceLoginStatus('prompting');
    setVoiceLoginMessage('Requesting microphone access...');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceLoginStatus('error');
      setVoiceLoginMessage('Voice login not supported by your browser.');
      toast({ variant: 'destructive', title: 'Browser Not Supported', description: 'Your browser does not support microphone access for voice login.' });
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted
      setVoiceLoginStatus('recording');
      setVoiceLoginMessage('Please say your login phrase...');
      
      // Simulate recording
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      
      setVoiceLoginStatus('authenticating');
      setVoiceLoginMessage('Authenticating your voice...');

      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success for demo
      setVoiceLoginStatus('success');
      setVoiceLoginMessage('Voice recognized! Logging in...');
      toast({ title: 'Voice Login Successful!', description: 'Redirecting to dashboard...' });
      router.push('/dashboard');

    } catch (err) {
      console.error('Voice login error:', err);
      setVoiceLoginStatus('denied');
      setVoiceLoginMessage('Microphone access denied. Please enable it and try again.');
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please enable microphone permissions in your browser settings for voice login.',
      });
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary p-4 overflow-hidden">
      <div className={`grid w-full ${isOrgSetup ? 'max-w-md justify-items-center' : 'max-w-5xl grid-cols-1 lg:grid-cols-2 gap-8'}`}>
        <Card className={`w-full ${isOrgSetup ? 'mx-auto animate-in slide-in-from-bottom-12 duration-700 ease-out' : 'animate-in slide-in-from-left-12 duration-700 ease-out'}`}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AppLogo iconSize={40} textSize="text-3xl" />
            </div>
            <CardTitle className="text-2xl text-card-foreground">Admin Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              {isOrgSetup ? 'Access the Falcon T25 dashboard.' : 'Login if your organization is already set up.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={loginForm.handleSubmit(handleLogin)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="xcoder2442@gmail.com"
                  {...loginForm.register('email')}
                  disabled={isLoginLoading || voiceLoginStatus !== 'idle'}
                  className="bg-input text-foreground border-border placeholder:text-muted-foreground"
                />
                {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="●●●●●●"
                    {...loginForm.register('password')}
                    disabled={isLoginLoading || voiceLoginStatus !== 'idle'}
                    className="bg-input text-foreground border-border placeholder:text-muted-foreground"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
              </div>
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/50 group transition-all duration-300 ease-in-out"
                disabled={isLoginLoading || voiceLoginStatus !== 'idle'}
              >
                {isLoginLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="transition-transform group-hover:scale-105 inline-block">Login</span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full group"
                onClick={handleVoiceLogin}
                disabled={isLoginLoading || (voiceLoginStatus !== 'idle' && voiceLoginStatus !== 'denied' && voiceLoginStatus !== 'error')}
              >
                {voiceLoginStatus === 'prompting' || voiceLoginStatus === 'recording' || voiceLoginStatus === 'authenticating' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                ) : (
                  <Mic className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                )}
                Sign in with Voice
              </Button>
            </CardFooter>
          </form>
          {voiceLoginStatus !== 'idle' && (
            <div className={cn("p-4 text-center text-sm", {
              'text-muted-foreground': voiceLoginStatus === 'prompting' || voiceLoginStatus === 'recording' || voiceLoginStatus === 'authenticating',
              'text-green-500': voiceLoginStatus === 'success',
              'text-destructive': voiceLoginStatus === 'error' || voiceLoginStatus === 'denied',
            })}>
              <div className="flex items-center justify-center gap-2">
                {voiceLoginStatus === 'prompting' && <Loader2 className="animate-spin h-4 w-4" />}
                {voiceLoginStatus === 'recording' && <Mic className="animate-pulse text-red-500 h-4 w-4" />}
                {voiceLoginStatus === 'authenticating' && <Loader2 className="animate-spin h-4 w-4" />}
                {voiceLoginStatus === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {(voiceLoginStatus === 'error' || voiceLoginStatus === 'denied') && <AlertTriangle className="h-4 w-4" />}
                <span>{voiceLoginMessage}</span>
              </div>
            </div>
          )}
        </Card>

        {!isOrgSetup && (
          <Card className="w-full animate-in slide-in-from-right-12 duration-700 ease-out">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Building size={28} className="text-primary" />
                <CardTitle className="text-2xl text-card-foreground">First-Time Setup</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">Register your organization and create an admin account.</CardDescription>
            </CardHeader>
            <form onSubmit={setupForm.handleSubmit(handleSetup)}>
              <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <p className="text-sm font-semibold text-card-foreground">Organization Details</p>
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" placeholder="Your Company Inc." {...setupForm.register('orgName')} disabled={isSetupLoading} />
                  {setupForm.formState.errors.orgName && <p className="text-sm text-destructive">{setupForm.formState.errors.orgName.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgEmail">Organization Email</Label>
                    <Input id="orgEmail" type="email" placeholder="contact@company.com" {...setupForm.register('orgEmail')} disabled={isSetupLoading} />
                    {setupForm.formState.errors.orgEmail && <p className="text-sm text-destructive">{setupForm.formState.errors.orgEmail.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgPhone">Phone Number</Label>
                    <Input id="orgPhone" type="tel" placeholder="+1-555-123-4567" {...setupForm.register('orgPhone')} disabled={isSetupLoading} />
                    {setupForm.formState.errors.orgPhone && <p className="text-sm text-destructive">{setupForm.formState.errors.orgPhone.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo</Label>
                  <Input id="companyLogo-hidden" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} className="hidden" disabled={isSetupLoading} />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('companyLogo-hidden')?.click()} disabled={isSetupLoading} className="w-full justify-start">
                    <UploadCloud className="mr-2 h-4 w-4" /> {logoFileName || "Upload Logo"}
                  </Button>
                </div>

                <hr className="my-6 border-border" />
                <p className="text-sm font-semibold text-card-foreground flex items-center gap-2"><UserPlus size={18}/> Admin Account</p>
                 <div className="space-y-2">
                  <Label htmlFor="adminFullName">Admin Full Name</Label>
                  <Input id="adminFullName" placeholder="John Doe" {...setupForm.register('adminFullName')} disabled={isSetupLoading} />
                  {setupForm.formState.errors.adminFullName && <p className="text-sm text-destructive">{setupForm.formState.errors.adminFullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input id="adminEmail" type="email" placeholder="admin@company.com" {...setupForm.register('adminEmail')} disabled={isSetupLoading} />
                  {setupForm.formState.errors.adminEmail && <p className="text-sm text-destructive">{setupForm.formState.errors.adminEmail.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <div className="relative">
                    <Input
                      id="adminPassword"
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="Choose a strong password"
                      {...setupForm.register('adminPassword')}
                      disabled={isSetupLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      tabIndex={-1}
                    >
                      {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                  {setupForm.formState.errors.adminPassword && <p className="text-sm text-destructive">{setupForm.formState.errors.adminPassword.message}</p>}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Optional: <Button variant="link" className="p-0 h-auto text-primary" onClick={() => toast({title: "Voice Setup", description: "Voice setup would be initiated here."})}>Set up Voice Login</Button> (mock link)
                </div>
                {setupError && <p className="text-sm text-destructive">{setupError}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSetupLoading}>
                  {isSetupLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Setup & Register"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
