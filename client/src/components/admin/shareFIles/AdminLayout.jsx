import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../API/fetchAPI';
import { useToast } from '../../../hooks/useToast';
import Toast from '../../shared/Toast';
import { 
  ChartIcon, 
  PeopleIcon, 
  MoneyIcon, 
  ClipboardIcon, 
  ArrowRightIcon, 
  InfoIcon,
  HomeIcon,
  FileTextIcon,
  SettingsIcon,
  LogOutIcon,
  GraduationCapIcon
} from '../../shared/Icons';

const AdminLayout = ({ children, activeMenu, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <HomeIcon size="1.25rem" />, path: '/dashboard' },
    { id: 'students', name: 'Students', icon: <PeopleIcon size="1.25rem" />, path: '/admin/students' },
    { id: 'scholarships', name: 'Scholarships', icon: <MoneyIcon size="1.25rem" />, path: '/admin/scholarships' },
    { id: 'applications', name: 'Student Applications', icon: <ClipboardIcon size="1.25rem" />, path: '/admin/applications' },
    { id: 'scholarship_applications', name: 'Scholarship Applications', icon: <FileTextIcon size="1.25rem" />, path: '/admin/scholarships/applications' },
    { id: 'reports', name: 'Reports', icon: <ChartIcon size="1.25rem" />, path: '/admin/reports' },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon size="1.25rem" />, path: '/admin/settings' },
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
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
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
                  <GraduationCapIcon className="text-emerald-600" size="1.25rem" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">OSAS Admin</h1>
                  <p className="text-xs text-gray-500">Management Portal</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Toggle sidebar"
            >
              <ArrowRightIcon className={`transform transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} size="1.25rem" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeMenu === item.id
                  ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className={activeMenu === item.id ? 'text-emerald-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@osas.com</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`
              w-full mt-3 flex items-center justify-center gap-2 
              bg-red-50 hover:bg-red-100 text-red-600 
              px-4 py-2.5 rounded-xl transition-colors text-sm font-medium
            `}
          >
            <LogOutIcon size="1rem" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminLayout;
