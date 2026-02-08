import React from "react";

const Sidebar = ({ sidebarOpen, menuItems, activeView, studentData, onToggle, onMenuClick, onLogout }) => (
  <aside
    className={`
      fixed top-0 left-0 h-full bg-white border-r border-gray-200 
      transition-all duration-300 z-50 shadow-sm
      ${sidebarOpen ? 'w-64' : 'w-20'}
    `}
  >
    {/* Logo/Header */}
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-center justify-between">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              {/* GraduationCapIcon */}
              {menuItems[0]?.icon}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Student Portal</h1>
              <p className="text-xs text-gray-500">OSAS System</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Toggle sidebar"
        >
          {/* ArrowRightIcon */}
          {menuItems[1]?.icon}
        </button>
      </div>
    </div>
    {/* Menu Items */}
    <nav className="p-3 space-y-1">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onMenuClick(item.id)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${activeView === item.id
              ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <span className={activeView === item.id ? 'text-emerald-600' : 'text-gray-400'}>
            {item.icon}
          </span>
          {sidebarOpen && <span className="font-medium">{item.name}</span>}
        </button>
      ))}
    </nav>
    {/* Profile Section */}
    <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
          {studentData?.name?.[0]?.toUpperCase() || 'S'}
        </div>
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{studentData?.name || 'Student'}</p>
            <p className="text-xs text-gray-500 truncate">{studentData?.email || ''}</p>
          </div>
        )}
      </div>
      <button
        onClick={onLogout}
        className={`
          w-full mt-3 flex items-center justify-center gap-2 
          bg-red-50 hover:bg-red-100 text-red-600 
          px-4 py-2.5 rounded-xl transition-colors text-sm font-medium
        `}
      >
        {/* LogOutIcon */}
        {menuItems[2]?.icon}
        {sidebarOpen && <span>Logout</span>}
      </button>
    </div>
  </aside>
);

export default Sidebar;
