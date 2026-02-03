import React from 'react';

const IconWrapper = ({ children, className = '', title, size = '1.5rem', ...props }) => (
  <span
    className={className}
    style={{ width: size, height: size, display: 'inline-block' }}
    aria-hidden={!title}
    role={title ? 'img' : undefined}
    title={title}
    {...props}
  >
    {children}
  </span>
);

export const CloseIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Close" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </IconWrapper>
);

export const SuccessIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Success" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
    </svg>
  </IconWrapper>
);

export const ErrorIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Error" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
    </svg>
  </IconWrapper>
);

export const WarningIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Warning" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
    </svg>
  </IconWrapper>
);

export const InfoIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Info" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8h.01M11 12h1v4h1" />
    </svg>
  </IconWrapper>
);

export const BookIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Book" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 4h14v16H3z" />
    </svg>
  </IconWrapper>
);

export const ChartIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Chart" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 13v6M12 9v10M17 5v14" />
    </svg>
  </IconWrapper>
);

export const MoneyIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Money" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <rect x="2" y="7" width="20" height="10" rx="2" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 10v4" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  </IconWrapper>
);

export const ClipboardIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Clipboard" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 2h6v4H9z" />
      <rect x="3" y="6" width="18" height="14" rx="2" strokeWidth="2" />
    </svg>
  </IconWrapper>
);

export const HourglassIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Hourglass" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 2h12M6 22h12M8 6h8M8 18h8" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 6c2 2 4 2 8 0M8 18c2-2 4-2 8 0" />
    </svg>
  </IconWrapper>
);

export const UserIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="User" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 20a6 6 0 0112 0" />
    </svg>
  </IconWrapper>
);

export const PeopleIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="People" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-3-3.87M7 21v-2a4 4 0 013-3.87" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  </IconWrapper>
);

export const ArrowRightIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Arrow Right" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  </IconWrapper>
);

export const PlusIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Add" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16" />
    </svg>
  </IconWrapper>
);

export const LockIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Lock" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  </IconWrapper>
);

export const BellIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Bell" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  </IconWrapper>
);

// ============================================
// New Icons for Modern UI Redesign
// ============================================

export const ShieldIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Shield" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  </IconWrapper>
);

export const ClockIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Clock" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  </IconWrapper>
);

export const UsersIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Users" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  </IconWrapper>
);

export const CheckCircleIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Check Circle" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 4L12 14.01l-3-3" />
    </svg>
  </IconWrapper>
);

export const XCircleIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="X Circle" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
    </svg>
  </IconWrapper>
);

export const AlertCircleIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Alert Circle" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01" />
    </svg>
  </IconWrapper>
);

export const ChevronDownIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Chevron Down" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  </IconWrapper>
);

export const ChevronUpIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Chevron Up" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
    </svg>
  </IconWrapper>
);

export const ChevronRightIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Chevron Right" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  </IconWrapper>
);

export const ChevronLeftIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Chevron Left" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  </IconWrapper>
);

export const FileTextIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="File Text" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  </IconWrapper>
);

export const AwardIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Award" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <circle cx="12" cy="8" r="6" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  </IconWrapper>
);

export const TrendingUpIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Trending Up" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M23 6l-9.5 9.5-5-5L1 18" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 6h6v6" />
    </svg>
  </IconWrapper>
);

export const GraduationCapIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Graduation Cap" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 10l-10-5-10 5 10 5 10-5z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 10v6" />
    </svg>
  </IconWrapper>
);

export const MailIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Mail" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6" />
    </svg>
  </IconWrapper>
);

export const PhoneIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Phone" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  </IconWrapper>
);

export const MapPinIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Map Pin" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" strokeWidth="2" />
    </svg>
  </IconWrapper>
);

export const FacebookIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Facebook" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  </IconWrapper>
);

export const TwitterIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Twitter" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  </IconWrapper>
);

export const LinkedInIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="LinkedIn" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" strokeWidth="2" />
      <circle cx="4" cy="4" r="2" strokeWidth="2" />
    </svg>
  </IconWrapper>
);

export const InstagramIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Instagram" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17.5 6.5h.01" />
    </svg>
  </IconWrapper>
);

export const SearchIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Search" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <circle cx="11" cy="11" r="8" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  </IconWrapper>
);

export const SettingsIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Settings" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  </IconWrapper>
);

export const LogOutIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Log Out" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  </IconWrapper>
);

export const HomeIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Home" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
    </svg>
  </IconWrapper>
);

export const GridIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Grid" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
    </svg>
  </IconWrapper>
);

export const MenuIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Menu" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  </IconWrapper>
);

export const EditIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Edit" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  </IconWrapper>
);

export const TrashIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Trash" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
    </svg>
  </IconWrapper>
);

export const EyeIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="View" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
    </svg>
  </IconWrapper>
);

export const EyeOffIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Hide" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1 1l22 22" />
    </svg>
  </IconWrapper>
);

export const DownloadIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Download" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5M12 15V3" />
    </svg>
  </IconWrapper>
);

export const CalendarIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Calendar" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  </IconWrapper>
);

export const StarIcon = ({ className = '', size }) => (
  <IconWrapper className={className} title="Star" size={size}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  </IconWrapper>
);

export default IconWrapper;
