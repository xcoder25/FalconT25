
import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showIcon?: boolean;
  companyLogoUrl?: string;
  companyName?: string;
}

export function AppLogo({
  className,
  iconSize = 32, // Increased default icon size
  textSize = "text-2xl", // Increased default text size
  showIcon = true,
  companyLogoUrl,
  companyName,
}: AppLogoProps) {
  const isCompanyLogo = !!companyLogoUrl;
  const logoSrc = isCompanyLogo ? companyLogoUrl : "/falcon-logo.png";
  const altText = isCompanyLogo 
    ? `${companyName || 'Company'} Logo` 
    : "Falcon T25 Logo";

  return (
    <div className={cn('flex items-center', className)}>
      {showIcon && (
        <div
          className="flex items-center justify-center rounded-full bg-primary/10 p-1 mr-2"
          style={{ width: iconSize, height: iconSize }}
        >
          <Image
            src={logoSrc}
            alt={altText}
            width={Math.floor(iconSize * (isCompanyLogo ? 0.9 : 0.7))} // Company logo can be a bit larger in placeholder
            height={Math.floor(iconSize * (isCompanyLogo ? 0.9 : 0.7))}
            data-ai-hint={isCompanyLogo ? "company logo" : "logo company"}
            className="object-contain"
            priority={!isCompanyLogo} // Prioritize Falcon logo, company logo might be dynamic
          />
        </div>
      )}
      {!isCompanyLogo && (
        <span className={cn('font-bold text-primary', textSize)}>
          Falcon T25
        </span>
      )}
    </div>
  );
}
