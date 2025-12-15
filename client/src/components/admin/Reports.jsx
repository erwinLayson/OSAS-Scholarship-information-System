import { useEffect, useState } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';

const Reports = () => {
  const [reportType, setReportType] = useState('students');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('All');

  const [stats, setStats] = useState([
    { title: 'Total Students', value: '...', icon: '👥', color: 'bg-blue-900', trend: '' },
    { title: 'Total Scholarships', value: '...', icon: '💰', color: 'bg-green-900', trend: '' },
    { title: 'Applications', value: '...', icon: '📋', color: 'bg-purple-900', trend: '' },
    { title: 'Active Programs', value: '...', icon: '✅', color: 'bg-yellow-900', trend: '' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // students (admin route)
        const studentsRes = await API.get('/students/student_list');
        const students = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data.data || []);

        // scholarships (public route)
        const scholarshipsRes = await API.get('/scholarships/list');
        const scholarships = (scholarshipsRes.data && scholarshipsRes.data.data) ? scholarshipsRes.data.data : [];

        // applications (admin route)
        let applications = [];
        try {
          const appsRes = await API.get('/admin/applicants');
          applications = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data.data || []);
        } catch (e) {
          // `/admin/applicants` may return raw array or require auth; try `/applicants` as fallback
          try {
            const appsRes2 = await API.get('/applicants');
            applications = Array.isArray(appsRes2.data) ? appsRes2.data : (appsRes2.data.data || []);
          } catch (e2) {
            console.warn('Could not fetch applications', e2.message || e2);
          }
        }

        const activePrograms = scholarships.filter(s => (s.status || '').toLowerCase() === 'active').length;

        setStats([
          { title: 'Total Students', value: String(students.length), icon: '👥', color: 'bg-blue-900', trend: '' },
          { title: 'Total Scholarships', value: String(scholarships.length), icon: '💰', color: 'bg-green-900', trend: '' },
          { title: 'Applications', value: String(applications.length), icon: '📋', color: 'bg-purple-900', trend: '' },
          { title: 'Active Programs', value: String(activePrograms), icon: '✅', color: 'bg-yellow-900', trend: '' },
        ]);
      } catch (err) {
        console.error('Error fetching report stats:', err);
      }
    };

    fetchStats();
  }, []);

  const reportTypes = [
    { value: 'students', label: 'Student Records Report', icon: '👥' },
    { value: 'scholarships', label: 'Scholarship Programs Report', icon: '💰' },
    { value: 'applications', label: 'Applications Report', icon: '📋' },
    { value: 'financial', label: 'Financial Summary Report', icon: '💵' },
    { value: 'academic', label: 'Academic Performance Report', icon: '📊' },
  ];

  // Mock recent reports
  const recentReports = [
    {
      id: 1,
      name: 'Student Records - November 2025',
      type: 'Students',
      generatedBy: 'Admin User',
      date: '2025-12-07',
      size: '2.4 MB',
      status: 'Ready'
    },
    {
      id: 2,
      name: 'Scholarship Applications Q4 2025',
      type: 'Applications',
      generatedBy: 'Admin User',
      date: '2025-12-05',
      size: '1.8 MB',
      status: 'Ready'
    },
    {
      id: 3,
      name: 'Financial Report - 2025',
      type: 'Financial',
      generatedBy: 'Admin User',
      date: '2025-12-01',
      size: '3.2 MB',
      status: 'Ready'
    }
  ];

  const handleGenerateReport = () => {
    // Call server to generate CSV and download
    (async () => {
      try {
        const res = await API.post('/reports/generate', { reportType, dateFrom, dateTo, status }, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = `report-${reportType}-${Date.now()}.csv`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to generate report', err);
        alert('Failed to generate report. Make sure you are authenticated as admin.');
      }
    })();
  };

  const handleDownloadReport = (reportId) => {
    // Download logic here
    console.log('Downloading report:', reportId);
  };

  const handleDeleteReport = (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    // Delete logic here
    console.log('Deleting report:', reportId);
  };

  return (
    <AdminLayout activeMenu="reports" title="Reports" subtitle="Generate and manage system reports">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-xl p-6 border border-green-700`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <span className="text-green-300 text-sm font-semibold">{stat.trend}</span>
              </div>
              <h3 className="text-green-300 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-green-50">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Generator */}
          <div className="lg:col-span-2">
            <div className="bg-green-900 rounded-xl p-6 border border-green-700 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-50">Generate Report</h3>
                  <p className="text-green-300 text-sm">Select report type and date range</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Report Type Selection */}
                <div>
                  <label className="block text-green-200 text-sm font-semibold mb-2">
                    Report Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setReportType(type.value)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          reportType === type.value
                            ? 'bg-green-700 border-green-500 text-green-50'
                            : 'bg-green-800 border-green-600 text-green-200 hover:bg-green-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{type.icon}</span>
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-green-200 text-sm font-semibold mb-2">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-green-200 text-sm font-semibold mb-2">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-green-200 text-sm font-semibold mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateReport}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold py-4 px-6 rounded-lg hover:from-green-500 hover:to-emerald-600 transition-all transform hover:scale-[1.02] shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="lg:col-span-1">
            <div className="bg-green-900 rounded-xl p-6 border border-green-700">
              <h3 className="text-xl font-bold text-green-50 mb-4">Report Summary</h3>
              
              <div className="space-y-4">
                <div className="bg-green-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300 text-sm">Total Reports Generated</span>
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-2xl font-bold text-green-50">28</p>
                  <p className="text-green-400 text-xs mt-1">This month</p>
                </div>

                <div className="bg-green-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300 text-sm">Storage Used</span>
                    <span className="text-2xl">💾</span>
                  </div>
                  <p className="text-2xl font-bold text-green-50">47.8 MB</p>
                  <p className="text-green-400 text-xs mt-1">Of 500 MB available</p>
                </div>

                <div className="bg-green-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300 text-sm">Last Generated</span>
                    <span className="text-2xl">⏰</span>
                  </div>
                  <p className="text-lg font-bold text-green-50">2 days ago</p>
                  <p className="text-green-400 text-xs mt-1">Student Records Report</p>
                </div>

                <div className="bg-green-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300 text-sm">Most Generated</span>
                    <span className="text-2xl">📈</span>
                  </div>
                  <p className="text-lg font-bold text-green-50">Applications</p>
                  <p className="text-green-400 text-xs mt-1">12 reports this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="bg-green-900 rounded-xl shadow-2xl border border-green-700 overflow-hidden mt-6">
          <div className="p-6 border-b border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-green-50">Recent Reports</h3>
                <p className="text-green-300 text-sm mt-1">Previously generated reports</p>
              </div>
              <button className="px-4 py-2 bg-green-700 text-green-100 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
                View All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-800">
                <tr>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Report Name</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Type</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Generated By</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Date</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Size</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Status</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-t border-green-800 hover:bg-green-800/50 transition-colors">
                    <td className="py-4 px-6 text-green-50 font-medium">{report.name}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-green-700 text-green-100 rounded-full text-sm font-medium">
                        {report.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-green-200">{report.generatedBy}</td>
                    <td className="py-4 px-6 text-green-200">
                      {new Date(report.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-green-200">{report.size}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadReport(report.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
