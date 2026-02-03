import React from 'react';

/**
 * StatCard Component
 * Displays a statistic with icon, title, value, and optional trend indicator
 * 
 * @param {string} title - The label for the stat
 * @param {string|number} value - The main value to display
 * @param {React.ReactNode} icon - Icon component to display
 * @param {string} color - Color variant: 'emerald', 'blue', 'purple', 'amber', 'red'
 * @param {string} trend - Trend direction: 'up', 'down', or null
 * @param {string} trendValue - The trend percentage/value to show
 * @param {string} className - Additional CSS classes
 */
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'emerald', 
  trend = null, 
  trendValue = '',
  className = '' 
}) => {
  const colorClasses = {
    emerald: 'border-l-emerald-500 bg-emerald-50/50',
    blue: 'border-l-blue-500 bg-blue-50/50',
    purple: 'border-l-purple-500 bg-purple-50/50',
    amber: 'border-l-amber-500 bg-amber-50/50',
    red: 'border-l-red-500 bg-red-50/50',
  };

  const iconBgClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
  };

  const trendClasses = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-red-600 bg-red-50',
  };

  return (
    <div 
      className={`
        bg-white rounded-xl border-l-4 ${colorClasses[color]} 
        p-5 shadow-sm hover:shadow-md transition-all duration-200 
        hover:-translate-y-1 ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendClasses[trend]}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
