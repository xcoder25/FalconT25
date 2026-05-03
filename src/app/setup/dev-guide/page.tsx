
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Users, Award, Brain, BarChart3, Shield, Bell, ArrowRight,
  ArrowLeft, CheckCircle2, Play, Building2, Fingerprint, Zap,
  Clock, Globe, ChevronRight, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/shared/AppLogo';
import { cn } from '@/lib/utils';

interface Slide {
  id: string;
  icon: React.ReactNode;
  accent: string;
  gradient: string;
  title: string;
  subtitle: string;
  description: string;
  features: { icon: React.ReactNode; text: string }[];
}

const slides: Slide[] = [
  {
    id: 'welcome',
    icon: <Sparkles className="h-16 w-16" />,
    accent: 'text-violet-400',
    gradient: 'from-violet-600/20 via-purple-600/10 to-transparent',
    title: 'Welcome to Falcon T25',
    subtitle: 'Your AI-Powered Workforce Platform',
    description:
      'Falcon T25 combines cutting-edge facial recognition attendance tracking with an intelligent employee recognition system — all in one powerful dashboard built for modern enterprises.',
    features: [
      { icon: <Camera className="h-4 w-4" />, text: 'AI Facial Recognition Attendance' },
      { icon: <Award className="h-4 w-4" />, text: 'Peer Recognition & Culture Building' },
      { icon: <Brain className="h-4 w-4" />, text: 'AI-Powered Insights & Suggestions' },
      { icon: <Shield className="h-4 w-4" />, text: 'Enterprise Security & Compliance' },
    ],
  },
  {
    id: 'attendance',
    icon: <Camera className="h-16 w-16" />,
    accent: 'text-cyan-400',
    gradient: 'from-cyan-600/20 via-blue-600/10 to-transparent',
    title: 'Smart Attendance Tracking',
    subtitle: 'Real-time facial recognition at every entry point',
    description:
      'Connect your RTSP cameras and let Falcon T25 automatically detect, identify, and log staff attendance. Unrecognized persons trigger instant security alerts.',
    features: [
      { icon: <Clock className="h-4 w-4" />, text: 'Automatic sign-in & sign-out logging' },
      { icon: <Bell className="h-4 w-4" />, text: 'Instant alerts for unknown faces' },
      { icon: <Globe className="h-4 w-4" />, text: 'Multi-branch, multi-camera support' },
      { icon: <BarChart3 className="h-4 w-4" />, text: 'Attendance analytics & reports' },
    ],
  },
  {
    id: 'recognition',
    icon: <Award className="h-16 w-16" />,
    accent: 'text-amber-400',
    gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
    title: 'Employee Recognition',
    subtitle: 'Build a culture of appreciation',
    description:
      `Empower your team to celebrate each other's achievements. Nominate colleagues, add reactions, leave comments, and let AI craft the perfect recognition message.`,
    features: [
      { icon: <Users className="h-4 w-4" />, text: 'Peer-to-peer nominations' },
      { icon: <Brain className="h-4 w-4" />, text: 'AI-generated recognition messages' },
      { icon: <Sparkles className="h-4 w-4" />, text: 'Live recognition feed & reactions' },
      { icon: <BarChart3 className="h-4 w-4" />, text: 'Performance highlights & leaderboard' },
    ],
  },
  {
    id: 'setup',
    icon: <Building2 className="h-16 w-16" />,
    accent: 'text-green-400',
    gradient: 'from-green-600/20 via-emerald-600/10 to-transparent',
    title: 'Getting Started',
    subtitle: `You're just 3 steps away from going live`,
    description:
      'Setting up Falcon T25 is fast and guided. Follow these steps and your team will be tracked and recognized within minutes.',
    features: [
      { icon: <CheckCircle2 className="h-4 w-4 text-green-400" />, text: 'Step 1 — Register your organization' },
      { icon: <CheckCircle2 className="h-4 w-4 text-green-400" />, text: 'Step 2 — Create your admin account' },
      { icon: <CheckCircle2 className="h-4 w-4 text-green-400" />, text: 'Step 3 — Add cameras & enroll staff faces' },
      { icon: <Zap className="h-4 w-4 text-amber-400" />, text: `You're live — Falcon T25 handles the rest!` },
    ],
  },
];

export default function DevGuidePage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLast = current === slides.length - 1;
  const slide = slides[current];

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((c) => Math.max(0, Math.min(slides.length - 1, c + dir)));
  };

  const handleGetStarted = () => {
    try { localStorage.setItem('falconT25GuideComplete', 'true'); } catch {}
    router.push('/auth-check');
  };

  const handleSkip = () => {
    try { localStorage.setItem('falconT25GuideComplete', 'true'); } catch {}
    router.push('/auth-check');
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={cn('absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl opacity-20 bg-gradient-to-br', slide.gradient)} />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl opacity-10 bg-violet-600" />
      </div>

      {/* Top bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 px-1">
        <AppLogo iconSize={28} textSize="text-xl" />
        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={handleSkip}>
          Skip tour <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full"
          >
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Hero area */}
              <div className={cn('relative flex flex-col items-center justify-center py-12 px-8 bg-gradient-to-b', slide.gradient)}>
                <div className={cn('mb-4 opacity-90', slide.accent)}>{slide.icon}</div>
                <h1 className="text-3xl font-bold text-center text-foreground">{slide.title}</h1>
                <p className={cn('text-sm font-medium mt-1 text-center', slide.accent)}>{slide.subtitle}</p>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 text-center">
                  {slide.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slide.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm"
                    >
                      <span className={slide.accent}>{f.icon}</span>
                      <span className="text-foreground/90">{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={cn(
              'rounded-full transition-all duration-300',
              i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-muted-foreground/30'
            )}
            id={`guide-dot-${i}`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6 w-full max-w-2xl">
        <Button
          variant="outline"
          onClick={() => go(-1)}
          disabled={current === 0}
          className="w-32"
          id="guide-prev-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1" />
        {isLast ? (
          <Button
            className="w-44 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
            onClick={handleGetStarted}
            id="guide-start-btn"
          >
            <Play className="h-4 w-4 mr-2" /> Let's Begin!
          </Button>
        ) : (
          <Button
            className="w-32"
            onClick={() => go(1)}
            id="guide-next-btn"
          >
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Step counter */}
      <p className="text-xs text-muted-foreground mt-4">
        {current + 1} of {slides.length}
      </p>
    </div>
  );
}
