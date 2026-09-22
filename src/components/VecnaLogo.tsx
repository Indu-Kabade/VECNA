import React from 'react';

interface VecnaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showBackground?: boolean;
  animateOrbit?: boolean;
}

export const VecnaLogo: React.FC<VecnaLogoProps> = ({
  className = '',
  size = 'md',
  showBackground = true,
  animateOrbit = false,
}) => {
  const pixelSize = 
    typeof size === 'number' 
      ? size 
      : size === 'xs' 
      ? 24 
      : size === 'sm' 
      ? 32 
      : size === 'md' 
      ? 40 
      : size === 'lg' 
      ? 56 
      : 80;

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        className="w-full h-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dark Spruce/Forest Background */}
        {showBackground && (
          <rect width="512" height="512" rx="120" fill="#0D1D17" />
        )}

        {/* Orbit Group (Optionally animated) */}
        <g className={animateOrbit ? 'origin-center animate-[spin_20s_linear_infinite]' : ''}>
          {/* Top Orbit Arc */}
          <path
            d="M 165 142 A 170 170 0 0 1 328 132"
            stroke="#6ED08B"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Top Orbit Planet Dot */}
          <circle cx="338" cy="134" r="14" fill="#6ED08B" />

          {/* Bottom Orbit Arc */}
          <path
            d="M 347 370 A 170 170 0 0 1 184 380"
            stroke="#6ED08B"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Bottom Orbit Planet Dot */}
          <circle cx="174" cy="378" r="14" fill="#6ED08B" />
        </g>

        {/* Central V Ribbon Group */}
        <g id="vecna-symbol">
          {/* Left White Wing / Arm */}
          <path
            d="M 116 168 
               C 116 168 184 168 190 170 
               C 198 174 204 182 208 192
               L 248 336 
               C 254 358 244 374 226 374 
               C 214 374 204 364 198 350 
               L 122 186 
               C 116 174 116 168 116 168 Z"
            fill="#F6FBF6"
          />

          {/* Bottom Ribbon Fold connecting Left arm and Leaf */}
          <path
            d="M 198 348
               C 208 368 226 380 248 376 
               C 272 372 288 354 294 336
               C 278 352 260 362 242 362
               C 226 362 212 354 206 342 Z"
            fill="#E2EFE3"
          />

          {/* Right Leaf Wing */}
          <path
            d="M 234 374
               C 268 374 315 340 348 290
               C 382 238 398 182 398 146
               C 360 166 312 206 278 260
               C 250 304 234 352 234 374 Z"
            fill="#52B877"
          />

          {/* Leaf Organic Inner Vein */}
          <path
            d="M 397 148 
               C 372 212 320 288 238 372"
            stroke="#123F25"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
};
