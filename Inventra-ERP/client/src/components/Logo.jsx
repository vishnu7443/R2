import React from "react";

function Logo({ className = "w-8 h-8" }) {
  return (
    <svg
      className={`${className} animate-float`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer rotating dashed ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke="url(#logo-grad)" 
        strokeWidth="1.5" 
        strokeDasharray="6 14" 
        className="animate-spin" 
        style={{ transformOrigin: 'center', animationDuration: '24s' }} 
      />
      
      {/* Outer abstract cube framework */}
      <path
        d="M50 15 L80 32 L80 68 L50 85 L20 68 L20 32 Z"
        stroke="url(#logo-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      
      {/* Inner segment lines */}
      <path
        d="M50 15 L50 50 M50 50 L80 32 M50 50 L20 32"
        stroke="url(#logo-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      
      {/* Central floating energy capsule */}
      <rect 
        x="46" 
        y="42" 
        width="8" 
        height="22" 
        rx="4" 
        fill="url(#logo-grad)" 
      />
      
      <circle 
        cx="50" 
        cy="34" 
        r="3" 
        fill="#ffffff" 
        className="animate-pulse"
      />
    </svg>
  );
}

export default Logo;
