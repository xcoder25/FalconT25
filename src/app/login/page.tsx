
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/shared/AppLogo';
import { Eye, EyeOff, Loader2, Mic, AlertTriangle, CheckCircle2 } from 'lucide-react'; // Removed Building, UserPlus, UploadCloud
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

type VoiceLoginStatus = 'idle' | 'prompting' | 'denied' | 'recording' | 'authenticating' | 'success' | 'error';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [voiceLoginStatus, setVoiceLoginStatus] = useState<VoiceLoginStatus>('idle');
  const [voiceLoginMessage, setVoiceLoginMessage] = useState('');

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    // Prefill email if admin just completed setup
    try {
      const adminEmail = localStorage.getItem('falconT25AdminEmail');
      if (adminEmail) {
        loginForm.setValue('email', adminEmail);
        // Optional: remove it after use if it's a one-time prefill
        // localStorage.removeItem('falconT25AdminEmail');
      }
    } catch (e) {
      console.error("Error reading admin email from localStorage", e);
    }
  }, [loginForm]);


  const handleLogin = async (data: LoginFormValues) => {
    setIsLoginLoading(true);
    setLoginError('');
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Updated credentials to use the one potentially set during admin setup
    // Or keep your default for testing if admin setup flow is not always run
    const expectedEmail = localStorage.getItem('falconT25AdminEmail') || 'xcoder2442@gmail.com';
    const expectedPassword = 'password123'; // This should match what admin setup would use or a known default

    if (data.email.toLowerCase() === expectedEmail.toLowerCase() && data.password === expectedPassword) { // Using a generic password for now
      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
      router.push('/dashboard');
    } else if (data.email.toLowerCase() === 'xcoder2442@gmail.com' && data.password === '123456'){ // Fallback for original credentials
      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
      router.push('/dashboard');
    }
    else {
      setLoginError('Invalid username or password.');
      loginForm.resetField('password');
    }
    setIsLoginLoading(false);
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
      setVoiceLoginStatus('recording');
      setVoiceLoginMessage('Please say your login phrase...');
      
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      
      setVoiceLoginStatus('authenticating');
      setVoiceLoginMessage('Authenticating your voice...');

      await new Promise(resolve => setTimeout(resolve, 2000));

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
      <Card className="w-full max-w-md animate-in slide-in-from-bottom-12 duration-700 ease-out">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AppLogo iconSize={40} textSize="text-3xl" />
            </div>
            <CardTitle className="text-2xl text-card-foreground">Admin Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Access the Falcon T25 dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={loginForm.handleSubmit(handleLogin)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@yourcompany.com"
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
    </div>
  );
}
