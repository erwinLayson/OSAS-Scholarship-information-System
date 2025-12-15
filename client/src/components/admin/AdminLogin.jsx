import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [adminLoginData, setAdminLoginData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAdminLoginData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFill = Object.keys(adminLoginData).every(key => (
      adminLoginData[key] !== "" && adminLoginData[key] !== null && adminLoginData[key] !== undefined
    ));


    if (!isFill) {
      showToast("Please fill all fields", "warning");
      return;
    }

    try {
      const res = await API.post('/admin/login', adminLoginData);
      const result = res.data;
      if (!result.success) {
        showToast(result.message, "error");
        return;
      }

      showToast("Login successful! Redirecting...", "success");
      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
  
    } catch (err) {
      console.log(err);
      showToast('Login failed. Please try again.', "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 via-green-700 to-emerald-800">
      <div className="w-full max-w-md p-8">
        {/* Login Card */}
        <div className="bg-green-900 rounded-2xl shadow-2xl p-8 border border-green-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/50">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-green-50 mb-2">Admin Login</h2>
            <p className="text-green-200">Welcome back! Please login to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-green-100 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  name='username'
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 placeholder-green-400"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-green-100 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 placeholder-green-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-300 hover:text-green-100"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-400 bg-green-800 border-green-600 rounded focus:ring-green-400"
                />
                <span className="ml-2 text-sm text-green-200">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-green-300 hover:text-green-100 transition duration-200">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-green-900 transform transition duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/30"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-green-200">
              Are you a student?{' '}
              <button
                onClick={() => navigate('/student/login')}
                className="font-medium text-green-300 hover:text-green-100 transition duration-200 underline"
              >
                Student Login Portal
              </button>
            </p>
            <p className="text-sm text-green-200">
              Need help?{' '}
              <a href="#" className="font-medium text-green-300 hover:text-green-100 transition duration-200">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-green-300">
            © 2025 OSAS System. All rights reserved.
          </p>
        </div>
      </div>

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

export default AdminLogin;
