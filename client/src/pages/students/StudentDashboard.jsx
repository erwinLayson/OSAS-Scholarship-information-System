import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/shared/Toast';
import { StatCard, Badge, Button, Card, Modal } from '../../components/shared/ui';
import { 
  BookIcon, 
  ChartIcon, 
  MoneyIcon, 
  UserIcon, 
  SuccessIcon, 
  WarningIcon, 
  CloseIcon, 
  ArrowRightIcon, 
  ClipboardIcon, 
  HourglassIcon,
  HomeIcon,
  FileTextIcon,
  LogOutIcon,
  EditIcon,
  EyeIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GraduationCapIcon
} from '../../components/shared/Icons';

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
  const [allowGradeEdit, setAllowGradeEdit] = useState(false);
  const [editingGrades, setEditingGrades] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [hasUpdatedThisSemester, setHasUpdatedThisSemester] = useState(false);
  const [currentEditSessionId, setCurrentEditSessionId] = useState('');
  const [currentEditSemester, setCurrentEditSemester] = useState('');
  const [studentApplications, setStudentApplications] = useState([]);
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [applicationsTab, setApplicationsTab] = useState('pending'); // 'pending' or 'history'
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');
  const [historyScholarshipFilter, setHistoryScholarshipFilter] = useState('All');
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');
  const [appDetailsModalVisible, setAppDetailsModalVisible] = useState(false);
  const [selectedApplicationDetail, setSelectedApplicationDetail] = useState(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  useEffect(() => {
    fetchScholarships();
    fetchStudentProfile();
    fetchStudentApplications();
    fetchApplicationHistory();
    // fetch server-side setting for grade editing (includes session id and semester)
    (async () => {
      try {
        const res = await API.get('/settings/allow_grade_edit');
        if (res.data && res.data.success) {
          setAllowGradeEdit(!!res.data.value);
          setCurrentEditSessionId(res.data.sessionId || '');
          setCurrentEditSemester(res.data.semester || '');
        }
      } catch (e) {
        try {
          const val = localStorage.getItem('allow_grade_edit') === 'true';
          setAllowGradeEdit(val);
        } catch (e2) {}
      }
    })();
    // fetch student's recent grades history
    fetchRecentHistory();
  }, []);

  useEffect(() => {
    // determine whether the student has already updated for the current admin-enabled session
    // prefer matching by session id (if available), otherwise fall back to semester match
    const sessionId = currentEditSessionId;
    if (sessionId) {
      const foundBySession = recentHistory.some(r => String(r.session_id || r.sessionId || '') === String(sessionId));
      setHasUpdatedThisSemester(!!foundBySession);
      return;
    }

    const configuredSemester = currentEditSemester;
    if (configuredSemester) {
      const foundByConfigured = recentHistory.some(r => String(r.semester) === String(configuredSemester));
      setHasUpdatedThisSemester(!!foundByConfigured);
      return;
    }

    // fallback: use client-side computed current semester (date-based)
    const getCurrentSemester = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const sem = month >= 7 ? 'S2' : 'S1';
      return `${year}-${sem}`;
    };
    const cur = getCurrentSemester();
    const found = recentHistory.some(r => String(r.semester) === String(cur));
    setHasUpdatedThisSemester(found);
  }, [recentHistory, currentEditSessionId, currentEditSemester]);

  useEffect(() => {
    // keep toggle in sync if admin changes it in another tab
    const onStorage = (e) => {
      if (e.key === 'allow_grade_edit') {
        setAllowGradeEdit(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const fetchStudentApplications = async () => {
    try {
      const res = await API.get('/scholarships/my-applications');
      if (res.data && res.data.success) {
        setStudentApplications(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching student applications', err);
    }
  };

  const fetchApplicationHistory = async () => {
    try {
      const res = await API.get('/scholarships/my-applications/history');
      if (res.data && res.data.success) {
        setApplicationHistory(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching application history', err);
    }
  };

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
        // subjects are stored on the profile; UI will render them read-only
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

  const fetchRecentHistory = async () => {
    try {
      const res = await API.get('/students/recent-grades');
      if (res.data && res.data.success) {
        setRecentHistory(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error('Error fetching recent grades history', err);
    }
  };

  const calculateAverage = () => {
    // If editing, compute from the editing buffer so UI shows live average
    if (allowGradeEdit && Array.isArray(editingGrades) && editingGrades.length > 0) {
      const list = editingGrades.filter(s => s && (s.grade || s.score || s.value));
      if (list.length === 0) return 'N/A';
      const total = list.reduce((sum, subj) => sum + (parseFloat(subj.grade || subj.score || subj.value || 0) || 0), 0);
      return (total / list.length).toFixed(2);
    }

    if (!studentData || !studentData.subjects) return 'N/A';

    let subjects;
    try {
      subjects = typeof studentData.subjects === 'string' ? JSON.parse(studentData.subjects) : studentData.subjects;
    } catch (err) {
      try {
        const cleaned = String(studentData.subjects).replace(/([\w\d]+)\s*:/g, '"$1":');
        subjects = JSON.parse(cleaned);
      } catch (err2) {
        return 'N/A';
      }
    }

    if (!Array.isArray(subjects) || subjects.length === 0) return 'N/A';

    const total = subjects.reduce((sum, subj) => sum + (parseFloat(subj.grade || subj.score || subj.value || 0) || 0), 0);
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

  // initialize editingGrades whenever profile subjects change
  useEffect(() => {
    try {
      const copy = Array.isArray(subjects) ? subjects.map(s => ({ ...s })) : [];
      setEditingGrades(copy);
    } catch (e) { setEditingGrades([]); }
  }, [studentData]);
  
  const average = calculateAverage();
  const gradeStatus = getGradeStatus();

  // derived grade info for display (use editing buffer when editing)
  const currentList = (allowGradeEdit && !hasUpdatedThisSemester) ? (Array.isArray(editingGrades) ? editingGrades : []) : subjects;
  const totalUnits = currentList.reduce((sum, s) => sum + (Number(s.unit) || 0), 0);
  const recentGrades = currentList.length > 0 ? currentList.slice(-5).slice().reverse() : [];
  const recentAverage = (() => {
    if (!recentGrades || recentGrades.length === 0) return 'N/A';
    const total = recentGrades.reduce((acc, s) => acc + (Number(s.grade || s.score || s.value || 0) || 0), 0);
    return (total / recentGrades.length).toFixed(2);
  })();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <HomeIcon size="1.25rem" /> },
    { id: 'scholarships', name: 'Scholarships', icon: <MoneyIcon size="1.25rem" /> },
    { id: 'grades', name: 'My Grades', icon: <BookIcon size="1.25rem" /> },
    { id: 'applications', name: 'Applications', icon: <FileTextIcon size="1.25rem" /> },
    { id: 'profile', name: 'Profile', icon: <UserIcon size="1.25rem" /> },
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
      case 'applications':
        return renderApplicationsView();
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

  // Old ChangePasswordModal - kept for backwards compatibility but replaced by ChangePasswordForm + Modal
  const ChangePasswordModal = ({ visible, onClose, onChangePassword }) => {
    if (!visible) return null;
    return null; // No longer used
  };

  const renderDashboardView = () => (
    <div className="space-y-6 animate-fadeIn">
      {loading ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500">Loading your data...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Welcome Section */}
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, {studentData?.name?.split(' ')[0] || 'Student'}! 👋
                </h2>
                <p className="text-emerald-100">Here's your academic overview for today</p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <GraduationCapIcon className="text-white" size="2rem" />
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Subjects"
              value={subjects.length}
              icon={<BookIcon size="1.5rem" />}
              color="blue"
            />
            <StatCard
              title="Average Grade"
              value={average}
              icon={<ChartIcon size="1.5rem" />}
              color="purple"
            />
            <StatCard
              title="Academic Status"
              value={gradeStatus.status}
              icon={gradeStatus.passing ? <CheckCircleIcon size="1.5rem" /> : <WarningIcon size="1.5rem" />}
              color={gradeStatus.passing ? 'emerald' : 'red'}
            />
          </div>

          {/* Quick Access */}
          <Card title="Quick Access">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveView('scholarships')}
                className="flex items-center justify-between p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-left">
                  <p className="text-gray-800 font-semibold">View Scholarships</p>
                  <p className="text-gray-500 text-sm mt-1">{scholarships.length} available</p>
                </div>
                <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center">
                  <MoneyIcon className="text-emerald-600" size="1.5rem" />
                </div>
              </button>
              
              <button
                onClick={() => setActiveView('grades')}
                className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-left">
                  <p className="text-gray-800 font-semibold">My Grades</p>
                  <p className="text-gray-500 text-sm mt-1">{subjects.length} subjects</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                  <BookIcon className="text-blue-600" size="1.5rem" />
                </div>
              </button>
              
              <button
                onClick={() => setActiveView('profile')}
                className="flex items-center justify-between p-5 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-left">
                  <p className="text-gray-800 font-semibold">My Profile</p>
                  <p className="text-gray-500 text-sm mt-1">View details</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                  <UserIcon className="text-purple-600" size="1.5rem" />
                </div>
              </button>
            </div>
          </Card>

          {/* Recent Applications */}
          {studentApplications.length > 0 && (
            <Card title="Recent Applications">
              <div className="space-y-3">
                {studentApplications.slice(0, 3).map(app => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FileTextIcon className="text-emerald-600" size="1.25rem" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{app.scholarship_name || `Scholarship #${app.scholarship_id}`}</p>
                        <p className="text-sm text-gray-500">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'error' : 'warning'}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const renderScholarshipsView = () => (
    <div className="space-y-6 animate-fadeIn">
      <Card 
        title="Available Scholarships" 
        subtitle={`${scholarships.length} scholarship programs available`}
      >
        {scholarships.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scholarships.map((scholarship) => (
              <div 
                key={scholarship.id} 
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{scholarship.name}</h4>
                    <p className="text-gray-500 text-sm line-clamp-2">{scholarship.description}</p>
                  </div>
                  <Badge variant="success">{scholarship.status}</Badge>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <MoneyIcon size="1rem" /> Amount
                    </span>
                    <span className="text-emerald-600 font-bold text-lg">₱{Number(scholarship.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <ClipboardIcon size="1rem" /> Available Slots
                    </span>
                    <span className={`font-semibold ${scholarship.available_slots > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {scholarship.available_slots} / {scholarship.slots}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <HourglassIcon size="1rem" /> Deadline
                    </span>
                    <span className="text-gray-700 font-medium">
                      {new Date(scholarship.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Progress bar for slots */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(scholarship.available_slots / scholarship.slots) * 100}%` }}
                    />
                  </div>
                </div>

                {scholarship.requirements && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Requirements</p>
                    <p className="text-sm text-gray-700">{scholarship.requirements}</p>
                  </div>
                )}

                <Button 
                  onClick={() => { setSelectedScholarship(scholarship); setShowApplyModal(true); }}
                  fullWidth
                  disabled={scholarship.available_slots === 0}
                  variant={scholarship.available_slots > 0 ? 'primary' : 'secondary'}
                >
                  {scholarship.available_slots > 0 ? 'Apply Now' : 'No Slots Available'}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MoneyIcon className="text-gray-400" size="2rem" />
            </div>
            <p className="text-gray-500 text-lg">No scholarships available at the moment</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for new opportunities</p>
          </div>
        )}
      </Card>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal && selectedScholarship}
        onClose={() => { setShowApplyModal(false); setSelectedScholarship(null); }}
        title={`Apply for ${selectedScholarship?.name || 'Scholarship'}`}
        size="lg"
      >
        <ApplyForm 
          scholarship={selectedScholarship} 
          onClose={() => { setShowApplyModal(false); setSelectedScholarship(null); fetchStudentApplications(); }} 
          showToast={showToast}
        />
      </Modal>
    </div>
  );

  const renderApplicationsView = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setApplicationsTab('pending')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            applicationsTab === 'pending'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Applications ({studentApplications.length})
        </button>
        <button
          onClick={() => setApplicationsTab('history')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            applicationsTab === 'history'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Application History ({applicationHistory.length})
        </button>
      </div>

      {/* Pending Applications Tab */}
      {applicationsTab === 'pending' && (
        <Card 
          title="Pending Applications"
          subtitle={`${studentApplications.length} pending applications`}
        >
          {studentApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileTextIcon className="text-gray-400" size="2rem" />
              </div>
              <p className="text-gray-500">You don't have any pending applications</p>
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={() => setActiveView('scholarships')}
              >
                Browse Scholarships
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {studentApplications.map(app => (
                <div 
                  key={app.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <HourglassIcon className="text-yellow-600" size="1.5rem" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{app.scholarship_name || `Scholarship #${app.scholarship_id}`}</p>
                      <p className="text-sm text-gray-500">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">
                      {app.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={<EyeIcon size="1rem" />}
                      onClick={() => { setSelectedApplicationDetail(app); setAppDetailsModalVisible(true); }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Application History Tab */}
      {applicationsTab === 'history' && (
        <>
          {/* History Filters */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={historyStatusFilter}
                  onChange={e => setHistoryStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-800 min-w-[120px]"
                >
                  <option value="All">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship</label>
                <select
                  value={historyScholarshipFilter}
                  onChange={e => setHistoryScholarshipFilter(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-800 min-w-[180px]"
                >
                  <option value="All">All Scholarships</option>
                  {[...new Set(applicationHistory.map(app => app.scholarship_name).filter(Boolean))].map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={historyDateFrom}
                  onChange={e => setHistoryDateFrom(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={historyDateTo}
                  onChange={e => setHistoryDateTo(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-800"
                />
              </div>
              <button
                onClick={() => {
                  setHistoryStatusFilter('All');
                  setHistoryScholarshipFilter('All');
                  setHistoryDateFrom('');
                  setHistoryDateTo('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Showing {applicationHistory.filter(app => {
                if (historyStatusFilter !== 'All' && app.status !== historyStatusFilter) return false;
                if (historyScholarshipFilter !== 'All' && app.scholarship_name !== historyScholarshipFilter) return false;
                if (historyDateFrom) {
                  const appDate = new Date(app.processed_at);
                  const fromDate = new Date(historyDateFrom);
                  if (appDate < fromDate) return false;
                }
                if (historyDateTo) {
                  const appDate = new Date(app.processed_at);
                  const toDate = new Date(historyDateTo);
                  toDate.setHours(23, 59, 59, 999);
                  if (appDate > toDate) return false;
                }
                return true;
              }).length} of {applicationHistory.length} records
            </div>
          </div>

          <Card 
            title="Application History"
            subtitle={`${applicationHistory.length} processed applications`}
          >
            {applicationHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardIcon className="text-gray-400" size="2rem" />
                </div>
                <p className="text-gray-500">No application history yet</p>
                <p className="text-sm text-gray-400 mt-2">Your approved or rejected applications will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicationHistory.filter(app => {
                  if (historyStatusFilter !== 'All' && app.status !== historyStatusFilter) return false;
                  if (historyScholarshipFilter !== 'All' && app.scholarship_name !== historyScholarshipFilter) return false;
                  if (historyDateFrom) {
                    const appDate = new Date(app.processed_at);
                    const fromDate = new Date(historyDateFrom);
                    if (appDate < fromDate) return false;
                  }
                  if (historyDateTo) {
                    const appDate = new Date(app.processed_at);
                    const toDate = new Date(historyDateTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (appDate > toDate) return false;
                  }
                  return true;
                }).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No applications match your filters</p>
                    <button
                      onClick={() => {
                        setHistoryStatusFilter('All');
                        setHistoryScholarshipFilter('All');
                        setHistoryDateFrom('');
                        setHistoryDateTo('');
                      }}
                      className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : applicationHistory.filter(app => {
                  if (historyStatusFilter !== 'All' && app.status !== historyStatusFilter) return false;
                  if (historyScholarshipFilter !== 'All' && app.scholarship_name !== historyScholarshipFilter) return false;
                  if (historyDateFrom) {
                    const appDate = new Date(app.processed_at);
                    const fromDate = new Date(historyDateFrom);
                    if (appDate < fromDate) return false;
                  }
                  if (historyDateTo) {
                    const appDate = new Date(app.processed_at);
                    const toDate = new Date(historyDateTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (appDate > toDate) return false;
                  }
                  return true;
                }).map(app => (
                  <div 
                    key={app.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        app.status === 'Approved' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {app.status === 'Approved' ? (
                          <SuccessIcon className="text-green-600" size="1.5rem" />
                        ) : (
                          <CloseIcon className="text-red-600" size="1.5rem" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{app.scholarship_name || `Scholarship #${app.scholarship_id}`}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}</span>
                          <span>Processed: {app.processed_at ? new Date(app.processed_at).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={app.status === 'Approved' ? 'success' : 'error'}>
                        {app.status}
                      </Badge>
                      {app.scholarship_amount && (
                        <span className="text-sm font-medium text-gray-600">
                          ₱{Number(app.scholarship_amount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Application Details Modal */}
      <Modal
        isOpen={appDetailsModalVisible}
        onClose={() => setAppDetailsModalVisible(false)}
        title={selectedApplicationDetail?.scholarship_name || 'Application Details'}
        size="lg"
      >
        {selectedApplicationDetail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Application Status</p>
                <Badge 
                  size="lg"
                  variant={selectedApplicationDetail.status === 'Approved' ? 'success' : selectedApplicationDetail.status === 'Rejected' ? 'error' : 'warning'}
                >
                  {selectedApplicationDetail.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Submitted On</p>
                <p className="font-medium text-gray-800">{new Date(selectedApplicationDetail.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Documents</h4>
              {Array.isArray(selectedApplicationDetail.documents) && selectedApplicationDetail.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplicationDetail.documents.map((d, i) => {
                    const normalized = String(d).replace(/\\/g, '/');
                    const url = `${API.defaults.baseURL}/${normalized}`;
                    const name = normalized.split('/').pop();
                    const ext = name.split('.').pop().toLowerCase();
                    const isImage = ['jpg','jpeg','png','gif','bmp','webp'].includes(ext);
                    return (
                      <div key={i} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 font-medium mb-2 truncate">{name}</p>
                        {isImage ? (
                          <img src={url} alt={name} className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <a href={url} target="_blank" rel="noreferrer">
                            <Button variant="secondary" size="sm" fullWidth>Open Document</Button>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No documents uploaded</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  const showApplicationDetails = (app) => {
    setSelectedApplicationDetail(app);
    setAppDetailsModalVisible(true);
  };

  // Keep old ApplicationDetailsModal for backward compatibility but won't be used
  const ApplicationDetailsModal = ({ visible, onClose, app }) => {
    if (!visible || !app) return null;
    return null; // Not used anymore, using Modal component instead
    
  };

  const renderGradesView = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Current Semester Grades */}
      <Card 
        title="My Grades"
        subtitle="Current semester subjects and grades"
        headerAction={
          allowGradeEdit && !hasUpdatedThisSemester && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingGrades(prev => ([...prev, { subject: '', unit: '', grade: '' }]))}
              >
                Add Subject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  try {
                    const payload = { subjects: JSON.stringify(editingGrades) };
                    const res = await API.put('/students/profile', payload);
                    if (res.data && res.data.success) {
                      showToast('Grades saved successfully', 'success');
                      await fetchStudentProfile();
                      await fetchRecentHistory();
                    } else {
                      showToast(res.data?.message || 'Failed to save grades', 'error');
                    }
                  } catch (err) {
                    console.error('Error saving grades', err);
                    showToast('Failed to save grades', 'error');
                  }
                }}
              >
                Save Grades
              </Button>
            </div>
          )
        }
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : currentList.length > 0 || (allowGradeEdit && !hasUpdatedThisSemester) ? (
          <>
            {/* Grade Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-600 font-medium">Average Grade</p>
                <p className="text-3xl font-bold text-emerald-700">{average}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-medium">Total Units</p>
                <p className="text-3xl font-bold text-blue-700">{totalUnits}</p>
              </div>
              <div className={`${gradeStatus.passing ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} border rounded-xl p-4`}>
                <p className={`text-sm font-medium ${gradeStatus.passing ? 'text-emerald-600' : 'text-red-600'}`}>Status</p>
                <p className={`text-3xl font-bold ${gradeStatus.passing ? 'text-emerald-700' : 'text-red-700'}`}>{gradeStatus.status}</p>
              </div>
            </div>

            {allowGradeEdit && hasUpdatedThisSemester && (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">You have already updated grades for the current session. Editing is disabled.</p>
              </div>
            )}

            {/* Subjects List */}
            <div className="space-y-3">
              {currentList.map((subject, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    {allowGradeEdit && !hasUpdatedThisSemester ? (
                      <input
                        type="text"
                        value={editingGrades[index]?.subject ?? subject.subject ?? ''}
                        onChange={(e) => setEditingGrades(prev => {
                          const copy = [...prev];
                          copy[index] = { ...(copy[index] || {}), subject: e.target.value };
                          return copy;
                        })}
                        placeholder="Subject name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">{subject.subject}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {allowGradeEdit && !hasUpdatedThisSemester ? (
                      <>
                        <input
                          type="number"
                          value={editingGrades[index]?.unit ?? subject.unit ?? ''}
                          onChange={(e) => setEditingGrades(prev => {
                            const copy = [...prev];
                            copy[index] = { ...(copy[index] || {}), unit: e.target.value };
                            return copy;
                          })}
                          placeholder="Units"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={editingGrades[index]?.grade ?? subject.grade ?? ''}
                          onChange={(e) => setEditingGrades(prev => {
                            const copy = [...prev];
                            copy[index] = { ...(copy[index] || {}), grade: e.target.value };
                            return copy;
                          })}
                          className="w-24 px-3 py-2 bg-emerald-100 border border-emerald-300 rounded-lg text-center text-emerald-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setEditingGrades(prev => prev.filter((_, i) => i !== index))}
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500">{subject.unit || '-'} units</span>
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg">
                          {subject.grade}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookIcon className="text-gray-400" size="2rem" />
            </div>
            <p className="text-gray-500">No subjects recorded yet</p>
          </div>
        )}
      </Card>

      {/* Grade History - Separated */}
      <Card 
        title="Grade History"
        subtitle="Previous semester records"
      >
        {recentHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No grade history available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentHistory.map((entry, idx) => {
              let subs = [];
              try {
                subs = typeof entry.grades === 'string' ? JSON.parse(entry.grades) : entry.grades;
              } catch (e) { subs = []; }
              const avg = subs.length > 0 ? (subs.reduce((a,b) => a + Number(b.grade || b.score || 0), 0) / subs.length).toFixed(2) : 'N/A';
              const isExpanded = expandedHistoryId === (entry.recent_grade_id || idx);

              return (
                <div key={entry.recent_grade_id || idx} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedHistoryId(isExpanded ? null : (entry.recent_grade_id || idx))}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <BookIcon className="text-emerald-600" size="1.25rem" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">
                          {entry.semester || new Date(entry.create_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">{subs.length} subjects • Average: {avg}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="info">{avg}</Badge>
                      {isExpanded ? <ChevronUpIcon size="1.25rem" /> : <ChevronDownIcon size="1.25rem" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="space-y-2">
                        {subs.map((s, si) => (
                          <div key={si} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded flex items-center justify-center">
                                {si + 1}
                              </span>
                              <div>
                                <p className="font-medium text-gray-800">{s.subject || s.name || 'Subject'}</p>
                                <p className="text-xs text-gray-500">Units: {s.unit || '-'}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg">
                              {s.grade ?? s.score ?? s.value ?? '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );

  const renderProfileView = () => (
    <div className="space-y-6 animate-fadeIn">
      {loading ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        </Card>
      ) : (
        <>
          {/* Personal Information Card */}
          <Card 
            title="Personal Information"
            subtitle="Your account details"
            headerAction={
              !isEditingProfile ? (
                <Button variant="secondary" size="sm" icon={<EditIcon size="1rem" />} onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { 
                    setIsEditingProfile(false); 
                    setProfileForm({ name: studentData?.name || '', email: studentData?.email || '', username: studentData?.username || '' }); 
                  }}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 font-medium mb-1">Full Name</p>
                {!isEditingProfile ? (
                  <p className="text-lg font-semibold text-gray-800">{studentData?.name || 'N/A'}</p>
                ) : (
                  <input 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 font-medium mb-1">Email Address</p>
                {!isEditingProfile ? (
                  <p className="text-lg text-gray-800">{studentData?.email || 'N/A'}</p>
                ) : (
                  <input 
                    value={profileForm.email} 
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 font-medium mb-1">Username</p>
                {!isEditingProfile ? (
                  <p className="text-lg text-gray-800 font-mono">{studentData?.username || 'N/A'}</p>
                ) : (
                  <input 
                    value={profileForm.username} 
                    onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 font-medium mb-1">Student ID</p>
                <p className="text-lg text-gray-800 font-mono">#{studentData?.id || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Security Card */}
          <Card 
            title="Security"
            subtitle="Password and account security"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Password</p>
                <p className="text-sm text-gray-500">Last changed: Unknown</p>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title="Change Password"
        size="md"
      >
        <ChangePasswordForm 
          onSubmit={handleChangePassword}
          onCancel={() => setShowChangePassword(false)}
        />
      </Modal>
    </div>
  );

  // ChangePasswordForm component
  const ChangePasswordForm = ({ onSubmit, onCancel }) => {
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    return (
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Confirm new password"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" fullWidth onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary" fullWidth>Change Password</Button>
        </div>
      </form>
    );
  };

  const ApplyForm = ({ scholarship, onClose, showToast: toastFn }) => {
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = React.useRef();

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (files.length === 0) {
        (toastFn || showToast)('Please attach at least one document', 'warning');
        return;
      }

      const formData = new FormData();
      files.forEach((f) => formData.append('documents', f));

      try {
        setSubmitting(true);
        const token = localStorage.getItem('student_token');
        if (!token) {
          (toastFn || showToast)('Authentication required. Please login again.', 'error');
          return;
        }

        const res = await API.post(`/scholarships/apply/${scholarship.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data && res.data.success) {
          (toastFn || showToast)('Application submitted successfully!', 'success');
          setFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = '';
          onClose();
        } else {
          (toastFn || showToast)(res.data?.message || 'Failed to submit application', 'error');
        }
      } catch (err) {
        console.error('Apply error', err);
        (toastFn || showToast)(err.response?.data?.message || 'Failed to submit application', 'error');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-800">
            <strong>Scholarship:</strong> {scholarship?.name}<br />
            <strong>Amount:</strong> ₱{Number(scholarship?.amount || 0).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Required Documents</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="hidden"
              ref={fileInputRef}
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileTextIcon className="text-emerald-600" size="1.5rem" />
              </div>
              <p className="text-gray-700 font-medium">Click to upload documents</p>
              <p className="text-sm text-gray-500 mt-1">COE, TOR, COR (images or PDF)</p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  <button 
                    type="button"
                    onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <CloseIcon size="1rem" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" fullWidth loading={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

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
                  <h1 className="text-lg font-bold text-gray-900">Student Portal</h1>
                  <p className="text-xs text-gray-500">OSAS System</p>
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
              onClick={() => setActiveView(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeView === item.id
                  ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className={activeView === item.id ? 'text-emerald-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              {studentData?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{studentData?.name || 'Student'}</p>
                <p className="text-xs text-gray-500 truncate">{studentData?.email || ''}</p>
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
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 capitalize">{activeView}</h1>
              <p className="text-sm text-gray-500">Welcome to your student portal</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{studentData?.name || 'Student'}</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                {studentData?.name?.[0]?.toUpperCase() || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
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
