import React from 'react';

interface CookieLogoProps {
  size?: number;
  className?: string;
}

export const CookieLogo: React.FC<CookieLogoProps> = ({ size = 44, className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[2px_2px_0px_#3D2B1F]"
      >
        {/* Outer Cookie Body with Bite Mark on Top-Right */}
        <path
          d="M32 5
             C17.088 5 5 17.088 5 32
             C5 46.912 17.088 59 32 59
             C46.912 59 59 46.912 59 32
             C59 27.2 57.7 22.7 55.4 18.8
             C53.8 20.2 51.6 21 49 21
             C44.0 21 40 17.0 40 12
             C40 9.4 40.8 7.2 42.2 5.6
             C39 5.2 35.6 5 32 5 Z"
          fill="#D97706"
          stroke="#3D2B1F"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        {/* Inner Golden Layer / Highlight */}
        <path
          d="M32 9
             C19.298 9 9 19.298 9 32
             C9 44.702 19.298 55 32 55
             C44.702 55 55 44.702 55 32
             C55 28.5 54.1 25.2 52.5 22.2
             C49.8 24.0 46.2 24.5 43.2 23.0
             C39.5 21.2 37 17.2 37 12.5
             C37 10.8 37.4 9.1 38.2 7.6
             C36.2 8.5 34.2 9 32 9 Z"
          fill="#FFB703"
        />

        {/* Bite Arc Cutouts for Realistic Cookie Bite */}
        <path
          d="M55.4 18.8 C53.8 20.2 51.6 21 49 21 C44.0 21 40 17.0 40 12 C40 9.4 40.8 7.2 42.2 5.6"
          stroke="#3D2B1F"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Chocolate Chips (Rich dark chunky pieces with highlights) */}
        {/* Chip 1 - Top Left */}
        <rect x="18" y="18" width="7" height="7" rx="2.5" fill="#3D2B1F" transform="rotate(12 18 18)" />
        <rect x="19.5" y="19.5" width="2" height="2" rx="0.5" fill="#78350F" opacity="0.8" />

        {/* Chip 2 - Center Left */}
        <rect x="16" y="33" width="8" height="8" rx="3" fill="#3D2B1F" transform="rotate(-15 16 33)" />
        <rect x="17.5" y="34.5" width="2.5" height="2.5" rx="0.5" fill="#78350F" opacity="0.8" />

        {/* Chip 3 - Center Right */}
        <rect x="33" y="24" width="8" height="8" rx="2.8" fill="#3D2B1F" transform="rotate(22 33 24)" />
        <rect x="34.5" y="25.5" width="2.5" height="2.5" rx="0.5" fill="#78350F" opacity="0.8" />

        {/* Chip 4 - Bottom Center */}
        <rect x="28" y="42" width="8" height="8" rx="3" fill="#3D2B1F" transform="rotate(-8 28 42)" />
        <rect x="29.5" y="43.5" width="2.5" height="2.5" rx="0.5" fill="#78350F" opacity="0.8" />

        {/* Chip 5 - Bottom Right */}
        <rect x="42" y="36" width="7" height="7" rx="2.5" fill="#3D2B1F" transform="rotate(35 42 36)" />

        {/* Little Cookie Crumbs Floating */}
        <circle cx="57" cy="11" r="2" fill="#3D2B1F" />
        <circle cx="60" cy="18" r="1.5" fill="#99582A" />
        <circle cx="52" cy="6" r="1.2" fill="#D97706" />
      </svg>
    </div>
  );
};
