import React from 'react';

/**
 * Input Component
 * Form input with optional icon and validation states
 * 
 * @param {string} type - Input type
 * @param {string} label - Optional label text
 * @param {React.ReactNode} icon - Optional left icon
 * @param {React.ReactNode} rightIcon - Optional right icon (e.g., password toggle)
 * @param {function} onRightIconClick - Click handler for right icon
 * @param {string} error - Error message
 * @param {string} hint - Helper text
 * @param {boolean} disabled - Disable input
 * @param {boolean} required - Show required indicator
 * @param {string} className - Additional CSS classes
 */
const Input = ({
  type = 'text',
  label = '',
  icon = null,
  rightIcon = null,
  onRightIconClick = null,
  error = '',
  hint = '',
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border bg-white
            text-gray-900 placeholder:text-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            ${icon ? 'pl-11' : ''}
            ${rightIcon ? 'pr-11' : ''}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
            }
          `}
          {...props}
        />

        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export default Input;
