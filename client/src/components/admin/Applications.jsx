import { useState, useEffect } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { ClipboardIcon, HourglassIcon, SuccessIcon, BookIcon, CloseIcon, ArrowRightIcon } from '../shared/Icons';

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-600 text-white';
      case 'Pending': return 'bg-yellow-600 text-white';
      case 'Under Review': return 'bg-blue-600 text-white';
      case 'Rejected': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const stats = [
    { title: 'Total Students', value: applications.length, icon: <ClipboardIcon className="w-8 h-8 text-green-200" />, color: 'bg-green-900' },
    { title: 'This Week', value: applications.filter(a => {
      const createdDate = new Date(a.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    }).length, icon: <HourglassIcon className="w-8 h-8 text-yellow-200" />, color: 'bg-yellow-900' },
    { title: 'This Month', value: applications.filter(a => {
      const createdDate = new Date(a.created_at);
      return createdDate.getMonth() === new Date().getMonth();
    }).length, icon: <SuccessIcon className="w-8 h-8 text-green-200" />, color: 'bg-green-800' },
    { title: 'With Subjects', value: applications.filter(a => a.subjects && JSON.parse(a.subjects).length > 0).length, icon: <BookIcon className="w-8 h-8 text-blue-200" />, color: 'bg-blue-900' },
  ];

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
      <div className="max-w-7xl mx-auto">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-xl p-6 border border-green-700`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <h3 className="text-green-300 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-green-50">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-green-900 rounded-xl p-6 border border-green-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-400"
              />
            </div>


          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-green-900 rounded-xl shadow-2xl border border-green-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-800">
                <tr>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Student Name</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Subjects</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Total Units</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Status</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Average Grade</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Registered Date</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Action</th>
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
                    
                    // Calculate average grade - handles both percentage (90) and grade point (2.0) formats
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
                    const getGradeColor = (avg) => {
                      if (avg === 'N/A') return 'text-gray-400';
                      const numAvg = parseFloat(avg);
                      
                      // Check if it's percentage (85-100) or grade point (1.0-5.0)
                      if (numAvg >= 10) {
                        // Percentage scale
                        if (numAvg >= 95) return 'text-green-400 font-bold';
                        if (numAvg >= 90) return 'text-green-300';
                        if (numAvg >= 85) return 'text-yellow-400';
                        if (numAvg >= 80) return 'text-orange-400';
                        return 'text-red-400';
                      } else {
                        // Grade point scale (1.0 is highest)
                        if (numAvg <= 1.5) return 'text-green-400 font-bold';
                        if (numAvg <= 2.0) return 'text-green-300';
                        if (numAvg <= 2.5) return 'text-yellow-400';
                        if (numAvg <= 3.0) return 'text-orange-400';
                        return 'text-red-400';
                      }
                    };
                    
                    return (
                      <tr key={app.id} className="border-t border-green-800 hover:bg-green-800/50 transition-colors">
                        <td className="py-4 px-6 text-green-50 font-medium">{app.student_name}</td>
                        <td className="py-4 px-6 text-green-200">{app.email}</td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {subjects.length > 0 ? (
                              subjects.slice(0, 3).map((subj, idx) => (
                                <span key={idx} className="px-2 py-1 bg-green-700 text-green-100 rounded text-xs">
                                  {subj.subject}: {subj.grade} <span className="text-green-200">({subj.unit}u)</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-green-400 text-sm">No subjects</span>
                            )}
                            {subjects.length > 3 && (
                              <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                                +{subjects.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Total Units */}
                        <td className="py-4 px-6 text-green-200 font-bold">
                          {subjects.length > 0 ? subjects.reduce((sum, subj) => sum + (parseFloat(subj.unit) || 0), 0) : 0}
                        </td>
                        {/* Regular/Irregular Status */}
                        <td className="py-4 px-6">
                          {(() => {
                            const totalUnits = subjects.length > 0 ? subjects.reduce((sum, subj) => sum + (parseFloat(subj.unit) || 0), 0) : 0;
                            if (totalUnits >= 24) {
                              return <span className="px-3 py-1 rounded bg-green-600 text-white text-xs font-bold">Regular</span>;
                            } else {
                              return <span className="px-3 py-1 rounded bg-yellow-500 text-white text-xs font-bold">Irregular</span>;
                            }
                          })()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-semibold ${getGradeColor(averageGrade)}`}>
                              {averageGrade === 'N/A' ? 'N/A' : averageGrade}
                            </span>
                            {averageGrade !== 'N/A' && (
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                (() => {
                                  const numAvg = parseFloat(averageGrade);
                                  const isPassing = numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0;
                                  return isPassing ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
                                })()
                              }`}>
                                {(() => {
                                  const numAvg = parseFloat(averageGrade);
                                  const isPassing = numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0;
                                  return isPassing ? 'PASS' : 'FAIL';
                                })()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-green-200">{formattedDate}</td>
                        <td className="py-4 px-6">
                          <button 
                            onClick={() => handleView(app)}
                            className="text-green-400 hover:text-green-200 font-medium transition-colors flex items-center gap-2"
                          >
                            <span>View</span>
                            <ArrowRightIcon className="w-4 h-4 text-green-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 px-6 text-center text-green-300">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <p className="text-green-200 text-sm">
            Showing {filteredApplications.length} of {applications.length} students
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-800 text-green-200 rounded-lg hover:bg-green-700 transition-colors border border-green-600">
              Previous
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
              1
            </button>
            <button className="px-4 py-2 bg-green-800 text-green-200 rounded-lg hover:bg-green-700 transition-colors border border-green-600">
              2
            </button>
            <button className="px-4 py-2 bg-green-800 text-green-200 rounded-lg hover:bg-green-700 transition-colors border border-green-600">
              Next
            </button>
          </div>
        </div>

        {/* Create Account Modal */}
        {showAccountModal && selectedStudent && (
          <div className="fixed inset-0 backdrop-blur-sm bg-green-900/30 flex items-center justify-center z-50 p-4">
            <div className="bg-green-900 rounded-2xl shadow-2xl border border-green-700 max-w-md w-full">
              {/* Modal Header */}
              <div className="bg-green-800 p-6 border-b border-green-700 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-green-50">Create Student Account</h3>
                  <p className="text-green-300 text-sm mt-1">Set up login credentials for {selectedStudent.student_name}</p>
                </div>
                <button
                  onClick={handleCloseAccountModal}
                  className="text-green-300 hover:text-white text-2xl font-bold transition-colors"
                  disabled={loading}
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Student Info Display */}
                <div className="bg-green-800 p-4 rounded-lg">
                  <p className="text-green-400 text-sm mb-1">Student Name</p>
                  <p className="text-green-50 text-lg font-semibold">{selectedStudent.student_name}</p>
                  <p className="text-green-300 text-sm mt-2">{selectedStudent.email}</p>
                </div>

                {/* Username Input */}
                <div>
                  <label className="block text-green-300 text-sm font-medium mb-2">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountData.username}
                    onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-400"
                    disabled={loading}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-green-300 text-sm font-medium mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountData.password}
                    readOnly
                    placeholder="Enter password (min. 6 characters)"
                    className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-400"
                    disabled={loading}
                  />
                  <p className="text-green-400 text-xs mt-1">Minimum 6 characters required</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseAccountModal}
                    className="flex-1 bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAccount}
                    className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Student Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 backdrop-blur-sm bg-green-900/30 flex items-center justify-center z-50 p-4">
            <div className="bg-green-900 rounded-2xl shadow-2xl border border-green-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-green-800 p-6 border-b border-green-700 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-green-50">Student Details</h3>
                  <p className="text-green-300 text-sm">Complete student information</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-green-300 hover:text-white text-2xl font-bold transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-800 p-4 rounded-lg">
                    <p className="text-green-400 text-sm font-medium mb-1">Student Name</p>
                    <p className="text-green-50 text-lg font-semibold">{selectedStudent.student_name}</p>
                  </div>
                  <div className="bg-green-800 p-4 rounded-lg">
                    <p className="text-green-400 text-sm font-medium mb-1">Email Address</p>
                    <p className="text-green-50 text-lg">{selectedStudent.email}</p>
                  </div>
                  <div className="bg-green-800 p-4 rounded-lg">
                    <p className="text-green-400 text-sm font-medium mb-1">Registration Date</p>
                    <p className="text-green-50 text-lg">
                      {new Date(selectedStudent.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="bg-green-800 p-4 rounded-lg">
                    <p className="text-green-400 text-sm font-medium mb-1">Student ID</p>
                    <p className="text-green-50 text-lg font-mono">#{selectedStudent.id}</p>
                  </div>
                </div>

                {/* Subjects & Grades */}
                <div className="bg-green-800 p-6 rounded-lg">
                  <h4 className="text-green-50 text-xl font-bold mb-4">Subjects & Grades</h4>
                  {(() => {
                    const subjects = selectedStudent.subjects ? JSON.parse(selectedStudent.subjects) : [];
                    const total = subjects.reduce((sum, subj) => sum + parseFloat(subj.grade || 0), 0);
                    const average = subjects.length > 0 ? (total / subjects.length).toFixed(2) : 'N/A';
                    return (
                      <>
                        {subjects.length > 0 ? (
                          <div className="space-y-3">
                            {subjects.map((subj, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-green-900 p-4 rounded-lg">
                                <span className="text-green-100 font-medium">{subj.subject}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-green-200 text-base font-semibold bg-green-800 px-3 py-1 rounded border border-green-700" title="Unit">
                                    {subj.unit ? `${subj.unit} unit${parseFloat(subj.unit) > 1 ? 's' : ''}` : '-'}
                                  </span>
                                  <span className="text-green-50 text-lg font-bold bg-green-700 px-4 py-1 rounded">
                                    {subj.grade}
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div className="mt-4 pt-4 border-t border-green-700">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-green-300 text-lg font-semibold">Average Grade:</span>
                                <span className="text-green-50 text-2xl font-bold">{average}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-green-300 text-lg font-semibold">Status:</span>
                                <span className={`px-4 py-2 rounded-lg text-lg font-bold ${
                                  (() => {
                                    const numAvg = parseFloat(average);
                                    const isPassing = numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0;
                                    return isPassing ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
                                  })()
                                }`}>
                                  {(() => {
                                    const numAvg = parseFloat(average);
                                    const isPassing = numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0;
                                    return isPassing ? 'PASSED' : 'FAILED';
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-green-400 text-center py-4">No subjects recorded</p>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
