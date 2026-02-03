import { useState } from 'react';
import API from "../../API/fetchAPI";
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { NavLink } from 'react-router-dom';
import { Card, Button, Input } from '../shared/ui';
import { UserIcon, MailIcon, BookIcon, PlusIcon, CloseIcon } from '../shared/Icons';
import sksuLogo from '../../assets/sksu.png';
import {Navbar} from "../shared/components"

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
        <div className="w-full max-w-2xl">
          

          {/* Registration Card */}
          <Card className="shadow-xl">
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
                disabled={loading}
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
                disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                    <input
                      type="text"
                      value={unitInput}
                      onChange={e => setUnitInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                      className="w-20 px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                      placeholder="Units"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleAddSubject}
                    icon={<PlusIcon size="1rem" />}
                    disabled={loading}
                  >
                    Add
                  </Button>
                </div>
                <p className="mt-2 text-sm text-gray-500">Enter subject name, grade, and units, then click "Add"</p>

                {/* Display Added Subjects */}
                {subjectList.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Added Subjects:</p>
                    <div className="flex flex-wrap gap-2">
                      {subjectList.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-2 rounded-xl border border-emerald-200"
                        >
                          <span className="font-medium">{item.subject}</span>
                          <span className="text-sm bg-emerald-600 text-white px-2 py-0.5 rounded-lg">{item.grade}</span>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg">{item.unit} unit{item.unit === '1' ? '' : 's'}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(index)}
                            className="text-emerald-600 hover:text-red-500 transition-colors ml-1"
                            disabled={loading}
                          >
                            <CloseIcon size="1rem" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 mt-1 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                  required
                  disabled={loading}
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
                className="!py-3"
              >
                Register
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <NavLink to="/student/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Login here
                </NavLink>
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

export default ApplicantRegister;
