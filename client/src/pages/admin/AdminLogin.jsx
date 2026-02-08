import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/shared/Toast';
import { Card, Button, Input } from '../../components/shared/ui';
import { LockIcon, UserIcon, EyeIcon, EyeOffIcon } from '../../components/shared/Icons';
import sksuLogo from '../../assets/sksu.png';
import { Navbar } from '../../components/shared/components';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [adminLoginData, setAdminLoginData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFill = Object.keys(adminLoginData).every(key => (
      adminLoginData[key] !== "" && adminLoginData[key] !== null && adminLoginData[key] !== undefined
    ));

    if (!isFill) {
      showToast("Please fill all fields", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/admin/login', adminLoginData);
      const result = res.data;
      if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      showToast("Login successful! Redirecting...", "success");
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
  
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar*/}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12 mt-10">
        <div className="w-full max-w-md">
          
          {/* Login Card */}
          <Card className="shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Logo above card */}
              <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-slate-500/30">
                  <img src={sksuLogo} alt="SKSU Logo" className="w-30 h-30 object-contain" /> 
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
                <p className="text-gray-500">Sign in to access the admin dashboard</p>
              </div>

              {/* Username Input */}
              <Input
                label="Username"
                name="username"
                type="text"
                placeholder="Enter your username"
                icon={<UserIcon size="1.25rem" />}
                onChange={handleInputChange}
                value={adminLoginData.username}
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
                onChange={handleInputChange}
                value={adminLoginData.password}
                required
                disabled={loading}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-slate-600 bg-white border-gray-300 rounded focus:ring-slate-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                className="!bg-slate-700 hover:!bg-slate-800 !py-3"
              >
                Sign In
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Need help?{' '}
                <a href="#" className="font-medium text-slate-600 hover:text-slate-800 transition-colors">
                  Contact Support
                </a>
              </p>
            </div>
          </Card>
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

export default AdminLogin;
