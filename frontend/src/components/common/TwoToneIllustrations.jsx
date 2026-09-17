import React from 'react';

/**
 * Skill India Digital Flat Two-Tone Vector Illustrations
 * Colors: Deep Navy (#0B3D6B) + Sovereign Orange (#D2691E) + Muted Slate (#EEF2F6 / #CBD5E1)
 */

export const RoleCandidateIllustration = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft background shape */}
    <rect x="6" y="6" width="68" height="68" rx="16" fill="#EEF2F6" />
    <circle cx="60" cy="20" r="12" fill="#D2691E" fillOpacity="0.15" />
    
    {/* Candidate Figure */}
    {/* Shoulders / Torso */}
    <path
      d="M20 62C20 52 28 47 40 47C52 47 60 52 60 62"
      stroke="#0B3D6B"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M26 62C26 55 32 50 40 50C48 50 54 55 54 62"
      fill="#0B3D6B"
      fillOpacity="0.12"
    />

    {/* Candidate Head */}
    <circle cx="40" cy="31" r="11" fill="#FFFFFF" stroke="#0B3D6B" strokeWidth="3.5" />

    {/* Technical Cap / Visor Accent */}
    <path
      d="M29 27C30 20 50 20 51 27L56 28C56 28 50 24 40 24C30 24 24 28 24 28L29 27Z"
      fill="#D2691E"
    />
    <path
      d="M29 27L51 27"
      stroke="#D2691E"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Verified Certificate Star badge floating on right */}
    <circle cx="58" cy="22" r="9" fill="#D2691E" />
    <path
      d="M58 17.5L59.2 20.3L62.2 20.6L59.9 22.5L60.6 25.5L58 23.9L55.4 25.5L56.1 22.5L53.8 20.6L56.8 20.3L58 17.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const RoleTrainingCenterIllustration = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft background shape */}
    <rect x="6" y="6" width="68" height="68" rx="16" fill="#EEF2F6" />
    <circle cx="22" cy="24" r="12" fill="#D2691E" fillOpacity="0.15" />

    {/* Institute Base & Pillars */}
    <path d="M16 60H64" stroke="#0B3D6B" strokeWidth="3.5" strokeLinecap="round" />
    <rect x="20" y="55" width="40" height="5" fill="#0B3D6B" rx="1" />

    {/* Pillars */}
    <rect x="24" y="36" width="6" height="19" rx="1" fill="#0B3D6B" />
    <rect x="37" y="36" width="6" height="19" rx="1" fill="#0B3D6B" />
    <rect x="50" y="36" width="6" height="19" rx="1" fill="#0B3D6B" />

    {/* Architrave / Pediment Roof */}
    <rect x="20" y="32" width="40" height="4" fill="#0B3D6B" rx="1" />
    <path d="M17 32L40 18L63 32H17Z" fill="#0B3D6B" />

    {/* Center Workshop Gear Badge */}
    <circle cx="40" cy="25" r="4" fill="#FFFFFF" />
    <circle cx="60" cy="50" r="11" fill="#D2691E" />
    {/* Checkmark in badge */}
    <path
      d="M56 50L59 53L65 47"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const RoleEmployerIllustration = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft background shape */}
    <rect x="6" y="6" width="68" height="68" rx="16" fill="#EEF2F6" />
    <circle cx="58" cy="22" r="12" fill="#D2691E" fillOpacity="0.15" />

    {/* Corporate/Industrial Briefcase Building */}
    <rect x="20" y="30" width="40" height="32" rx="4" fill="#FFFFFF" stroke="#0B3D6B" strokeWidth="3.5" />
    <path d="M20 42H60" stroke="#0B3D6B" strokeWidth="2.5" strokeDasharray="3 3" />
    
    {/* Handle */}
    <path
      d="M32 30V24C32 21.8 33.8 20 36 20H44C46.2 20 48 21.8 48 24V30"
      stroke="#0B3D6B"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Briefcase Center Lock */}
    <rect x="36" y="38" width="8" height="8" rx="2" fill="#0B3D6B" />

    {/* Orange Verified Talent Hiring Badge */}
    <circle cx="58" cy="26" r="10" fill="#D2691E" />
    <path
      d="M54 26L57 29L63 23"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const RoleGovernmentIllustration = ({ className = 'w-14 h-14' }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft background shape */}
    <rect x="6" y="6" width="68" height="68" rx="16" fill="#EEF2F6" />
    <circle cx="22" cy="22" r="12" fill="#D2691E" fillOpacity="0.15" />

    {/* Sovereign Audit Shield */}
    <path
      d="M40 18L58 25V39C58 50 50 58 40 62C30 58 22 50 22 39V25L40 18Z"
      fill="#FFFFFF"
      stroke="#0B3D6B"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />

    {/* Center Ashoka Sovereign Pillar Motif */}
    <rect x="37" y="32" width="6" height="18" rx="1" fill="#0B3D6B" />
    <rect x="32" y="50" width="16" height="3" rx="1" fill="#0B3D6B" />
    <circle cx="40" cy="28" r="4" fill="#0B3D6B" />

    {/* Orange Audit Tick/Star */}
    <circle cx="58" cy="24" r="8" fill="#D2691E" />
    <path
      d="M55 24L57.5 26.5L62 22"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EmptyAssessmentIllustration = ({ className = 'w-24 h-24' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft geometric backdrop */}
    <rect x="12" y="12" width="96" height="96" rx="24" fill="#EEF2F6" />
    <circle cx="88" cy="32" r="18" fill="#D2691E" fillOpacity="0.18" />

    {/* Exam Clipboard / Tablet */}
    <rect x="32" y="24" width="56" height="72" rx="6" fill="#FFFFFF" stroke="#0B3D6B" strokeWidth="3.5" />
    <rect x="46" y="18" width="28" height="8" rx="3" fill="#0B3D6B" />
    <circle cx="60" cy="22" r="2" fill="#FFFFFF" />

    {/* Evaluation Question Lines */}
    <rect x="42" y="36" width="36" height="4" rx="2" fill="#CBD5E1" />
    <rect x="42" y="46" width="28" height="4" rx="2" fill="#CBD5E1" />
    <rect x="42" y="56" width="32" height="4" rx="2" fill="#CBD5E1" />

    {/* Target & Lock Badge (Assessment Required) */}
    <circle cx="78" cy="74" r="18" fill="#FFFFFF" stroke="#D2691E" strokeWidth="3.5" />
    <circle cx="78" cy="74" r="12" fill="#D2691E" fillOpacity="0.12" />
    
    {/* Lock in Badge */}
    <rect x="73" y="73" width="10" height="8" rx="2" fill="#D2691E" />
    <path
      d="M75 73V69C75 67.3 76.3 66 78 66C79.7 66 81 67.3 81 69V73"
      stroke="#D2691E"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export const LockedCompetencyIllustration = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="10" y="10" width="80" height="80" rx="20" fill="#EEF2F6" />
    
    {/* Bar chart behind lock */}
    <rect x="25" y="58" width="8" height="18" rx="2" fill="#CBD5E1" />
    <rect x="38" y="44" width="8" height="32" rx="2" fill="#CBD5E1" />
    <rect x="51" y="34" width="8" height="42" rx="2" fill="#CBD5E1" />
    <rect x="64" y="50" width="8" height="26" rx="2" fill="#CBD5E1" />

    {/* Center Padlock */}
    <rect x="40" y="48" width="20" height="16" rx="3" fill="#D2691E" stroke="#FFFFFF" strokeWidth="2" />
    <path
      d="M44 48V42C44 38.7 46.7 36 50 36C53.3 36 56 38.7 56 42V48"
      stroke="#0B3D6B"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <circle cx="50" cy="55" r="2" fill="#FFFFFF" />
  </svg>
);
