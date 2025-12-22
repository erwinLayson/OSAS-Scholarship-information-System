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

export default IconWrapper;
