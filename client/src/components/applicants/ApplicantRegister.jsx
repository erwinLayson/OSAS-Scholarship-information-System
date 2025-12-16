import { useState } from 'react';
import API from "../../API/fetchAPI";
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { NavLink } from 'react-router-dom';

const ApplicantRegister = () => {
  const { toasts, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    subjects: '',
  });
  const [subjectInput, setSubjectInput] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [subjectList, setSubjectList] = useState([]);

  const handleGradeInputChange = (e) => {
    const val = e.target.value;
    // Allow empty, digits and up to two decimal digits after the dot while typing
    if (val === '') {
      setGradeInput('');
      return;
    }
    if (!/^\d+(\.\d{0,2})?$/.test(val)) {
      return; // ignore invalid keystrokes
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
    if (subjectInput.trim() === '' || gradeInput.trim() === '') return;

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

    const gradeFormatted = num.toFixed(2); // ensure two decimal places like 3.00

    setSubjectList(prev => [...prev, { subject: subjectInput.trim(), grade: gradeFormatted }]);
    setSubjectInput('');
    setGradeInput('');
  };

  const handleRemoveSubject = (index) => {
    setSubjectList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const registrationData = {
      ...formData,
      subjects: subjectList
      };

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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 p-4">
      <div className="w-full max-w-2xl">
        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-600/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Registration</h2>
            <p className="text-gray-600">Register for OSAS Scholarship System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Name */}
            <div>
              <label htmlFor="studentName" className="block text-sm font-semibold text-gray-700 mb-2">
                Student Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="studentName"
                  name="studentName"
                  type="text"
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label htmlFor="subjects" className="block text-sm font-semibold text-gray-700 mb-2">
                Subjects & Grades <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <input
                    id="subjects"
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                    className="w-full pl-10 pr-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                    placeholder="Enter subject name"
                  />
                </div>
                <div className="relative w-32">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={gradeInput}
                    onChange={handleGradeInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                    className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                    placeholder="Grade"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 whitespace-nowrap"
                >
                  Add Subject
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">Enter subject name and grade, then click "Add Subject"</p>

              {/* Display Added Subjects */}
              {subjectList.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Added Subjects:</p>
                  <div className="flex flex-wrap gap-2">
                    {subjectList.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg border border-green-300"
                      >
                        <span className="font-medium">{item.subject}</span>
                        <span className="text-sm bg-green-600 text-white px-2 py-0.5 rounded">{item.grade}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(index)}
                          className="text-green-600 hover:text-red-600 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
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
                className="w-4 h-4 mt-1 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500"
                required
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium transition duration-200">
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium transition duration-200">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Register
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <NavLink to={"/student/login"} className="font-medium text-green-600 hover:text-green-700 transition duration-200">
                Login here
              </NavLink>
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

export default ApplicantRegister;
