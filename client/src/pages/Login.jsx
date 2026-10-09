import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API/fetchAPI';
import { useToast } from '../hooks/useToast';
import { setAuthRole } from '../hooks/useAuthRole';
import Toast from '../components/shared/Toast';
import { Card, Button, Input } from '../components/shared/ui';
import { LockIcon, UserIcon, EyeIcon, EyeOffIcon } from '../components/shared/Icons';
import sksuLogo from '../assets/sksu.png';
import { Navbar } from '../components/shared/components';

// Single shared login for both account types. The server decides the role
// from the credentials (/auth/login) - no role selection needed here.
const HOME_BY_ROLE = {
  student: '/student/dashboard',
  admin: '/dashboard',
};

const Login = () => {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', formData);
      const result = res.data;

      if (!result.success) {
        showToast(result.message || 'Login failed', 'error');
        return;
      }

      // Mirror the server-authoritative role into client state.
      setAuthRole(result.role);
      if (result.token) {
        try { localStorage.setItem('student_token', result.token); } catch { /* ignore */ }
      }

      showToast('Login successful! Redirecting...', 'success');
      const target = HOME_BY_ROLE[result.role] || '/login';
      setTimeout(() => navigate(target), 900);
    } catch (err) {
      console.error('Login error:', err);
      showToast(err.response?.data?.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pb-12 mt-10">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Logo */}
              <div className="text-center mb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/30">
                  <img src={sksuLogo} alt="SKSU Logo" className="w-30 h-30 object-contain" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">OSAS Portal</h1>
                <p className="text-gray-500">Sign in with your username and password</p>
              </div>

              {/* Username */}
              <Input
                label="Username"
                name="username"
                type="text"
                placeholder="Enter your username"
                icon={<UserIcon size="1.25rem" />}
                onChange={handleChange}
                value={formData.username}
                required
                disabled={loading}
              />

              {/* Password */}
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={<LockIcon size="1.25rem" />}
                rightIcon={showPassword ? <EyeOffIcon size="1.25rem" /> : <EyeIcon size="1.25rem" />}
                onRightIconClick={() => setShowPassword(!showPassword)}
                onChange={handleChange}
                value={formData.password}
                required
                disabled={loading}
              />

              {/* Remember / forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a
                  href="#"
                  className="text-sm font-medium transition-colors text-emerald-600 hover:text-emerald-700"
                >
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="primary" fullWidth loading={loading} className="!py-3">
                Sign In
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Register here
                </button>
              </p>
            </div>
          </Card>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default Login;
