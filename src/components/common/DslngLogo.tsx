import React from 'react';

interface DslngLogoProps {
  className?: string;
  variant?: 'full' | 'icon-only' | 'horizontal' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const DslngLogo: React.FC<DslngLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
  };

  const isWhite = variant === 'white';
  const textColor = isWhite ? '#FFFFFF' : '#004780';
  const subtextColor = isWhite ? '#E2E8F0' : '#58595B';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* Exact Donggi Senoro LNG Text (Icon removed as requested) */}
      <svg
        viewBox="0 0 590 155"
        className={`${sizeMap[size]} w-auto drop-shadow-xs flex-shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Text: DONGGI SENORO */}
        <text
          x="5"
          y="90"
          fill={textColor}
          fontSize="66"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Arial Black', sans-serif"
          letterSpacing="-0.5px"
        >
          DONGGI SENORO
        </text>

        {/* Subtext: Liquefied Natural Gas */}
        <text
          x="230"
          y="142"
          fill={subtextColor}
          fontSize="35"
          fontWeight="500"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif"
          letterSpacing="0.2px"
        >
          Liquefied Natural Gas
        </text>
      </svg>
    </div>
  );
};


