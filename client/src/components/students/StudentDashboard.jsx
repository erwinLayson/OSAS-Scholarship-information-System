import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [studentData, setStudentData] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', username: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);

  useEffect(() => {
    fetchScholarships();
    fetchStudentProfile();
  }, []);

  const fetchScholarships = async () => {
    try {
      const response = await API.get('/scholarships/list');
      if (response.data.success) {
        // Filter only active scholarships
        const activeScholarships = response.data.data.filter(s => s.status === 'Active');
        setScholarships(activeScholarships);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/students/profile');
      if (response.data.success) {
        setStudentData(response.data.data);
        setProfileForm({ name: response.data.data.name || '', email: response.data.data.email || '', username: response.data.data.username || '' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If authentication fails, redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast('Session expired. Please login again.', 'error');
        setTimeout(() => navigate('/student/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    if (!studentData || !studentData.subjects) return 'N/A';

    let subjects;
    try {
      subjects = typeof studentData.subjects === 'string' ? JSON.parse(studentData.subjects) : studentData.subjects;
    } catch (err) {
      // fallback: try to coerce a JSON-like string
      try {
        const cleaned = String(studentData.subjects).replace(/([\w\d]+)\s*:/g, '"$1":');
        subjects = JSON.parse(cleaned);
      } catch (err2) {
        return 'N/A';
      }
    }

    if (!Array.isArray(subjects) || subjects.length === 0) return 'N/A';

    const total = subjects.reduce((sum, subj) => sum + parseFloat(subj.grade || subj.score || 0), 0);
    return (total / subjects.length).toFixed(2);
  };

  const getGradeStatus = () => {
    const average = calculateAverage();
    if (average === 'N/A') return { status: 'N/A', color: 'gray' };
    
    const numAvg = parseFloat(average);
    const isPassing = numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0;
    
    return {
      status: isPassing ? 'PASSING' : 'FAILING',
      color: isPassing ? 'green' : 'red'
    };
  };

  const subjects = (() => {
    if (!studentData || !studentData.subjects) return [];
    try {
      return typeof studentData.subjects === 'string' ? JSON.parse(studentData.subjects) : studentData.subjects;
    } catch (err) {
      try {
        const cleaned = String(studentData.subjects).replace(/([\w\d]+)\s*:/g, '"$1":');
        const parsed = JSON.parse(cleaned);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err2) {
        return [];
      }
    }
  })();
  
  const average = calculateAverage();
  const gradeStatus = getGradeStatus();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'scholarships', name: 'Scholarships', icon: '💰' },
    { id: 'grades', name: 'My Grades', icon: '📚' },
    { id: 'profile', name: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    navigate('/student/login');
  };

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return renderDashboardView();
      case 'scholarships':
        return renderScholarshipsView();
      case 'grades':
        return renderGradesView();
      case 'profile':
        return renderProfileView();
      default:
        return renderDashboardView();
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await API.put('/students/profile', profileForm);
      if (res.data && res.data.success) {
        // update stored token if server returned a new one (username changed)
        if (res.data.token) {
          try { localStorage.setItem('student_token', res.data.token); } catch (e) { /* ignore */ }
        }

        showToast('Profile updated', 'success');
        // refresh profile
        await fetchStudentProfile();
        setIsEditingProfile(false);
      } else {
        showToast(res.data?.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error('Error updating profile', err);
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  }

  const handleChangePassword = async (payload) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = payload ?? passwordForm;
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Fill all password fields', 'warning');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('New password and confirm do not match', 'warning');
        return;
      }

      const res = await API.post('/students/profile/password', { currentPassword, newPassword, confirmPassword });
      if (res.data && res.data.success) {
        showToast('Password changed successfully', 'success');
        setShowChangePassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(res.data?.message || 'Failed to change password', 'error');
      }
    } catch (err) {
      console.error('Change password error', err);
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  const ChangePasswordModal = ({ visible, onClose, onChangePassword }) => {
    const [localForm, setLocalForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // initialize when modal opens
    useEffect(() => {
      if (visible) setLocalForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, [visible]);

    if (!visible) return null;
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-green-900/30 flex items-center justify-center z-50 p-4">
        <div className="bg-green-900 rounded-2xl shadow-2xl border border-green-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-green-800 p-6 border-b border-green-700 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-green-50">Change Password</h3>
              <p className="text-green-300 text-sm">Update your account password</p>
            </div>
            <button onClick={onClose} className="text-green-300 hover:text-white text-2xl font-bold">×</button>
          </div>

          <div className="p-6">
            <form className="space-y-6" onSubmit={(e)=>{e.preventDefault(); onChangePassword(localForm);}}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Current password"
                  value={localForm.currentPassword}
                  onChange={e=>setLocalForm(prev=>({...prev, currentPassword: e.target.value}))}
                  className="w-full px-3 py-3 bg-green-900 text-green-50 rounded border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={localForm.newPassword}
                  onChange={e=>setLocalForm(prev=>({...prev, newPassword: e.target.value}))}
                  className="w-full px-3 py-3 bg-green-900 text-green-50 rounded border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={localForm.confirmPassword}
                  onChange={e=>setLocalForm(prev=>({...prev, confirmPassword: e.target.value}))}
                  className="w-full px-3 py-3 bg-green-900 text-green-50 rounded border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 md:col-span-2"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors">Change Password</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const renderDashboardView = () => (
    <>
      {loading ? (
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border border-green-200">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-500">Loading your data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome, {studentData?.name || 'Student'}!
                </h2>
                <p className="text-gray-600">Here's your academic overview</p>
              </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center shadow-lg shadow-green-600/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-900 rounded-xl p-6 border border-blue-700 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📚</span>
          </div>
          <h3 className="text-blue-300 text-sm font-medium mb-1">Total Subjects</h3>
          <p className="text-3xl font-bold text-blue-50">{subjects.length}</p>
        </div>

        <div className="bg-purple-900 rounded-xl p-6 border border-purple-700 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-purple-300 text-sm font-medium mb-1">Average Grade</h3>
          <p className="text-3xl font-bold text-purple-50">{average}</p>
        </div>

        <div className={`bg-${gradeStatus.color}-900 rounded-xl p-6 border border-${gradeStatus.color}-700 shadow-xl`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{gradeStatus.color === 'green' ? '✅' : '⚠️'}</span>
          </div>
          <h3 className={`text-${gradeStatus.color}-300 text-sm font-medium mb-1`}>Academic Status</h3>
          <p className={`text-3xl font-bold text-${gradeStatus.color}-50`}>{gradeStatus.status}</p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveView('scholarships')}
            className="flex items-center justify-between p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-xl transition-all"
          >
            <div className="text-left">
              <p className="text-gray-800 font-semibold text-lg">View Scholarships</p>
              <p className="text-gray-600 text-sm mt-1">{scholarships.length} available</p>
            </div>
            <span className="text-3xl">💰</span>
          </button>
          
          <button
            onClick={() => setActiveView('grades')}
            className="flex items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl transition-all"
          >
            <div className="text-left">
              <p className="text-gray-800 font-semibold text-lg">My Grades</p>
              <p className="text-gray-600 text-sm mt-1">{subjects.length} subjects</p>
            </div>
            <span className="text-3xl">📚</span>
          </button>
          
          <button
            onClick={() => setActiveView('profile')}
            className="flex items-center justify-between p-6 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-xl transition-all"
          >
            <div className="text-left">
              <p className="text-gray-800 font-semibold text-lg">My Profile</p>
              <p className="text-gray-600 text-sm mt-1">View details</p>
            </div>
            <span className="text-3xl">👤</span>
          </button>
        </div>
      </div>
        </>
      )}
    </>
  );

  const renderScholarshipsView = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Available Scholarship Programs
      </h3>

      {scholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((scholarship) => (
            <div key={scholarship.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{scholarship.name}</h4>
                  <p className="text-gray-600 text-sm mb-3">{scholarship.description}</p>
                </div>
                <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                  {scholarship.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">💰 Amount:</span>
                  <span className="text-green-600 font-bold text-lg">₱{Number(scholarship.amount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">📋 Available Slots:</span>
                  <span className={`font-bold ${scholarship.available_slots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {scholarship.available_slots} / {scholarship.slots}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">📅 Deadline:</span>
                  <span className="text-gray-800 font-semibold">
                    {new Date(scholarship.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {scholarship.requirements && (
                <div className="bg-white rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">Requirements:</p>
                  <p className="text-sm text-gray-700">{scholarship.requirements}</p>
                </div>
              )}

              <button 
                onClick={() => { setSelectedScholarship(scholarship); setShowApplyModal(true); }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={scholarship.available_slots === 0}
              >
                {scholarship.available_slots > 0 ? 'Apply Now' : 'No Slots Available'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No scholarships available at the moment</p>
          <p className="text-gray-400 text-sm mt-2">Check back later for new opportunities</p>
        </div>
      )}
      {/* Apply Modal */}
      {showApplyModal && selectedScholarship && (
        <div className="fixed inset-0 backdrop-blur-sm bg-green-900/30 flex items-center justify-center z-50 p-4">
          <div className="bg-green-900 rounded-2xl shadow-2xl border border-green-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-green-800 p-6 border-b border-green-700 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-green-50">Apply for {selectedScholarship.name}</h3>
                <p className="text-green-300 text-sm">Attach required documents (COE, TOR, COR)</p>
              </div>
              <button onClick={()=>{setShowApplyModal(false); setSelectedScholarship(null);}} className="text-green-300 hover:text-white text-2xl font-bold">×</button>
            </div>

            <div className="p-6">
              <ApplyForm scholarship={selectedScholarship} onClose={() => { setShowApplyModal(false); setSelectedScholarship(null); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGradesView = () => (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Subjects & Grades
      </h3>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-500">Loading your grades...</p>
        </div>
      ) : subjects.length > 0 ? (
        <div className="space-y-3">
          {subjects.map((subject, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <span className="text-gray-800 font-medium text-lg">{subject.subject}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-green-600 bg-green-100 px-4 py-2 rounded-lg">
                  {subject.grade}
                </span>
              </div>
            </div>
          ))}
          
          {/* Average Display */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
              <span className="text-gray-800 text-xl font-bold">Overall Average</span>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-green-600">{average}</span>
                <span className={`px-4 py-2 rounded-lg text-lg font-bold ${
                  gradeStatus.color === 'green' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {gradeStatus.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg">No subjects recorded yet</p>
        </div>
      )}
    </div>
  );

  const renderProfileView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Personal Information
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex gap-3">
            {!isEditingProfile ? (
              <button onClick={() => setIsEditingProfile(true)} className="px-4 py-2 bg-green-600 text-white rounded">Edit Profile</button>
            ) : (
              <>
                <button onClick={() => handleSaveProfile()} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                <button onClick={() => { setIsEditingProfile(false); setProfileForm({ name: studentData.name, email: studentData.email, username: studentData.username }); }} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Cancel</button>
              </>
            )}
            <button onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) || setShowChangePassword(true)} className="px-4 py-2 bg-yellow-500 text-white rounded">Change Password</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm font-medium mb-1">Full Name</p>
            {!isEditingProfile ? (
              <p className="text-gray-800 text-lg font-semibold">{studentData?.name || 'N/A'}</p>
            ) : (
              <input value={profileForm.name} onChange={(e)=>setProfileForm(prev=>({...prev, name: e.target.value}))} className="w-full px-3 py-2 rounded border" />
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm font-medium mb-1">Email Address</p>
            {!isEditingProfile ? (
              <p className="text-gray-800 text-lg">{studentData?.email || 'N/A'}</p>
            ) : (
              <input value={profileForm.email} onChange={(e)=>setProfileForm(prev=>({...prev, email: e.target.value}))} className="w-full px-3 py-2 rounded border" />
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm font-medium mb-1">Username</p>
            {!isEditingProfile ? (
              <p className="text-gray-800 text-lg font-mono">{studentData?.username || 'N/A'}</p>
            ) : (
              <input value={profileForm.username} onChange={(e)=>setProfileForm(prev=>({...prev, username: e.target.value}))} className="w-full px-3 py-2 rounded border font-mono" />
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm font-medium mb-1">Student ID</p>
            <p className="text-gray-800 text-lg font-mono">#{studentData?.id || 'N/A'}</p>
          </div>
        </div>
        {/* Change Password Modal area */}
        <ChangePasswordModal
          visible={showChangePassword}
          onClose={()=>setShowChangePassword(false)}
          onChangePassword={handleChangePassword}
        />
      </div>
    );
  };

  const ApplyForm = ({ scholarship, onClose }) => {
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleFiles = (e) => {
      setFiles(Array.from(e.target.files));
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (files.length === 0) {
        showToast('Please attach at least one document', 'warning');
        return;
      }

      const formData = new FormData();
      files.forEach((f) => formData.append('documents', f));

      try {
        setSubmitting(true);
        const token = localStorage.getItem('student_token');
        if (!token) {
          showToast('Authentication required. Please login again.', 'error');
          return;
        }

        const res = await API.post(`/scholarships/apply/${scholarship.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data && res.data.success) {
          showToast('Application submitted', 'success');
          onClose();
        } else {
          showToast(res.data?.message || 'Failed to submit application', 'error');
        }
      } catch (err) {
        console.error('Apply error', err);
        showToast(err.response?.data?.message || 'Failed to submit application', 'error');
      } finally {
        setSubmitting(false);
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-green-200 text-sm mb-2 block">Upload Documents</label>
          <input type="file" accept="image/*,.pdf" multiple onChange={handleFiles} className="w-full text-green-50" />
          <p className="text-green-300 text-sm mt-2">Accepted: COE, TOR, COR (images or PDF)</p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg">{submitting ? 'Submitting...' : 'Submit Application'}</button>
        </div>
      </form>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-emerald-800">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-green-900 border-r border-green-700 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-50`}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-green-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-green-50">Student Portal</h1>
                <p className="text-green-300 text-xs">OSAS System</p>
              </div>
            )}
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
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'text-green-200 hover:bg-green-800 hover:text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-green-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
              {studentData?.name?.[0] || 'S'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-50 truncate">{studentData?.name || 'Student'}</p>
                <p className="text-xs text-green-300 truncate">{studentData?.email || ''}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
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

export default StudentDashboard;
