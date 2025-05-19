import React from 'react';
import { Award } from 'lucide-react'; // Using Award icon as part of the logo

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
      {showIcon && <Award className="text-primary" size={iconSize} strokeWidth={2.5} />}
      <span className={`ml-2 font-bold text-primary ${textSize}`}>
        Applaud
      </span>
    </div>
  );
}
