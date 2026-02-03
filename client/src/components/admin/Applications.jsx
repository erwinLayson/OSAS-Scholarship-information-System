import { useState, useEffect } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { StatCard, Card, Badge, Button, Modal } from '../shared/ui';
import { ClipboardIcon, HourglassIcon, SuccessIcon, BookIcon, SearchIcon, EyeIcon, CheckCircleIcon, CloseIcon as XCircleIcon } from '../shared/Icons';

const Applications = () => {
    const [applications, setApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [accountData, setAccountData] = useState({ username: '', password: '123456' });
    const [loading, setLoading] = useState(false);
    const { toasts, showToast, hideToast } = useToast();
    
    const [createdStudent, setCreatedStudent] = useState(null);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleView = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    };
    
    const handleReject = async () => {
        setLoading(true);
        try {
            const response = await API.post('/students/reject', {email: selectedStudent.email});
            const result = response.data;
            
            if (!result.success) {
                showToast(result.message, 'error');
                setLoading(false);
                return;
            }

            // Remove the student from the applications array
            setApplications(prevApps => prevApps.filter(student => student.id !== selectedStudent.id));
            
            showToast(result.message, 'success');
            handleCloseModal();
        } catch (error) {
            console.error('Error rejecting student:', error);
            showToast(error.response?.data?.message || 'Failed to reject student', 'error');
        } finally {
            setLoading(false);
        }
    }

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleApprove = () => {
    setShowModal(false);
    setShowAccountModal(true);
    setAccountData({ username: '', password: '123456' });
  };

  const handleCloseAccountModal = () => {
    setShowAccountModal(false);
    setAccountData({ username: '', password: '123456' });
    setSelectedStudent(null);
  };
// create student account
    const handleCreateAccount = async () => {
      const student = applications.find(s => s.id === selectedStudent.id);
      
      if (!accountData.username || !accountData.password) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      if (accountData.password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }

      setLoading(true);
      try {
        const newStudent = { 
          studentData: student, 
          studentAccount: accountData 
        };

        setCreatedStudent(newStudent);
        const response = await API.post("/students/create", newStudent);
          
          const result = response.data;
          
          if (!result.success) {
              showToast(result.message)
              return;
        }
        
        showToast(result.message);
          handleCloseAccountModal();
          setApplications((prev) => prev.filter(student => student.id !== selectedStudent.id));
      } catch (error) {
        console.error('Error creating account:', error);
        showToast(error.response?.data?.message || 'Failed to create account', 'error');
      } finally {
        setLoading(false);
      }
    };

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Under Review': return 'info';
      case 'Rejected': return 'error';
      default: return 'info';
    }
  };

    useEffect(() => {
            (async () => {
                try {
                    const res = await API.get('/admin/applicants');
                    const result = res.data;
                    console.log('Students data:', result);
                    setApplications(result || []);
                } catch (err) {
                    console.error('Error fetching students:', err);
                    setApplications([]);
                }
            })();
    }, [])

    
  return (
    <AdminLayout activeMenu="applications" title="Applications" subtitle="Manage scholarship applications">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applicants"
            value={applications.length}
            icon={<ClipboardIcon size="1.5rem" />}
            color="blue"
          />
          <StatCard
            title="This Week"
            value={applications.filter(a => {
              const createdDate = new Date(a.created_at);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return createdDate >= weekAgo;
            }).length}
            icon={<HourglassIcon size="1.5rem" />}
            color="amber"
          />
          <StatCard
            title="This Month"
            value={applications.filter(a => {
              const createdDate = new Date(a.created_at);
              return createdDate.getMonth() === new Date().getMonth();
            }).length}
            icon={<SuccessIcon size="1.5rem" />}
            color="emerald"
          />
          <StatCard
            title="With Subjects"
            value={applications.filter(a => a.subjects && JSON.parse(a.subjects).length > 0).length}
            icon={<BookIcon size="1.5rem" />}
            color="purple"
          />
        </div>

        {/* Filters and Search */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon size="1.25rem" />
              </div>
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
              />
            </div>
          </div>
        </Card>

        {/* Applications Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Student Name</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Email</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Subjects</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Total Units</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Status</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Average Grade</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Registered Date</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => {
                    const subjects = app.subjects ? JSON.parse(app.subjects) : [];
                    const formattedDate = new Date(app.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    
                    const calculateAverage = () => {
                      if (subjects.length === 0) return 'N/A';
                      const total = subjects.reduce((sum, subj) => {
                        const gradeValue = parseFloat(subj.grade) || 0;
                        return sum + gradeValue;
                      }, 0);
                      const average = total / subjects.length;
                      return average.toFixed(2);
                    };
                    
                    const averageGrade = calculateAverage();
                    const totalUnits = subjects.length > 0 ? subjects.reduce((sum, subj) => sum + (parseFloat(subj.unit) || 0), 0) : 0;
                    
                    const getGradeColor = (avg) => {
                      if (avg === 'N/A') return 'text-gray-400';
                      const numAvg = parseFloat(avg);
                      if (numAvg >= 10) {
                        if (numAvg >= 90) return 'text-emerald-600';
                        if (numAvg >= 85) return 'text-emerald-500';
                        return 'text-red-500';
                      } else {
                        if (numAvg <= 1.5) return 'text-emerald-600';
                        if (numAvg <= 2.0) return 'text-emerald-500';
                        return 'text-red-500';
                      }
                    };
                    
                    const isPassing = () => {
                      if (averageGrade === 'N/A') return false;
                      const numAvg = parseFloat(averageGrade);
                      return numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0;
                    };
                    
                    return (
                      <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 text-gray-900 font-medium">{app.student_name}</td>
                        <td className="py-4 px-4 text-gray-600">{app.email}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {subjects.length > 0 ? (
                              <>
                                {subjects.slice(0, 2).map((subj, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {subj.subject}: {subj.grade}
                                  </span>
                                ))}
                                {subjects.length > 2 && (
                                  <Badge variant="info">+{subjects.length - 2}</Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">No subjects</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900 font-semibold">{totalUnits}</td>
                        <td className="py-4 px-4">
                          <Badge variant={totalUnits >= 24 ? 'success' : 'warning'}>
                            {totalUnits >= 24 ? 'Regular' : 'Irregular'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-semibold ${getGradeColor(averageGrade)}`}>
                              {averageGrade}
                            </span>
                            {averageGrade !== 'N/A' && (
                              <Badge variant={isPassing() ? 'success' : 'error'}>
                                {isPassing() ? 'PASS' : 'FAIL'}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{formattedDate}</td>
                        <td className="py-4 px-4">
                          <button 
                            onClick={() => handleView(app)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon size="1.125rem" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 px-4 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardIcon size="2rem" />
                        <p>No applications found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              Showing {filteredApplications.length} of {applications.length} applicants
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Previous</Button>
              <Button size="sm">1</Button>
              <Button variant="secondary" size="sm">Next</Button>
            </div>
          </div>
        </Card>

        {/* Create Account Modal */}
        <Modal
          isOpen={showAccountModal && selectedStudent}
          onClose={handleCloseAccountModal}
          title="Create Student Account"
          size="md"
        >
          {selectedStudent && (
            <div className="space-y-4">
              {/* Student Info Display */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-emerald-700 text-sm mb-1">Student Name</p>
                <p className="text-gray-900 text-lg font-semibold">{selectedStudent.student_name}</p>
                <p className="text-gray-600 text-sm mt-2">{selectedStudent.email}</p>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountData.username}
                  onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                  placeholder="Enter username"
                  className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountData.password}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg"
                  disabled={loading}
                />
                <p className="text-gray-500 text-xs mt-1">Default password: 123456</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={handleCloseAccountModal}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAccount}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* View Student Modal */}
        <Modal
          isOpen={showModal && selectedStudent}
          onClose={handleCloseModal}
          title="Student Details"
          size="lg"
        >
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Student Name</p>
                  <p className="text-gray-900 text-lg font-semibold">{selectedStudent.student_name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Email Address</p>
                  <p className="text-gray-900 text-lg">{selectedStudent.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Registration Date</p>
                  <p className="text-gray-900 text-lg">
                    {new Date(selectedStudent.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Application ID</p>
                  <p className="text-gray-900 text-lg font-mono">#{selectedStudent.id}</p>
                </div>
              </div>

              {/* Subjects & Grades */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-gray-900 text-lg font-bold mb-4">Subjects & Grades</h4>
                {(() => {
                  const subjects = selectedStudent.subjects ? JSON.parse(selectedStudent.subjects) : [];
                  const total = subjects.reduce((sum, subj) => sum + parseFloat(subj.grade || 0), 0);
                  const average = subjects.length > 0 ? (total / subjects.length).toFixed(2) : 'N/A';
                  const numAvg = parseFloat(average);
                  const isPassing = average !== 'N/A' && (numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0);
                  
                  return (
                    <>
                      {subjects.length > 0 ? (
                        <div className="space-y-3">
                          {subjects.map((subj, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100">
                              <span className="text-gray-900 font-medium">{subj.subject}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
                                  {subj.unit ? `${subj.unit} unit${parseFloat(subj.unit) > 1 ? 's' : ''}` : '-'}
                                </span>
                                <span className="text-gray-900 text-lg font-bold bg-emerald-50 text-emerald-700 px-4 py-1 rounded-lg">
                                  {subj.grade}
                                </span>
                              </div>
                            </div>
                          ))}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-600 text-lg font-semibold">Average Grade:</span>
                              <span className="text-gray-900 text-2xl font-bold">{average}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 text-lg font-semibold">Status:</span>
                              <Badge variant={isPassing ? 'success' : 'error'} className="text-lg px-4 py-2">
                                {average === 'N/A' ? 'N/A' : (isPassing ? 'PASSED' : 'FAILED')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center py-4">No subjects recorded</p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </Modal>

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
    </AdminLayout>
  );
};

export default Applications;
