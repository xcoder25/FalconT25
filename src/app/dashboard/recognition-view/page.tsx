
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CameraOff, Waves, Hand, Loader2, AlertTriangle, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MockDetection {
  id: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  label: string;
  timestamp: string;
  isUnrecognized?: boolean;
}

const UNRECOGNIZED_PERSON_ID = 'unrecognized1'; // ID for the specific unrecognized person

export default function RecognitionViewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(true);
  const [isWaveDetected, setIsWaveDetected] = useState<boolean>(false);
  const { toast } = useToast();

  const [mockDetections, setMockDetections] = useState<MockDetection[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');

  const [isMonitoringLingering, setIsMonitoringLingering] = useState<boolean>(false);
  const [isIntruderAlertActive, setIsIntruderAlertActive] = useState<boolean>(false);
  const intruderTimerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateCurrentTime(); // Initial set
    const timerId = setInterval(updateCurrentTime, 1000); // Update every second
    return () => clearInterval(timerId);
  }, []);
  
  useEffect(() => {
    const initialTimestamp = new Date().toISOString(); 
    setMockDetections([
      { id: 'person1', x: 15, y: 20, width: 30, height: 60, label: 'Person 1 (Alice)', timestamp: initialTimestamp },
      { id: UNRECOGNIZED_PERSON_ID, x: 60, y: 10, width: 25, height: 50, label: 'Unrecognized', timestamp: initialTimestamp, isUnrecognized: true },
      { id: 'person2', x: 55, y: 30, width: 25, height: 50, label: 'Person 2 (Bob)', timestamp: initialTimestamp },
    ]);
  }, []);


  useEffect(() => {
    const getCameraPermission = async () => {
      setIsCameraLoading(true);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera API Not Supported',
          description: 'Your browser does not support camera access. Please use a modern browser.',
        });
        setHasCameraPermission(false);
        setIsCameraLoading(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      } finally {
        setIsCameraLoading(false);
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (intruderTimerRef.current) {
        clearTimeout(intruderTimerRef.current);
      }
    };
  }, [toast]);
  
  const toggleWaveDetection = () => {
    setIsWaveDetected(prev => !prev);
    toast({
        title: isWaveDetected ? 'Wave Undetected' : 'Wave Detected!',
        description: isWaveDetected ? 'No wave is currently detected.' : 'A wave gesture has been simulated.',
    });
  };

  const handleSimulateLingering = () => {
    if (isMonitoringLingering || isIntruderAlertActive) return;

    setIsMonitoringLingering(true);
    toast({
      title: 'Monitoring Unrecognized Individual',
      description: 'Simulating unrecognized person lingering near "Main Lobby Camera"...',
      variant: 'default',
    });

    intruderTimerRef.current = setTimeout(() => {
      setIsIntruderAlertActive(true);
      setIsMonitoringLingering(false);
      toast({
        variant: 'destructive',
        title: 'INTRUDER ALERT!',
        description: 'Unrecognized person detected for an extended period at Main Lobby Camera. Security notified. Snapshot sent.',
      });
    }, 5000); // 5 seconds for demo
  };

  const dismissIntruderAlert = () => {
    setIsIntruderAlertActive(false);
    if (intruderTimerRef.current) {
      clearTimeout(intruderTimerRef.current);
    }
    setIsMonitoringLingering(false); 
    toast({
        title: 'Intruder Alert Dismissed',
        description: 'The visual alert has been cleared.',
    });
  };


  return (
    <div className="space-y-6 flex flex-col h-full">
      <PageHeader
        title="Live Recognition View"
        description="Real-time camera feed with (simulated) detections, gesture, and intruder alerts."
      />

      {isIntruderAlertActive && (
        <Alert variant="destructive" className="mb-4 animate-pulse">
          <Siren className="h-5 w-5" />
          <AlertTitle>INTRUDER ALERT!</AlertTitle>
          <AlertDescription>
            Unrecognized individual detected for an extended period. Authorities have been (simulated) notified.
            <Button onClick={dismissIntruderAlert} variant="outline" size="sm" className="ml-4">Dismiss Alert</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-grow relative flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden shadow-inner min-h-[400px] md:min-h-[500px]">
        {isCameraLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Initializing camera...</p>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline 
        />

        {!isCameraLoading && hasCameraPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-6 z-10">
            <Alert variant="destructive" className="max-w-md text-center">
              <CameraOff className="h-6 w-6 mx-auto mb-2" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Camera permission is denied or not available. Please allow camera access in your browser settings and refresh the page to use this feature.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {hasCameraPermission && !isCameraLoading && (
          <div className="absolute inset-0 pointer-events-none">
            {mockDetections.map((detection) => (
              <div
                key={detection.id}
                className={cn(
                  `absolute border-2 rounded shadow-lg pointer-events-auto`,
                  detection.isUnrecognized ? 'border-destructive' : 'border-primary',
                  isIntruderAlertActive && detection.id === UNRECOGNIZED_PERSON_ID && 'flashing-border'
                )}
                style={{
                  left: `${detection.x}%`,
                  top: `${detection.y}%`,
                  width: `${detection.width}%`,
                  height: `${detection.height}%`,
                }}
              >
                <div className={cn(`absolute -top-6 left-0 text-xs px-1.5 py-0.5 rounded-t whitespace-nowrap`,
                  detection.isUnrecognized ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
                )}>
                  {detection.isUnrecognized && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                  {detection.label}
                </div>
                <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 rounded-tl">
                  {currentTime}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg shadow-sm bg-card mt-4">
        <div className="flex items-center gap-3">
          {isWaveDetected ? (
            <Waves className="h-8 w-8 text-green-500 animate-pulse" />
          ) : (
            <Hand className="h-8 w-8 text-muted-foreground" />
          )}
          <div>
            <p className={`text-lg font-semibold ${isWaveDetected ? 'text-green-500' : 'text-foreground'}`}>
              {isWaveDetected ? 'Wave Detected!' : 'No Wave Detected'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isWaveDetected ? 'A gesture has been recognized.' : 'Monitoring for wave gestures.'}
            </p>
          </div>
          <Button onClick={toggleWaveDetection} variant="outline" className="w-full sm:w-auto sm:ml-auto">
            {isWaveDetected ? 'Simulate No Wave' : 'Simulate Wave Detection'}
          </Button>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-4">
           {isMonitoringLingering ? (
             <Loader2 className="h-8 w-8 text-primary animate-spin" />
           ) : isIntruderAlertActive ? (
            <Siren className="h-8 w-8 text-destructive animate-pulse" />
           ) : (
             <Siren className="h-8 w-8 text-muted-foreground" />
           )}
          <div>
            <p className={`text-lg font-semibold ${isIntruderAlertActive ? 'text-destructive' : 'text-foreground'}`}>
              {isMonitoringLingering ? 'Monitoring...' : isIntruderAlertActive ? 'Intruder Alert!' : 'No Intruder Detected'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isMonitoringLingering ? 'Checking for extended presence.' : isIntruderAlertActive ? 'Unrecognized individual lingered.' : 'System is monitoring.'}
            </p>
          </div>
           <Button 
            onClick={isIntruderAlertActive ? dismissIntruderAlert : handleSimulateLingering} 
            variant={isIntruderAlertActive ? "destructive" : "outline"} 
            className="w-full sm:w-auto sm:ml-auto"
            disabled={isMonitoringLingering}
          >
            {isMonitoringLingering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isIntruderAlertActive ? 'Dismiss Alert' : 'Simulate Lingering'}
          </Button>
        </div>
      </div>
    </div>
  );
}
