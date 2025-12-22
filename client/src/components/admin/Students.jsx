import { useState, useEffect } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { UserIcon, SuccessIcon, ErrorIcon, ChartIcon, CloseIcon } from '../shared/Icons';

const Students = () => {
  const { toasts, showToast, hideToast } = useToast();
  const [students, setStudents] = useState([]);
  const [recentGradesMap, setRecentGradesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
const [isEditing, setIsEditing] = useState(false);
  const [studentRecentGrades, setStudentRecentGrades] = useState([]);
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [allowGradeEdit, setAllowGradeEdit] = useState(false);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);
  const [semesterInput, setSemesterInput] = useState('');
const [studentEditData, setStudentEditData] = useState({
        name: "",
        email: "",
        username: "",
        password: ""
    });

  useEffect(() => {
    fetchStudents();
    // prefetch recent grades snapshots for quick per-row summary
    (async () => {
      try {
        const r = await API.get('/admin/recent-grades');
        if (r.data && r.data.success) {
          const arr = Array.isArray(r.data.data) ? r.data.data : [];
          const map = {};
          arr.forEach(entry => {
            const sid = String(entry.id);
            if (!map[sid]) map[sid] = [];
            map[sid].push(entry);
          });
          // reduce to summary: count and latest (first) semester+average
          const summary = {};
          Object.keys(map).forEach(sid => {
            const list = map[sid];
            // list is in descending create_at order from server
            const latest = list[0];
            summary[sid] = {
              count: list.length,
              latestSemester: latest ? (latest.semester || '') : '',
              latestAverage: latest ? (latest.average || null) : null
            };
          });
          setRecentGradesMap(summary);
        }
      } catch (e) {
        console.warn('Failed to load recent grades summary', e && e.message ? e.message : e);
      }
    })();
    // fetch server-side setting
    (async () => {
      try {
        const res = await API.get('/settings/allow_grade_edit');
        if (res.data && res.data.success) {
          setAllowGradeEdit(!!res.data.value);
        }
      } catch (e) {
        // fallback to localStorage for compatibility
        try {
          const val = localStorage.getItem('allow_grade_edit') === 'true';
          setAllowGradeEdit(val);
        } catch (e2) {}
      }
    })();
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

  const handleView = async (student) => {
    setSelectedStudent(student);
    setIsEditing(false);
    setShowModal(true);
    try {
      const res = await API.get(`/admin/recent-grades/${student.id}`);
      if (res.data && res.data.success) {
        // res.data.data expected to be array of recent_grades for this student
        setStudentRecentGrades(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setStudentRecentGrades([]);
      }
    } catch (err) {
      console.error('Failed to fetch recent grades for student', err);
      setStudentRecentGrades([]);
    }
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
    setStudentRecentGrades([]);
    setExpandedSemesters({});
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
    { title: 'Total Students', value: stats.totalStudents, icon: <UserIcon className="w-8 h-8 text-green-200" />, color: 'bg-green-900', change: '+12%' },
    { title: 'Passing', value: stats.passingStudents, icon: <SuccessIcon className="w-8 h-8 text-green-200" />, color: 'bg-green-800', change: '+8%' },
    { title: 'Failing', value: stats.failingStudents, icon: <ErrorIcon className="w-8 h-8 text-red-200" />, color: 'bg-red-900', change: '-5%' },
    { title: 'New This Week', value: stats.thisWeek, icon: <ChartIcon className="w-8 h-8 text-blue-200" />, color: 'bg-blue-900', change: '+15%' },
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

          {/* Enable student to edit grade */}
          <button
            onClick={async () => {
              const confirmMsg = allowGradeEdit ? 'Disable students from updating semester grades?' : 'Enable students to update semester grades?';
              if (!confirm(confirmMsg)) return;
              const next = !allowGradeEdit;

              if (next) {
                // show inline picker instead of prompt
                // preset to current year and nearest semester
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;
                const sem = month >= 7 ? 'S2' : 'S1';
                setSemesterInput(`${year}-${sem}`);
                setShowSemesterPicker(true);
                return;
              }

              // disabling: call API directly
              try {
                const res = await API.put('/settings/allow_grade_edit', { value: next });
                if (res.data && res.data.success) {
                  setAllowGradeEdit(next);
                  try { localStorage.setItem('allow_grade_edit', next ? 'true' : 'false'); } catch (e) {}
                  showToast(next ? 'Students can now update semester grades' : 'Students can no longer update semester grades', next ? 'success' : 'warning');
                } else {
                  showToast(res.data?.message || 'Failed to update setting', 'error');
                }
              } catch (err) {
                console.error('Failed to update setting', err);
                showToast('Failed to update setting', 'error');
              }
            }}
            className='bg-green-600 p-2 rounded-lg text-white font-bold hover:bg-green-500'
          >
            {allowGradeEdit ? 'Disable student update' : 'Enable student to Update sem grades'}
          </button>

          {showSemesterPicker && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h4 className="text-lg font-semibold mb-3">Select Semester to Enable</h4>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={semesterInput.split('-')[0] || ''}
                    onChange={(e) => {
                      const yr = String(e.target.value || '').slice(0,4);
                      const part = semesterInput.split('-')[1] || 'S1';
                      setSemesterInput(`${yr}-${part}`);
                    }}
                    className="px-3 py-2 border rounded"
                    placeholder="Year (e.g. 2025)"
                  />
                  <select value={semesterInput.split('-')[1] || 'S1'} onChange={(e)=>{
                    const yr = semesterInput.split('-')[0] || new Date().getFullYear();
                    setSemesterInput(`${yr}-${e.target.value}`);
                  }} className="px-3 py-2 border rounded">
                    <option value="S1">S1 (1st Sem)</option>
                    <option value="S2">S2 (2nd Sem)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowSemesterPicker(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                  <button onClick={async () => {
                    const sem = String(semesterInput || '').trim();
                    if (!/^[0-9]{4}-S[12]$/.test(sem)) {
                      showToast('Invalid semester. Use format YYYY-S1 or YYYY-S2', 'error');
                      return;
                    }
                    try {
                      const res = await API.put('/settings/allow_grade_edit', { value: true, semester: sem });
                      if (res.data && res.data.success) {
                        setAllowGradeEdit(true);
                        try { localStorage.setItem('allow_grade_edit', 'true'); } catch (e) {}
                        showToast('Students can now update semester grades', 'success');
                        setShowSemesterPicker(false);
                      } else {
                        showToast(res.data?.message || 'Failed to update setting', 'error');
                      }
                    } catch (err) {
                      console.error('Failed to update setting', err);
                      showToast('Failed to update setting', 'error');
                    }
                  }} className="px-4 py-2 bg-green-600 text-white rounded">Enable</button>
                </div>
              </div>
            </div>
          )}
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
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Status</th>
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
                        {/* Status column */}
                        <td className="py-4 px-6">
                          {(() => {
                            const subjects = parseSubjects(student.subjects);
                            const totalUnits = subjects.length > 0 ? subjects.reduce((sum, subj) => sum + (parseFloat(subj.unit) || 0), 0) : 0;
                            if (totalUnits >= 24) {
                              return <span className="px-3 py-1 rounded bg-green-600 text-white text-xs font-bold">Regular</span>;
                            } else {
                              return <span className="px-3 py-1 rounded bg-yellow-500 text-white text-xs font-bold">Irregular</span>;
                            }
                          })()}
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
                  aria-label="Close"
                >
                  <CloseIcon className="w-5 h-5" />
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
                                <div className="flex items-center gap-4">
                                  <span className="text-green-200 text-base font-semibold bg-green-800 px-3 py-1 rounded border border-green-700" title="Unit">
                                    {subj.unit ? `${subj.unit} unit${parseFloat(subj.unit) > 1 ? 's' : ''}` : '-'}
                                  </span>
                                  <span className="text-green-50 text-lg font-bold bg-green-700 px-4 py-1 rounded">
                                    {subj.grade ?? subj.score ?? subj.value ?? ''}
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

                {/* Recent Grades By Semester (admin view) - placed after Subjects & Grades */}
                <div className="bg-green-800 p-6 rounded-lg">
                  <h4 className="text-green-50 text-xl font-bold mb-4">Recent Grades (by Semester)</h4>
                  {studentRecentGrades.length === 0 ? (
                    <p className="text-green-400 text-sm">No recent grade snapshots available for this student.</p>
                  ) : (
                    (() => {
                      const groups = {};
                      studentRecentGrades.forEach(entry => {
                        const sem = entry.semester || 'Unspecified';
                        if (!groups[sem]) groups[sem] = [];
                        groups[sem].push(entry);
                      });

                      const semesters = Object.keys(groups).sort().reverse();

                      return (
                        <div className="space-y-3">
                          {semesters.map((sem) => {
                            const items = groups[sem];
                            const latest = items[0];
                            const avg = latest && (latest.average || null);
                            const expanded = !!expandedSemesters[sem];
                            return (
                              <div key={sem} className="bg-green-900 p-3 rounded">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-green-100">{sem}</div>
                                    <div className="text-sm text-green-300">Snapshots: {items.length} {avg ? `— Avg: ${avg}` : ''}</div>
                                  </div>
                                  <div>
                                    <button type="button" onClick={() => setExpandedSemesters(prev => ({ ...prev, [sem]: !prev[sem] }))} className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                                      {expanded ? 'Hide' : 'Details'}
                                    </button>
                                  </div>
                                </div>
                                {expanded && (
                                  <div className="mt-3 space-y-2">
                                    {items.map((entry, idx) => {
                                      let subs = [];
                                      try { subs = typeof entry.grades === 'string' ? JSON.parse(entry.grades) : entry.grades; } catch (e) { subs = []; }
                                      const created = entry.create_at ? new Date(entry.create_at).toLocaleString() : '';
                                      return (
                                        <div key={entry.recent_grade_id || idx} className="bg-green-800 p-3 rounded">
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <div className="text-sm text-green-200">Snapshot date: {created}</div>
                                              <div className="text-sm text-green-300">Subjects: {Array.isArray(subs) ? subs.length : 0} — Average: {entry.average ?? 'N/A'}</div>
                                            </div>
                                          </div>
                                          <div className="mt-2">
                                            <ul className="space-y-2">
                                              {Array.isArray(subs) && subs.map((s, si) => (
                                                <li key={si} className="flex items-center justify-between bg-green-900 p-2 rounded">
                                                  <div className="text-green-100">{s.subject || s.name || 'Subject'}</div>
                                                  <div className="text-green-200">Units: {s.unit || '-'}</div>
                                                  <div className="text-green-50 font-bold">{s.grade ?? s.score ?? s.value ?? '-'}</div>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
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
