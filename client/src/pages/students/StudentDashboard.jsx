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

// ============================================
// INTERNAL COMPONENTS
// ============================================

/**
 * Sidebar Component - Navigation sidebar with menu items and user profile
 */
const Sidebar = ({ 
  sidebarOpen, 
  menuItems, 
  activeView, 
  studentData, 
  onToggle, 
  onMenuClick, 
  onLogout 
}) => (
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
          onClick={onToggle}
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
          onClick={() => onMenuClick(item.id)}
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
        onClick={onLogout}
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
);

/**
 * Header Component - Top navigation bar with user info
 */
const Header = ({ activeView, studentData }) => (
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
);

/**
 * ChangePasswordForm Component - Password change form used in modal
 */
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

/**
 * ApplyForm Component - Scholarship application form with file upload
 */
const ApplyForm = ({ scholarship, onClose, showToast }) => {
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = React.useRef();

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
        showToast('Application submitted successfully!', 'success');
        setFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
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

/**
 * ApplicationDetailsModal Component - View application details and documents
 */
const ApplicationDetailsModal = ({ isOpen, application, onClose }) => {
  if (!application) return null;
  
  const documents = (() => {
    try {
      return typeof application.documents === 'string' ? JSON.parse(application.documents) : application.documents;
    } catch { return []; }
  })();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Details" size="lg">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Scholarship</p>
          <p className="font-semibold text-gray-800">{application.scholarship_name || `Scholarship #${application.scholarship_id}`}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Status</p>
            <Badge variant={application.status === 'Approved' ? 'success' : application.status === 'Rejected' ? 'danger' : 'warning'}>
              {application.status}
            </Badge>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium text-gray-800">{new Date(application.processed_at || application.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        {documents.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Submitted Documents</p>
            <div className="space-y-2">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{typeof doc === 'string' ? doc.split('/').pop() : doc.name || `Document ${idx + 1}`}</span>
                  <a 
                    href={`${API.defaults.baseURL?.replace('/api', '') || 'http://localhost:3000'}/${typeof doc === 'string' ? doc : doc.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="pt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

/**
 * DashboardView Component - Main dashboard with stats and overview
 */
const DashboardView = ({ 
  loading, 
  studentData, 
  scholarships, 
  applications, 
  applicationHistory, 
  recentGrades,
  average, 
  gradeStatus,
  onViewScholarships,
  onViewApplications,
  onViewGrades
}) => (
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
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {studentData?.name?.split(' ')[0] || 'Student'}!</h2>
              <p className="text-emerald-100">Stay updated with your scholarship applications and grades.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCapIcon className="text-white" size="2.5rem" />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Average Grade"
            value={average}
            icon={<ChartIcon size="1.5rem" />}
            trend={gradeStatus.status !== 'N/A' ? { value: gradeStatus.status, isPositive: gradeStatus.color === 'green' } : undefined}
            iconBgColor={gradeStatus.color === 'green' ? 'bg-emerald-100' : gradeStatus.color === 'red' ? 'bg-red-100' : 'bg-gray-100'}
            iconColor={gradeStatus.color === 'green' ? 'text-emerald-600' : gradeStatus.color === 'red' ? 'text-red-600' : 'text-gray-600'}
          />
          <StatCard
            title="Available Scholarships"
            value={scholarships.length}
            icon={<MoneyIcon size="1.5rem" />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Pending Applications"
            value={applications.length}
            icon={<HourglassIcon size="1.5rem" />}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatCard
            title="Processed Applications"
            value={applicationHistory.length}
            icon={<CheckCircleIcon size="1.5rem" />}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewScholarships}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <MoneyIcon className="text-emerald-600" size="1.5rem" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Browse Scholarships</p>
                <p className="text-sm text-gray-500">Find and apply for scholarships</p>
              </div>
              <ArrowRightIcon className="ml-auto text-gray-400" size="1.25rem" />
            </div>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewApplications}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileTextIcon className="text-blue-600" size="1.5rem" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">My Applications</p>
                <p className="text-sm text-gray-500">Track application status</p>
              </div>
              <ArrowRightIcon className="ml-auto text-gray-400" size="1.25rem" />
            </div>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewGrades}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookIcon className="text-purple-600" size="1.5rem" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">My Grades</p>
                <p className="text-sm text-gray-500">View academic records</p>
              </div>
              <ArrowRightIcon className="ml-auto text-gray-400" size="1.25rem" />
            </div>
          </Card>
        </div>

        {/* Recent Grades */}
        {recentGrades.length > 0 && (
          <Card title="Recent Grades" subtitle="Your latest subject scores">
            <div className="space-y-3">
              {recentGrades.map((subject, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <BookIcon className="text-emerald-600" size="1rem" />
                    </div>
                    <span className="font-medium text-gray-800">{subject.subject || subject.name || 'Subject'}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg">
                    {subject.grade ?? subject.score ?? subject.value ?? '-'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </>
    )}
  </div>
);

/**
 * ScholarshipsView Component - Browse and apply for scholarships
 */
const ScholarshipsView = ({ 
  loading, 
  scholarships, 
  applications, 
  applicationHistory,
  showApplyModal,
  selectedScholarship,
  onOpenApply,
  onCloseApply,
  showToast,
  onApplicationSubmitted
}) => {
  const hasApplied = (scholarshipId) => {
    const pending = applications.some(a => a.scholarship_id === scholarshipId);
    const inHistory = applicationHistory.some(a => a.scholarship_id === scholarshipId);
    return pending || inHistory;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card 
        title="Available Scholarships"
        subtitle={`${scholarships.length} scholarships available for application`}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MoneyIcon className="text-gray-400" size="2rem" />
            </div>
            <p className="text-gray-500">No scholarships available at the moment</p>
            <p className="text-sm text-gray-400 mt-2">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scholarships.map(scholarship => (
              <div 
                key={scholarship.id} 
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{scholarship.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{scholarship.description || 'No description available'}</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <MoneyIcon className="text-emerald-600" size="1rem" />
                    <span className="text-gray-700">Amount: <strong>₱{Number(scholarship.amount || 0).toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="text-blue-600" size="1rem" />
                    <span className="text-gray-700">Slots: <strong>{scholarship.slots_available || scholarship.slots || 0}</strong> available</span>
                  </div>
                  {scholarship.deadline && (
                    <div className="flex items-center gap-2">
                      <ClipboardIcon className="text-orange-600" size="1rem" />
                      <span className="text-gray-700">Deadline: <strong>{new Date(scholarship.deadline).toLocaleDateString()}</strong></span>
                    </div>
                  )}
                </div>

                {scholarship.requirements && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                    <p className="text-sm text-gray-600">{scholarship.requirements}</p>
                  </div>
                )}

                <Button 
                  variant={hasApplied(scholarship.id) ? 'secondary' : 'primary'}
                  fullWidth
                  disabled={hasApplied(scholarship.id)}
                  onClick={() => onOpenApply(scholarship)}
                >
                  {hasApplied(scholarship.id) ? 'Already Applied' : 'Apply Now'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={onCloseApply}
        title={`Apply for ${selectedScholarship?.name || 'Scholarship'}`}
        size="md"
      >
        {selectedScholarship && (
          <ApplyForm 
            scholarship={selectedScholarship}
            onClose={() => {
              onCloseApply();
              onApplicationSubmitted();
            }}
            showToast={showToast}
          />
        )}
      </Modal>
    </div>
  );
};

/**
 * ApplicationsView Component - View and manage scholarship applications
 */
const ApplicationsView = ({
  loading,
  applications,
  applicationHistory,
  applicationsTab,
  setApplicationsTab,
  historyStatusFilter,
  setHistoryStatusFilter,
  historyScholarshipFilter,
  setHistoryScholarshipFilter,
  historyDateFrom,
  setHistoryDateFrom,
  historyDateTo,
  setHistoryDateTo,
  onViewDetails,
  onBrowseScholarships
}) => {
  const clearFilters = () => {
    setHistoryStatusFilter('All');
    setHistoryScholarshipFilter('All');
    setHistoryDateFrom('');
    setHistoryDateTo('');
  };

  const filterHistory = (app) => {
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
  };

  const filteredHistory = applicationHistory.filter(filterHistory);

  return (
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
          Pending Applications ({applications.length})
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
          subtitle={`${applications.length} pending applications`}
        >
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileTextIcon className="text-gray-400" size="2rem" />
              </div>
              <p className="text-gray-500">You don't have any pending applications</p>
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={onBrowseScholarships}
              >
                Browse Scholarships
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
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
                    <Badge variant="warning">{app.status}</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      icon={<EyeIcon size="1rem" />}
                      onClick={() => onViewDetails(app)}
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
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Showing {filteredHistory.length} of {applicationHistory.length} records
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
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications match your filters</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map(app => (
                  <div 
                    key={app.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        app.status === 'Approved' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}>
                        {app.status === 'Approved' 
                          ? <SuccessIcon className="text-emerald-600" size="1.5rem" />
                          : <CloseIcon className="text-red-600" size="1.5rem" />
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{app.scholarship_name || `Scholarship #${app.scholarship_id}`}</p>
                        <p className="text-sm text-gray-500">Processed on {new Date(app.processed_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={app.status === 'Approved' ? 'success' : 'danger'}>
                        {app.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        icon={<EyeIcon size="1rem" />}
                        onClick={() => onViewDetails(app)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

/**
 * GradesView Component - View and edit academic grades
 */
const GradesView = ({
  loading,
  currentList,
  average,
  totalUnits,
  gradeStatus,
  allowGradeEdit,
  hasUpdatedThisSemester,
  editingGrades,
  setEditingGrades,
  recentHistory,
  expandedHistoryId,
  setExpandedHistoryId,
  onSaveGrades
}) => (
  <div className="space-y-6 animate-fadeIn">
    {/* Current Grades Card */}
    <Card 
      title="Current Grades"
      subtitle="Your academic performance"
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
              onClick={onSaveGrades}
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

    {/* Grade History */}
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

/**
 * ProfileView Component - View and edit user profile
 */
const ProfileView = ({
  loading,
  studentData,
  isEditingProfile,
  setIsEditingProfile,
  profileForm,
  setProfileForm,
  onSaveProfile,
  showChangePassword,
  setShowChangePassword,
  onChangePassword
}) => (
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
                <Button variant="primary" size="sm" onClick={onSaveProfile}>
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
        onSubmit={onChangePassword}
        onCancel={() => setShowChangePassword(false)}
      />
    </Modal>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

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

  // Handler for saving grades
  const handleSaveGrades = async () => {
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
  };

  // Handler for saving profile
  const handleSaveProfile = async () => {
    try {
      const res = await API.put('/students/profile', profileForm);
      if (res.data && res.data.success) {
        showToast('Profile updated successfully', 'success');
        setIsEditingProfile(false);
        await fetchStudentProfile();
      } else {
        showToast(res.data?.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error('Error updating profile', err);
      showToast('Failed to update profile', 'error');
    }
  };

  // Handler for changing password
  const handleChangePassword = async (form) => {
    if (form.newPassword !== form.confirmPassword) {
      showToast('New password and confirm password do not match', 'error');
      return;
    }
    try {
      const res = await API.post('/students/profile/password', form);
      if (res.data && res.data.success) {
        showToast('Password changed successfully', 'success');
        setShowChangePassword(false);
      } else {
        showToast(res.data?.message || 'Failed to change password', 'error');
      }
    } catch (err) {
      console.error('Error changing password', err);
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    }
  };

  // Render the active view content
  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return (
          <DashboardView
            loading={loading}
            studentData={studentData}
            scholarships={scholarships}
            applications={studentApplications}
            applicationHistory={applicationHistory}
            recentGrades={recentGrades}
            average={average}
            gradeStatus={{ ...gradeStatus, passing: gradeStatus.color === 'green' }}
            onViewScholarships={() => setActiveView('scholarships')}
            onViewApplications={() => setActiveView('applications')}
            onViewGrades={() => setActiveView('grades')}
          />
        );
      case 'scholarships':
        return (
          <ScholarshipsView
            loading={loading}
            scholarships={scholarships}
            applications={studentApplications}
            applicationHistory={applicationHistory}
            showApplyModal={showApplyModal}
            selectedScholarship={selectedScholarship}
            onOpenApply={(scholarship) => { setSelectedScholarship(scholarship); setShowApplyModal(true); }}
            onCloseApply={() => { setShowApplyModal(false); setSelectedScholarship(null); }}
            showToast={showToast}
            onApplicationSubmitted={fetchStudentApplications}
          />
        );
      case 'applications':
        return (
          <>
            <ApplicationsView
              loading={loading}
              applications={studentApplications}
              applicationHistory={applicationHistory}
              applicationsTab={applicationsTab}
              setApplicationsTab={setApplicationsTab}
              historyStatusFilter={historyStatusFilter}
              setHistoryStatusFilter={setHistoryStatusFilter}
              historyScholarshipFilter={historyScholarshipFilter}
              setHistoryScholarshipFilter={setHistoryScholarshipFilter}
              historyDateFrom={historyDateFrom}
              setHistoryDateFrom={setHistoryDateFrom}
              historyDateTo={historyDateTo}
              setHistoryDateTo={setHistoryDateTo}
              onViewDetails={(app) => { setSelectedApplicationDetail(app); setAppDetailsModalVisible(true); }}
              onBrowseScholarships={() => setActiveView('scholarships')}
            />
            <ApplicationDetailsModal
              isOpen={appDetailsModalVisible}
              application={selectedApplicationDetail}
              onClose={() => { setAppDetailsModalVisible(false); setSelectedApplicationDetail(null); }}
            />
          </>
        );
      case 'grades':
        return (
          <GradesView
            loading={loading}
            currentList={currentList}
            average={average}
            totalUnits={totalUnits}
            gradeStatus={{ ...gradeStatus, passing: gradeStatus.color === 'green' }}
            allowGradeEdit={allowGradeEdit}
            hasUpdatedThisSemester={hasUpdatedThisSemester}
            editingGrades={editingGrades}
            setEditingGrades={setEditingGrades}
            recentHistory={recentHistory}
            expandedHistoryId={expandedHistoryId}
            setExpandedHistoryId={setExpandedHistoryId}
            onSaveGrades={handleSaveGrades}
          />
        );
      case 'profile':
        return (
          <ProfileView
            loading={loading}
            studentData={studentData}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            onSaveProfile={handleSaveProfile}
            showChangePassword={showChangePassword}
            setShowChangePassword={setShowChangePassword}
            onChangePassword={handleChangePassword}
          />
        );
      default:
        return (
          <DashboardView
            loading={loading}
            studentData={studentData}
            scholarships={scholarships}
            applications={studentApplications}
            applicationHistory={applicationHistory}
            recentGrades={recentGrades}
            average={average}
            gradeStatus={{ ...gradeStatus, passing: gradeStatus.color === 'green' }}
            onViewScholarships={() => setActiveView('scholarships')}
            onViewApplications={() => setActiveView('applications')}
            onViewGrades={() => setActiveView('grades')}
          />
        );
    }
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        menuItems={menuItems}
        activeView={activeView}
        studentData={studentData}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onMenuClick={setActiveView}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <Header activeView={activeView} studentData={studentData} />

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

