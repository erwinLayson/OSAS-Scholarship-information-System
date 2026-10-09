import { useState, useEffect } from 'react';
import API from "../../API/fetchAPI";
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/shared/Toast';
import { NavLink } from 'react-router-dom';
import { Card, Button, Input } from '../../components/shared/ui';
import { UserIcon, MailIcon, BookIcon, PlusIcon, CloseIcon } from '../../components/shared/Icons';
import sksuLogo from '../../assets/sksu.png';
import {Navbar} from "../../components/shared/components"

const ApplicantRegister = () => {
  const { toasts, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    subjects: '',
  });
  const [subjectInput, setSubjectInput] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [unitInput, setUnitInput] = useState('');
  const [subjectList, setSubjectList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Check maintenance mode on mount
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await API.get('/settings/maintenance_mode');
        if (res.data && res.data.success) {
          setMaintenanceMode(res.data.value);
        }
      } catch (err) {
        console.error('Failed to check maintenance mode:', err);
      }
    };
    checkMaintenance();
  }, []);

  const handleGradeInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setGradeInput('');
      return;
    }
    if (!/^\d+(\.\d{0,2})?$/.test(val)) {
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num > 5) {
      showToast('Grade cannot be greater than 5.0', 'error');
      return;
    }
    setGradeInput(val);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubject = () => {
    if (subjectInput.trim() === '' || gradeInput.trim() === '' || unitInput.trim() === '') return;

    const raw = gradeInput.trim();
    if (!/^\d+(\.\d{0,2})?$/.test(raw)) {
      showToast('Please enter a valid grade (up to two decimal places, e.g. 1.00, 2.50)', 'error');
      return;
    }
    const num = parseFloat(raw);
    if (num > 5) {
      showToast('Grade cannot be greater than 5.0', 'error');
      return;
    }

    const gradeFormatted = num.toFixed(2);

    setSubjectList(prev => [...prev, { subject: subjectInput.trim(), grade: gradeFormatted, unit: unitInput.trim() }]);
    setSubjectInput('');
    setGradeInput('');
    setUnitInput('');
  };

  const handleRemoveSubject = (index) => {
    setSubjectList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = (formData.email || '').trim();
    const sksuRegex = /^[\w.+-]+@sksu\.edu\.ph$/i;
    if (!sksuRegex.test(email)) {
      showToast('Only sksu.edu.ph email addresses are allowed', 'error');
      return;
    }

    const registrationData = {
      ...formData,
      email,
      subjects: subjectList
    };

    setLoading(true);
    try {
      const res = await API.post('/applicants/register', registrationData);
      if (!res.data.success) {
        showToast(res.data.message, "error");
        return;
      }

      showToast(res.data.message, "success");
      e.target.reset();
      setSubjectList([]);
      setFormData({
        studentName: '',
        email: '',
        subjects: '',
      });
    } catch (err) {
      console.log(err);
      showToast("Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/*Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12 mt-10">
        <div className="w-full max-w-5xl">

          {/* Two-panel layout: 75% form / 25% subjects preview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Left Panel — Registration Form (75%) */}
            <div className="lg:col-span-3">
              <Card className="shadow-xl">
            {maintenanceMode && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-amber-800 font-semibold">System Under Maintenance</h3>
                    <p className="text-amber-700 text-sm">Registration is temporarily disabled. Please try again later.</p>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Logo above card */}
              <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/30">
                  <img src={sksuLogo} alt="SKSU Logo" className="w-20 h-20 object-contain" /> 
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Registration</h1>
                <p className="text-gray-500">Register for OSAS Scholarship System</p>
              </div>

              {/* Student Name */}
              <Input
                label="Student Name"
                name="studentName"
                type="text"
                placeholder="Enter your full name"
                icon={<UserIcon size="1.25rem" />}
                value={formData.studentName}
                onChange={handleChange}
                required
                disabled={loading || maintenanceMode}
              />

              {/* Email Address */}
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="student@sksu.edu.ph"
                icon={<MailIcon size="1.25rem" />}
                value={formData.email}
                onChange={handleChange}
                hint="Only SKSU email addresses are allowed"
                required
                disabled={loading || maintenanceMode}
              />

              {/* Subjects */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subjects, Grades & Units <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 flex-col md:flex-row">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <BookIcon size="1.25rem" />
                    </div>
                    <input
                      type="text"
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                      className="w-full pl-11 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                      placeholder="Subject name"
                      disabled={loading || maintenanceMode}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={gradeInput}
                      onChange={handleGradeInputChange}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                      className="w-24 px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                      placeholder="Grade"
                      disabled={loading || maintenanceMode}
                    />
                    <input
                      type="text"
                      value={unitInput}
                      onChange={e => setUnitInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                      className="w-20 px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                      placeholder="Units"
                      disabled={loading || maintenanceMode}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleAddSubject}
                    icon={<PlusIcon size="1rem" />}
                    disabled={loading || maintenanceMode}
                  >
                    Add
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">Enter subject name, grade, and units, then click "Add"</p>

              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-1 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  required
                  disabled={loading || maintenanceMode}
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                    Terms and Conditions
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={maintenanceMode}
                className="!py-3"
              >
                {maintenanceMode ? 'Registration Disabled' : 'Register'}
              </Button>
            </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <NavLink to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Login here
                  </NavLink>
                </p>
              </div>
            </Card>
            </div>

            {/* Right Panel — Added Subjects Preview (25%) */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl sticky top-24">
                <div className="flex items-center gap-2 mb-5">
                  <BookIcon size="1.25rem" className="text-emerald-600" />
                  <h2 className="font-semibold text-gray-800">Your Subjects</h2>
                </div>

                {subjectList.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookIcon size="1.5rem" className="text-emerald-400" />
                    </div>
                    <p className="text-sm text-gray-500">No subjects added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add subjects from the form</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subjectList.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{item.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-lg">{item.grade}</span>
                            <span className="text-xs text-gray-500">{item.unit} unit{item.unit === '1' ? '' : 's'}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          disabled={loading || maintenanceMode}
                        >
                          <CloseIcon size="1rem" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {subjectList.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total Subjects</span>
                      <span className="font-bold text-emerald-600">{subjectList.length}</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
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

export default ApplicantRegister;
