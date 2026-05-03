'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/shared/AppLogo';
import { Eye, EyeOff, Loader2, Mic, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const loginFormSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});
type LoginFormValues = z.infer<typeof loginFormSchema>;

type VoiceLoginStatus = 'idle' | 'prompting' | 'denied' | 'recording' | 'authenticating' | 'success' | 'error';

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, loginWithGoogle, isLoading: isAuthLoading, error: authError } = useAuth();
  
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [voiceLoginStatus, setVoiceLoginStatus] = useState<VoiceLoginStatus>('idle');
  const [voiceLoginMessage, setVoiceLoginMessage] = useState('');

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    try {
      const adminEmail = localStorage.getItem('falconT25AdminEmail');
      if (adminEmail) {
        loginForm.setValue('email', adminEmail);
      }
    } catch (e) {
      console.error("Error reading admin email from localStorage", e);
    }
  }, [loginForm]);


  const handleLogin = async (data: LoginFormValues) => {
    setIsLoginLoading(true);
    setLoginError('');
    try {
      await login(data.email, data.password);
      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
      loginForm.resetField('password');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoginLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: 'Google Sign-In Successful!',
        description: `Redirecting...`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message || 'Could not sign in with Google. Please try again.',
      });
    } finally {
      setIsGoogleLoginLoading(false);
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
      setVoiceLoginStatus('recording');
      setVoiceLoginMessage('Please say your login phrase...');
      
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      
      setVoiceLoginStatus('authenticating');
      setVoiceLoginMessage('Authenticating your voice...');

      await new Promise(resolve => setTimeout(resolve, 2000));

      setVoiceLoginStatus('success');
      setVoiceLoginMessage('Voice recognized! Logging in...');
      
      // MOCK voice login success
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
                  disabled={isLoginLoading || isAuthLoading || voiceLoginStatus !== 'idle' || isGoogleLoginLoading}
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
                    disabled={isLoginLoading || isAuthLoading || voiceLoginStatus !== 'idle' || isGoogleLoginLoading}
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
              {authError && <p className="text-sm text-destructive">{authError}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/50 group transition-all duration-300 ease-in-out"
                disabled={isLoginLoading || isAuthLoading || voiceLoginStatus !== 'idle' || isGoogleLoginLoading}
              >
                {isLoginLoading || isAuthLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="transition-transform group-hover:scale-105 inline-block">Login</span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full group"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoginLoading || isAuthLoading || isLoginLoading || voiceLoginStatus !== 'idle'}
              >
                {isGoogleLoginLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Sign in with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full group"
                onClick={handleVoiceLogin}
                disabled={isLoginLoading || isAuthLoading || isGoogleLoginLoading || (voiceLoginStatus !== 'idle' && voiceLoginStatus !== 'denied' && voiceLoginStatus !== 'error')}
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
