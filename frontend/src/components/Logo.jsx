import React from 'react';

/**
 * Smart Health Welfare Foundation Official Logo (Vector SVG)
 * Matches Image 2 provided by user:
 * - Heart outline
 * - Green caregiver human figure with orange head/sun
 * - ECG heartbeat waveform line in orange & blue
 * - Typography: "Smart" (Blue) + "Health" (Green) + "WELFARE FOUNDATION" (Orange)
 */
export default function Logo({ size = "default", showText = true, className = "" }) {
  const isLarge = size === "large";
  const iconDimensions = isLarge ? "w-16 h-16" : "w-12 h-12";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Vector Heart & Health Symbol */}
      <svg
        viewBox="0 0 120 120"
        className={`${iconDimensions} flex-shrink-0 transition-transform duration-300 hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Heart Outline (Navy Blue) */}
        <path
          d="M60 102 C15 72 6 48 6 30 A24 24 0 0 1 54 18 L60 25 L66 18 A24 24 0 0 1 114 30 C114 48 105 72 60 102 Z"
          stroke="#002868"
          strokeWidth="3.5"
          fill="#ffffff"
          strokeLinejoin="round"
        />

        {/* Orange Head / Sun */}
        <circle cx="60" cy="38" r="10" fill="#f37021" />

        {/* Caregiver Green V-Figure (Arms reaching up in care) */}
        <path
          d="M40 38 L60 82 L80 38 L68 46 L60 62 L52 46 Z"
          fill="#008037"
        />

        {/* ECG Heartbeat Line in Orange */}
        <path
          d="M80 62 L88 62 L94 48 L100 76 L106 62 L116 62"
          stroke="#f37021"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center tracking-tight">
            <span className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-black text-shwf-navy`}>
              Smart
            </span>
            <span className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-black text-shwf-green ml-1.5`}>
              Health
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-extrabold text-shwf-orange tracking-[0.2em] uppercase mt-0.5">
            WELFARE FOUNDATION
          </span>
        </div>
      )}
    </div>
  );
}
