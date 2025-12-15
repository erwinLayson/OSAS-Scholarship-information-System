import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' 
    ? 'bg-green-600' 
    : type === 'error' 
    ? 'bg-red-600' 
    : type === 'warning'
    ? 'bg-yellow-600'
    : 'bg-blue-600';

  const icon = type === 'success' 
    ? '✓' 
    : type === 'error' 
    ? '✕' 
    : type === 'warning'
    ? '⚠'
    : 'ℹ';

  return (
    <div className="fixed top-5 right-5 z-[9999] animate-slideIn">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
        <span className="text-2xl font-bold">{icon}</span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
