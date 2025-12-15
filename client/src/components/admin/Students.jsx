import { useState, useEffect } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';

const Students = () => {
  const { toasts, showToast, hideToast } = useToast();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
const [isEditing, setIsEditing] = useState(false);
const [studentEditData, setStudentEditData] = useState({
        name: "",
        email: "",
        username: "",
        password: ""
    });

  useEffect(() => {
    fetchStudents();
  }, []);

  // Helpers
  const parseSubjects = (subjectsField) => {
    if (!subjectsField) return [];
    if (Array.isArray(subjectsField)) return subjectsField;
    try {
      const parsed = typeof subjectsField === 'string' ? JSON.parse(subjectsField) : subjectsField;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // fallback: try to coerce a JSON-like string (robustness)
      try {
        const cleaned = String(subjectsField).replace(/([\w\d]+)\s*:/g, '"$1":');
        const parsed = JSON.parse(cleaned);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e2) {
        return [];
      }
    }
  }

  const computeAverage = (subjects) => {
    const list = parseSubjects(subjects);
    if (!Array.isArray(list) || list.length === 0) return 'N/A';
    // collect numeric grades only
    const numericGrades = list.map(s => {
      if (s == null) return NaN;
      // grade may be in property 'grade' or 'score'
      const raw = s.grade ?? s.score ?? s.value ?? s;
      if (typeof raw === 'number') return raw;
      if (typeof raw === 'string') {
        const cleaned = raw.replace(',', '.').trim();
        const n = parseFloat(cleaned);
        return isFinite(n) ? n : NaN;
      }
      return NaN;
    }).filter(n => !isNaN(n));

    if (numericGrades.length === 0) return 'N/A';
    const total = numericGrades.reduce((a,b)=>a+b, 0);
    const avg = total / numericGrades.length;
    return avg.toFixed(2);
  }

  const fetchStudents = async () => {
    try {
      const res = await API.get('/students/student_list');
      const result = res.data;
        setStudents(result || []);
        
    } catch (err) {
      console.error('Error fetching students:', err);
      showToast('Failed to load students', 'error');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterGrade === 'All') return matchesSearch;
    
    const average = computeAverage(student.subjects);
    const avgNum = average === 'N/A' ? NaN : parseFloat(average);
    
    if (filterGrade === 'Passing') {
      return matchesSearch && (isFinite(avgNum) ? (avgNum >= 10 ? avgNum >= 85 : avgNum <= 2.0) : false);
    } else if (filterGrade === 'Failing') {
      return matchesSearch && (isFinite(avgNum) ? (avgNum >= 10 ? avgNum < 85 : avgNum > 2.0) : false);
    }
    
    return matchesSearch;
  });

  const handleView = (student) => {
    setSelectedStudent(student);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (student) => {
      setSelectedStudent(student);
      setStudentEditData({
          name: student.name,
          email: student.email,
          username: student.username,
          password: ""
      });

    setIsEditing(true);
    setShowModal(true);
    };

    const hanleInput = (e) => {
        const { name, value } = e.target;
        setStudentEditData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const editStudent = async (e) => {
        e.preventDefault();

        const isFilled = Object.keys(studentEditData).every(key => (
            studentEditData[key] !== "" && studentEditData[key] !== null && studentEditData !== undefined
        ));


        if (!isFilled) {
            showToast("Fill up all fields", "warning");
            return;
        }

        try {
            const res = await API.put(`/students/edit/${selectedStudent.id}`, studentEditData);
            const result = res.data;
            if (result.success) {
                showToast(result.message, "success");
                handleCloseModal();
                return;
            }

            showToast(result.message, "error");
        } catch (err) {
            console.log(err.message);
        }
    }

  const handleDelete = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const res = await API.delete(`/students/${studentId}`);
      if (res.data.success) {
        showToast('Student deleted successfully', 'success');
        fetchStudents();
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      showToast('Failed to delete student', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setIsEditing(false);
  };

  const calculateStats = () => {
    const totalStudents = students.length;
    const passingStudents = students.filter(s => {
      const average = computeAverage(s.subjects);
      const numAvg = average === 'N/A' ? NaN : parseFloat(average);
      return isFinite(numAvg) ? (numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0) : false;
    }).length;
    
    const thisWeek = students.filter(s => {
      const createdDate = new Date(s.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    }).length;

    return { totalStudents, passingStudents, failingStudents: totalStudents - passingStudents, thisWeek };
  };

  const stats = calculateStats();

  const statsCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: '👨‍🎓', color: 'bg-green-900', change: '+12%' },
    { title: 'Passing', value: stats.passingStudents, icon: '✅', color: 'bg-green-800', change: '+8%' },
    { title: 'Failing', value: stats.failingStudents, icon: '❌', color: 'bg-red-900', change: '-5%' },
    { title: 'New This Week', value: stats.thisWeek, icon: '📈', color: 'bg-blue-900', change: '+15%' },
  ];

  return (
    <AdminLayout activeMenu="students" title="Students" subtitle="Manage student records and information">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statsCards.map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-xl p-6 border border-green-700`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  stat.change.startsWith('+') ? 'bg-green-600' : 'bg-red-600'
                } text-white`}>
                  {stat.change}
                </span>
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

            {/* Grade Filter */}
            <div className="md:w-64">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="All">All Students</option>
                <option value="Passing">Passing (≥85 or ≤2.0)</option>
                <option value="Failing">Failing (&lt;85 or &gt;2.0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-green-900 rounded-xl shadow-2xl border border-green-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-800">
                <tr>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">ID</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Student Name</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Subjects</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Average</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Date Approve</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const average = computeAverage(student.subjects);
                    const numAvg = average === 'N/A' ? NaN : parseFloat(average);
                    const isPassing = (average !== 'N/A') && (numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0);

                    return (
                      <tr key={student.id} className="border-t border-green-800 hover:bg-green-800/50 transition-colors">
                        <td className="py-4 px-6 text-green-200 font-mono">#{student.id}</td>
                        <td className="py-4 px-6 text-green-50 font-medium">{student.name}</td>
                        <td className="py-4 px-6 text-green-200">{student.email}</td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-green-700 text-green-100 rounded-full text-sm">
                            {Array.isArray(parseSubjects(student.subjects)) ? parseSubjects(student.subjects).length : 0} {Array.isArray(parseSubjects(student.subjects)) && parseSubjects(student.subjects).length === 1 ? 'subject' : 'subjects'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-lg font-semibold text-green-50">{average}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isPassing ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {new Intl.DateTimeFormat("en-US", {month: "long", day: "2-digit", year: "numeric"}).format(new Date(student.created_at))}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(student)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(student)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-colors text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 px-6 text-center text-green-300">
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
            Showing {filteredStudents.length} of {students.length} students
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-800 text-green-200 rounded-lg hover:bg-green-700 transition-colors border border-green-600">
              Previous
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
              1
            </button>
            <button className="px-4 py-2 bg-green-800 text-green-200 rounded-lg hover:bg-green-700 transition-colors border border-green-600">
              Next
            </button>
          </div>
        </div>

        {/* View/Edit Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 backdrop-blur-sm bg-green-900/30 flex items-center justify-center z-50 p-4">
            <div className="bg-green-900 rounded-2xl shadow-2xl border border-green-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-green-800 p-6 border-b border-green-700 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-green-50">
                    {isEditing ? 'Edit Student' : 'Student Details'}
                  </h3>
                  <p className="text-green-300 text-sm">
                    {isEditing ? 'Update student information' : 'Complete student information'}
                  </p>
                </div>  
                <button
                  onClick={handleCloseModal}
                  className="text-green-300 hover:text-white text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Student Info */}
                <form onSubmit={editStudent}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-800 p-4 rounded-lg">
                        <p className="text-green-400 text-sm font-medium mb-1">Student ID</p>
                        <p className="text-green-50 text-lg font-mono">#{selectedStudent.id}</p>
                    </div>
                    <div className="bg-green-800 p-4 rounded-lg">
                        <p className="text-green-400 text-sm font-medium mb-1">Student Name</p>
                        {isEditing ? (
                        <input
                                                  type="text"
                                                  name='name'
                                                  onChange={hanleInput}
                            defaultValue={selectedStudent.name}
                            className="w-full px-3 py-2 bg-green-900 text-green-50 rounded border border-green-600"
                        />
                        ) : (
                        <p className="text-green-50 text-lg font-semibold">{selectedStudent.name}</p>
                        )}
                    </div>
                    <div className="bg-green-800 p-4 rounded-lg">
                        <p className="text-green-400 text-sm font-medium mb-1">Email Address</p>
                        {isEditing ? (
                        <input
                                                  type="email"
                                                  name='email'
                                                  onChange={hanleInput}
                            defaultValue={selectedStudent.email}
                            className="w-full px-3 py-2 bg-green-900 text-green-50 rounded border border-green-600"
                        />
                        ) : (
                        <p className="text-green-50 text-lg">{selectedStudent.email}</p>
                        )}
                    </div>
                    <div className="bg-green-800 p-4 rounded-lg">
                        <p className="text-green-400 text-sm font-medium mb-1">Registration Date</p>
                        <p className="text-green-50 text-lg">
                        {new Date(selectedStudent.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                        </p>
                    </div>
                    <div className="bg-green-800 p-4 rounded-lg">
                        <p className="text-green-400 text-sm font-medium mb-1">Username</p>
                        {isEditing ? (
                        <input
                                                  type="text"
                                                  name='username'
                                                  onChange={hanleInput}
                            defaultValue={selectedStudent.username}
                            className="w-full px-3 py-2 bg-green-900 text-green-50 rounded border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="Enter username"
                        />
                        ) : (
                        <p className="text-green-50 text-lg font-mono">{selectedStudent.username || 'N/A'}</p>
                        )}
                    </div>
                    <div className="bg-green-800 p-4 rounded-lg">
                        <p className="text-green-400 text-sm font-medium mb-1">Password</p>
                        {isEditing ? (
                        <input
                            type="password"
                                                  name='password'
                                                  onChange={hanleInput}
                            placeholder="Enter new password (leave blank to keep)"
                            className="w-full px-3 py-2 bg-green-900 text-green-50 rounded border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        ) : (
                        <p className="text-green-50 text-lg">••••••••</p>
                        )}
                    </div>
                    </div>
                

                {/* Subjects & Grades */}
                <div className="bg-green-800 p-6 rounded-lg">
                  <h4 className="text-green-50 text-xl font-bold mb-4">Subjects & Grades</h4>
                  {(() => {
                    const subjects = parseSubjects(selectedStudent.subjects);
                    const average = computeAverage(selectedStudent.subjects);
                    const numAvg = average === 'N/A' ? NaN : parseFloat(average);
                    const isPassing = average !== 'N/A' && (numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0);

                    return (
                      <>
                        {subjects.length > 0 ? (
                          <div className="space-y-3">
                            {subjects.map((subj, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-green-900 p-4 rounded-lg">
                                <span className="text-green-100 font-medium">{subj.subject}</span>
                                <span className="text-green-50 text-lg font-bold bg-green-700 px-4 py-1 rounded">
                                  {subj.grade ?? subj.score ?? subj.value ?? ''}
                                </span>
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
                                  isPassing ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                }`}>
                                  {average === 'N/A' ? 'N/A' : (isPassing ? 'PASSED' : 'FAILED')}
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
                    {isEditing ? 'Cancel' : 'Close'}
                  </button>
                  {isEditing && (
                    <button
                      type='submit'
                      className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
                </form>
                              
              </div>
            </div>
          </div>
        )}
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
    </AdminLayout>
  );
};

export default Students;
