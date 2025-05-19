import React from 'react';
import { Rocket } from 'lucide-react'; // Changed from Award to Rocket

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showIcon?: boolean;
}

export function AppLogo({ 
  className, 
  iconSize = 28, 
  textSize = "text-2xl",
  showIcon = true 
}: AppLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && <Rocket className="text-primary" size={iconSize} strokeWidth={2.5} />}
      <span className={`ml-2 font-bold text-primary ${textSize}`}>
        Falcon T25
      </span>
    </div>
  );
}
