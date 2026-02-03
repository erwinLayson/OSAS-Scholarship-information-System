import React from 'react';

/**
 * Card Component
 * Versatile card container with optional hover effects
 * 
 * @param {string} title - Optional card title
 * @param {string} subtitle - Optional card subtitle
 * @param {React.ReactNode} children - Card content
 * @param {React.ReactNode} headerAction - Optional action element in header
 * @param {boolean} hoverable - Enable hover lift effect
 * @param {boolean} noPadding - Remove padding from body
 * @param {string} className - Additional CSS classes
 */
const Card = ({ 
  title = '',
  subtitle = '',
  children,
  headerAction = null,
  hoverable = false,
  noPadding = false,
  className = '' 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${hoverable ? 'hover:shadow-md hover:-translate-y-1 transition-all duration-200' : ''}
        ${className}
      `}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default Card;
