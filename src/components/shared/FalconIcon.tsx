
import React from 'react';

interface FalconIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
}

export const FalconIcon: React.FC<FalconIconProps> = ({ 
  size = 28, 
  className, 
  strokeWidth = 1.5, // Default strokeWidth for this icon, can be overridden
  ...props 
}) => {
  // Ensure strokeWidth is a number for SVG attribute
  const numericStrokeWidth = typeof strokeWidth === 'string' ? parseFloat(strokeWidth) : strokeWidth;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 200 170" // Fixed viewBox to scale the paths correctly
      fill="currentColor"   // Paths are designed to be filled
      stroke="currentColor" // Used if any paths specifically rely on stroke
      strokeWidth={numericStrokeWidth}
      className={className}
      {...props}
    >
      {/* Head and Beak part */}
      <path d="M158.6,47.2c-1.5-1.5-3.5-2.4-5.7-2.4c-2.8,0-5.4,1.4-7.4,3.8c-2.1,2.6-3.1,5.7-2.9,8.8c0.3,3.8,2.3,7.3,5.5,9.8 c1.2,0.9,2.6,1.4,4.1,1.4c1.2,0,2.3-0.3,3.4-0.9c3.1-1.7,5.1-4.9,5.1-8.5C160.7,51.1,160.1,49,158.6,47.2z M153.2,59.3 c-1.6,0-3.1-0.6-4.2-1.8c-2.2-2.2-3.6-5.1-3.8-8.1c-0.1-2.1,0.6-4.2,2.1-6.1c1.4-1.7,3.1-2.6,5-2.6c1.4,0,2.8,0.6,3.8,1.6 c0.9,0.9,1.3,2.1,1.3,3.5c0,2.8-1.5,5.3-3.8,6.7C154.9,58.9,154.1,59.3,153.2,59.3z"/>
      <path d="M147.3,42.9L147.3,42.9c-2.3-3.9-6.9-5.9-11.3-4.9c-4.9,1.1-8.2,5.5-8.2,10.5v1.7c0,0.8-0.7,1.5-1.5,1.5s-1.5-0.7-1.5-1.5 V48c0-6.1,3.3-11.6,8.9-13.9c1.3-0.5,2.6-0.8,3.9-0.8c3.6,0,7,1.5,9.5,4.1l0,0c1.6,1.7,3.6,2.6,5.6,2.6h2.9 c2.5,0,4.5-2,4.5-4.5s-2-4.5-4.5-4.5h-1.4c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5h1.4c4.1,0,7.5,3.4,7.5,7.5 s-3.4,7.5-7.5,7.5h-2.9C152.4,46.3,149.6,45.1,147.3,42.9z"/>
      {/* Wings */}
      <path d="M125.3,52.2C100.8,62.7,71.7,91.3,56.3,136.9c2.6-12.1,10.1-24.7,21.1-35.3C92.8,87.1,112.7,71.8,125.3,52.2z"/>
      <path d="M130.1,59.7c-22.5,12.1-49.8,38.9-66.1,80.8c5.8-12.1,15.2-24.2,27.8-33.9C109.6,93.7,124.9,76.9,130.1,59.7z"/>
      <path d="M135.2,67.4c-18.2,12.9-40.9,36.5-56.8,72.6c7.8-9.6,18.3-19.7,31.3-27.1C125.7,102.2,133.7,84.6,135.2,67.4z"/>
    </svg>
  );
};
