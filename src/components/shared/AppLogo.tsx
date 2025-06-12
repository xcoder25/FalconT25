
import React from 'react';
import Image from 'next/image'; // Import next/image
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconSize?: number; // Will be used for width and height of the placeholder
  textSize?: string;
  showIcon?: boolean;
  // iconStrokeWidth is no longer relevant for next/image
}

export function AppLogo({
  className,
  iconSize = 28,
  textSize = "text-2xl",
  showIcon = true,
}: AppLogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {showIcon && (
        <div
          className="flex items-center justify-center rounded-full bg-primary/10 p-1 mr-2" // Added padding and a subtle background for the placeholder
          style={{ width: iconSize, height: iconSize }}
        >
          <Image
            src="/falcon-logo.png" // Path to the image in the public folder
            alt="Falcon T25 Logo"
            width={Math.floor(iconSize * 0.7)} // Make image slightly smaller than placeholder
            height={Math.floor(iconSize * 0.7)} // Make image slightly smaller than placeholder
            data-ai-hint="logo company"
            className="object-contain" // Ensure image scales well within its container
          />
        </div>
      )}
      <span className={cn('font-bold text-primary', textSize)}>
        Falcon T25
      </span>
    </div>
  );
}
