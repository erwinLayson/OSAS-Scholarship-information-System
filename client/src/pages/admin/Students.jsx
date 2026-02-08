import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/shared/Toast';
import { StatCard, Card, Badge, Button, Modal, Input } from '../../components/shared/ui';
import { UserIcon, SuccessIcon, ErrorIcon, ChartIcon, CloseIcon, SearchIcon, EyeIcon, EditIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '../../components/shared/Icons';

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

  return (
    <AdminLayout activeMenu="students" title="Students" subtitle="Manage student records and information">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<UserIcon size="1.5rem" />}
            color="blue"
          />
          <StatCard
            title="Passing"
            value={stats.passingStudents}
            icon={<SuccessIcon size="1.5rem" />}
            color="emerald"
          />
          <StatCard
            title="Failing"
            value={stats.failingStudents}
            icon={<ErrorIcon size="1.5rem" />}
            color="red"
          />
          <StatCard
            title="New This Week"
            value={stats.thisWeek}
            icon={<ChartIcon size="1.5rem" />}
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

            {/* Grade Filter */}
            <div className="md:w-64">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="All">All Students</option>
                <option value="Passing">Passing (≥85 or ≤2.0)</option>
                <option value="Failing">Failing (&lt;85 or &gt;2.0)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Students Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">ID</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Student Name</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Email</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Subjects</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Status</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Average</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Date Approved</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const average = computeAverage(student.subjects);
                    const numAvg = average === 'N/A' ? NaN : parseFloat(average);
                    const isPassing = (average !== 'N/A') && (numAvg >= 10 ? numAvg >= 85 : numAvg <= 2.0);
                    const subjects = parseSubjects(student.subjects);
                    const totalUnits = subjects.length > 0 ? subjects.reduce((sum, subj) => sum + (parseFloat(subj.unit) || 0), 0) : 0;

                    return (
                      <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 text-gray-500 font-mono text-sm">#{student.id}</td>
                        <td className="py-4 px-4 text-gray-900 font-medium">{student.name}</td>
                        <td className="py-4 px-4 text-gray-600">{student.email}</td>
                        <td className="py-4 px-4">
                          <Badge variant="info">
                            {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={totalUnits >= 24 ? 'success' : 'warning'}>
                            {totalUnits >= 24 ? 'Regular' : 'Irregular'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-lg font-semibold ${isPassing ? 'text-emerald-600' : 'text-red-600'}`}>
                            {average}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {new Intl.DateTimeFormat("en-US", {month: "short", day: "2-digit", year: "numeric"}).format(new Date(student.created_at))}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(student)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <EyeIcon size="1.125rem" />
                            </button>
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <EditIcon size="1.125rem" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <TrashIcon size="1.125rem" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 px-4 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <UserIcon size="2rem" />
                        <p>No students found</p>
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
              Showing {filteredStudents.length} of {students.length} students
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Previous</Button>
              <Button size="sm">1</Button>
              <Button variant="secondary" size="sm">Next</Button>
            </div>
          </div>
        </Card>

        {/* View/Edit Modal */}
        <Modal
          isOpen={showModal && selectedStudent}
          onClose={handleCloseModal}
          title={isEditing ? 'Edit Student' : 'Student Details'}
          size="lg"
        >
          {selectedStudent && (
            <form onSubmit={editStudent} className="space-y-6">
              {/* Student Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Student ID</p>
                  <p className="text-gray-900 text-lg font-mono">#{selectedStudent.id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Student Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name='name'
                      onChange={hanleInput}
                      defaultValue={selectedStudent.name}
                      className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg font-semibold">{selectedStudent.name}</p>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name='email'
                      onChange={hanleInput}
                      defaultValue={selectedStudent.email}
                      className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">{selectedStudent.email}</p>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Registration Date</p>
                  <p className="text-gray-900 text-lg">
                    {new Date(selectedStudent.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Username</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name='username'
                      onChange={hanleInput}
                      defaultValue={selectedStudent.username}
                      className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter username"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg font-mono">{selectedStudent.username || 'N/A'}</p>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-500 text-sm font-medium mb-1">Password</p>
                  {isEditing ? (
                    <input
                      type="password"
                      name='password'
                      onChange={hanleInput}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">••••••••</p>
                  )}
                </div>
              </div>

              {/* Subjects & Grades */}
              {!isEditing && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-gray-900 text-lg font-bold mb-4">Subjects & Grades</h4>
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
                              <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100">
                                <span className="text-gray-900 font-medium">{subj.subject}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
                                    {subj.unit ? `${subj.unit} unit${parseFloat(subj.unit) > 1 ? 's' : ''}` : '-'}
                                  </span>
                                  <span className="text-gray-900 text-lg font-bold bg-emerald-50 text-emerald-700 px-4 py-1 rounded-lg">
                                    {subj.grade ?? subj.score ?? subj.value ?? ''}
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
              )}

              {/* Recent Grades By Semester */}
              {!isEditing && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-gray-900 text-lg font-bold mb-4">Recent Grades (by Semester)</h4>
                  {studentRecentGrades.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No recent grade snapshots available.</p>
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
                              <div key={sem} className="bg-white p-4 rounded-lg border border-gray-100">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{sem}</div>
                                    <div className="text-sm text-gray-500">Snapshots: {items.length} {avg ? `— Avg: ${avg}` : ''}</div>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => setExpandedSemesters(prev => ({ ...prev, [sem]: !prev[sem] }))} 
                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                                  >
                                    {expanded ? (
                                      <>Hide <ChevronUpIcon size="1rem" /></>
                                    ) : (
                                      <>Details <ChevronDownIcon size="1rem" /></>
                                    )}
                                  </button>
                                </div>
                                {expanded && (
                                  <div className="mt-4 space-y-3">
                                    {items.map((entry, idx) => {
                                      let subs = [];
                                      try { subs = typeof entry.grades === 'string' ? JSON.parse(entry.grades) : entry.grades; } catch (e) { subs = []; }
                                      const created = entry.create_at ? new Date(entry.create_at).toLocaleString() : '';
                                      return (
                                        <div key={entry.recent_grade_id || idx} className="bg-gray-50 p-4 rounded-lg">
                                          <div className="flex items-start justify-between mb-3">
                                            <div>
                                              <div className="text-sm text-gray-600">Snapshot: {created}</div>
                                              <div className="text-sm text-gray-500">Subjects: {Array.isArray(subs) ? subs.length : 0} — Average: {entry.average ?? 'N/A'}</div>
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            {Array.isArray(subs) && subs.map((s, si) => (
                                              <div key={si} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                                                <span className="text-gray-900">{s.subject || s.name || 'Subject'}</span>
                                                <div className="flex items-center gap-4">
                                                  <span className="text-gray-500 text-sm">Units: {s.unit || '-'}</span>
                                                  <span className="text-gray-900 font-bold">{s.grade ?? s.score ?? s.value ?? '-'}</span>
                                                </div>
                                              </div>
                                            ))}
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
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  {isEditing ? 'Cancel' : 'Close'}
                </Button>
                {isEditing && (
                  <Button type='submit' className="flex-1">
                    Save Changes
                  </Button>
                )}
              </div>
            </form>
          )}
        </Modal>
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
