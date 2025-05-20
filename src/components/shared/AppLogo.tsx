
import React from 'react';
import { FalconIcon } from './FalconIcon'; // Import the new FalconIcon

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showIcon?: boolean;
  iconStrokeWidth?: number;
}

export function AppLogo({ 
  className, 
  iconSize = 28, 
  textSize = "text-2xl",
  showIcon = true,
  iconStrokeWidth = 1.5 // Default stroke width for FalconIcon, can be adjusted if needed
}: AppLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && (
        <FalconIcon 
          className="text-primary" 
          size={iconSize} 
          strokeWidth={iconStrokeWidth} 
        />
      )}
      <span className={`ml-2 font-bold text-primary ${textSize}`}>
        Falcon T25
      </span>
    </div>
  );
}
