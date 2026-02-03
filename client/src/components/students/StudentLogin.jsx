import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { Card, Button, Input } from '../shared/ui';
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from '../shared/Icons';
import sksuLogo from '../../assets/sksu.png';
import { Navbar } from '../shared/components';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/students/login', formData);
      const result = response.data;

      if (!result.success) {
        showToast(result.message, 'error');
        return;
      }

      // store token if returned (fallback for requests where cookies may not be included)
      if (result.token) {
        try { localStorage.setItem('student_token', result.token); } catch (e) { /* ignore */ }
      }

      showToast(result.message, 'success');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.response?.data?.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12 mt-10">
        <div className="w-full max-w-md">
          

          {/* Login Card */}
          <Card className="shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Logo above card */}
              <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/30">
                  <img src={sksuLogo} alt="SKSU Logo" className="w-30 h-30 object-contain" /> 
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Login</h1>
                <p className="text-gray-500">Access your OSAS scholarship account</p>
              </div>

              {/* Username Input */}
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

              {/* Password Input */}
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon={<LockIcon size="1.25rem" />}
                rightIcon={showPassword ? <EyeOffIcon size="1.25rem" /> : <EyeIcon size="1.25rem" />}
                onRightIconClick={() => setShowPassword(!showPassword)}
                onChange={handleChange}
                value={formData.password}
                required
                disabled={loading}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                className="!py-3"
              >
                Sign In
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
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

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
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

export default StudentLogin;
