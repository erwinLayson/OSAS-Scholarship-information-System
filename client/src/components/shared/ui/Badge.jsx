import React from 'react';

/**
 * Badge Component
 * Displays a status badge with various color variants
 * 
 * @param {string} variant - Color variant: 'success', 'warning', 'error', 'info', 'neutral'
 * @param {React.ReactNode} children - Badge content
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
const Badge = ({ 
  variant = 'neutral', 
  children, 
  size = 'md',
  className = '' 
}) => {
  const variantClasses = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
