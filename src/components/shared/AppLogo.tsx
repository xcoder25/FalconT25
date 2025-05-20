
import React from 'react';
import Image from 'next/image'; // Import next/image

interface AppLogoProps {
  className?: string;
  iconSize?: number; // Will be used for width and height
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
    <div className={`flex items-center ${className}`}>
      {showIcon && (
        <Image
          src="/falcon-logo.png" // Path to the image in the public folder
          alt="Falcon T25 Logo"
          width={iconSize}
          height={iconSize}
          data-ai-hint="logo company"
          // className="text-primary" // text-primary likely won't affect raster images directly
        />
      )}
      <span className={`ml-2 font-bold text-primary ${textSize}`}>
        Falcon T25
      </span>
    </div>
  );
}
