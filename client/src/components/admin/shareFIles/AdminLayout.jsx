import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../API/fetchAPI';
import { useToast } from '../../../hooks/useToast';
import Toast from '../../shared/Toast';

const AdminLayout = ({ children, activeMenu, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'students', name: 'Students', icon: '👨‍🎓', path: '/admin/students' },
    { id: 'scholarships', name: 'Scholarships', icon: '💰', path: '/admin/scholarships' },
    { id: 'applications', name: 'Student Applications', icon: '📋', path: '/admin/applications' },
    { id: 'scholarship_applications', name: 'Scholarship Applications', icon: '🗂️', path: '/admin/scholarships/applications' },
    { id: 'reports', name: 'Reports', icon: '📈', path: '/admin/reports' },
    { id: 'settings', name: 'Settings', icon: '⚙️', path: '/admin/settings' },
  ];

  const handleMenuClick = (item) => {
    navigate(item.path);
  };

  const handleLogout = async () => {
    try {
      const res = await API.get('/admin/logout');
      if (res.data.success) {
        showToast(res.data.message, "success");
        setTimeout(() => {
          navigate('/login')
        }, 1500);
        return;
      }

      showToast(res.data.message || "Logout failed", "error");
    } catch (err) {
      console.log(err);
      showToast("An error occurred during logout", "error");
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-emerald-800">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-green-900 border-r border-green-700 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-50`}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-green-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-bold text-green-50">OSAS System</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-green-800 text-green-300 transition-colors"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeMenu === item.id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'text-green-200 hover:bg-green-800 hover:text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="absolute bottom-0 w-full p-4 border-t border-green-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-green-50">Admin User</p>
                <p className="text-xs text-green-300">admin@osas.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-green-900/50 backdrop-blur-sm border-b border-green-700 sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-2xl font-bold text-green-50">{title}</h2>
              {subtitle && <p className="text-green-300 text-sm">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors font-medium">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default AdminLayout;
