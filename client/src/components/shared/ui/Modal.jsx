import React, { useEffect } from 'react';

/**
 * Modal Component
 * Reusable modal dialog with backdrop, header, body, and footer
 * 
 * @param {boolean} isOpen - Control modal visibility
 * @param {function} onClose - Callback when modal should close
 * @param {string} title - Modal title
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {React.ReactNode} children - Modal body content
 * @param {React.ReactNode} footer - Optional footer content
 * @param {boolean} closeOnBackdrop - Close when clicking backdrop
 * @param {boolean} showCloseButton - Show X button in header
 */
const Modal = ({ 
  isOpen = false,
  onClose,
  title = '',
  size = 'md',
  children,
  footer = null,
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className={`
          relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]}
          max-h-[90vh] flex flex-col animate-scaleIn
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
