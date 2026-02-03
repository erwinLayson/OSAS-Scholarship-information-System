import { useEffect, useState } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { StatCard, Card, Badge, Button } from '../shared/ui';
import { PeopleIcon, MoneyIcon, ClipboardIcon, SuccessIcon, ChartIcon, HourglassIcon, SearchIcon, DownloadIcon, TrashIcon, FileTextIcon } from '../shared/Icons';

const Reports = () => {
  const [reportType, setReportType] = useState('students');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('All');
  const [summary, setSummary] = useState(null);
  const [recentReportsData, setRecentReportsData] = useState([]);
  // Recent reports filters / search (separate from generate form)
  const [searchQuery, setSearchQuery] = useState('');
  const [recentFrom, setRecentFrom] = useState('');
  const [recentTo, setRecentTo] = useState('');
  const [recentStatus, setRecentStatus] = useState('All');

  const [stats, setStats] = useState({
    totalStudents: '...',
    totalScholarships: '...',
    applications: '...',
    activePrograms: '...'
  });

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

        setStats({
          totalStudents: String(students.length),
          totalScholarships: String(scholarships.length),
          applications: String(applications.length),
          activePrograms: String(activePrograms)
        });
        // fetch reports summary and recent
        try {
          const summaryRes = await API.get('/reports/summary');
          if (summaryRes.data && summaryRes.data.success) setSummary(summaryRes.data.data);
        } catch (err) {
          console.warn('Could not fetch reports summary', err.message || err);
        }

        try {
          const recentRes = await API.get('/reports/recent?limit=6');
          if (recentRes.data && recentRes.data.success) setRecentReportsData(recentRes.data.data);
        } catch (err) {
          console.warn('Could not fetch recent reports', err.message || err);
        }
      } catch (err) {
        console.error('Error fetching report stats:', err);
      }
    };

    fetchStats();
  }, []);

  const reportTypes = [
    { value: 'students', label: 'Student Records Report', icon: <PeopleIcon size="1.5rem" /> },
    { value: 'scholarships', label: 'Scholarship Programs Report', icon: <MoneyIcon size="1.5rem" /> },
    { value: 'applications', label: 'Applications Report', icon: <ClipboardIcon size="1.5rem" /> },
  ];

  const recentReports = recentReportsData && recentReportsData.length > 0 ? recentReportsData.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    generatedBy: r.generated_by,
    date: r.created_at,
    size: r.size_bytes ? `${(r.size_bytes/1024/1024).toFixed(2)} MB` : '0 MB',
    status: r.status || 'Ready',
    filename: r.filename
  })) : [];

  // client-side filtered list for the Recent Reports table
  const filteredReports = recentReports.filter((report) => {
    // search
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const hay = `${report.name} ${report.type} ${report.generatedBy} ${report.filename}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // status
    if (recentStatus && recentStatus !== 'All') {
      if ((report.status || '').toLowerCase() !== recentStatus.toLowerCase()) return false;
    }

    // date range
    if (recentFrom) {
      const from = new Date(recentFrom);
      const rdate = new Date(report.date);
      if (isNaN(from) === false && rdate < from) return false;
    }
    if (recentTo) {
      const to = new Date(recentTo);
      const rdate = new Date(report.date);
      // include the day by setting end of day
      if (isNaN(to) === false) {
        to.setHours(23,59,59,999);
        if (rdate > to) return false;
      }
    }

    return true;
  });

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
        // refresh recent and summary
        try {
          const recentRes = await API.get('/reports/recent?limit=6');
          if (recentRes.data && recentRes.data.success) setRecentReportsData(recentRes.data.data);
        } catch (err) {
          console.warn('Could not fetch recent reports after generation', err.message || err);
        }
        try {
          const summaryRes2 = await API.get('/reports/summary');
          if (summaryRes2.data && summaryRes2.data.success) setSummary(summaryRes2.data.data);
        } catch (err) {
          console.warn('Could not fetch summary after generation', err.message || err);
        }
      } catch (err) {
        console.error('Failed to generate report', err);
        alert('Failed to generate report. Make sure you are authenticated as admin.');
      }
    })();
  };

  const handleDownloadReport = async (reportId, filename) => {
    try {
      const res = await API.get(`/reports/download/${reportId}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `report-${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report', err);
      alert('Failed to download report');
    }
  };

  const handleDeleteReport = (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    (async () => {
      try {
        const res = await API.delete(`/reports/${reportId}`);
        if (res.data && res.data.success) {
          alert('Report deleted');
          // refresh recent and summary
          const recentRes = await API.get('/reports/recent?limit=6');
          if (recentRes.data && recentRes.data.success) setRecentReportsData(recentRes.data.data);
          const summaryRes = await API.get('/reports/summary');
          if (summaryRes.data && summaryRes.data.success) setSummary(summaryRes.data.data);
        }
      } catch (err) {
        console.error('Failed to delete report', err);
        alert('Failed to delete report');
      }
    })();
  };

  return (
    <AdminLayout activeMenu="reports" title="Reports" subtitle="Generate and manage system reports">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<PeopleIcon size="1.5rem" />}
            color="blue"
          />
          <StatCard
            title="Total Scholarships"
            value={stats.totalScholarships}
            icon={<MoneyIcon size="1.5rem" />}
            color="emerald"
          />
          <StatCard
            title="Applications"
            value={stats.applications}
            icon={<ClipboardIcon size="1.5rem" />}
            color="purple"
          />
          <StatCard
            title="Active Programs"
            value={stats.activePrograms}
            icon={<SuccessIcon size="1.5rem" />}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Generator */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <FileTextIcon size="1.5rem" className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Generate Report</h3>
                  <p className="text-gray-500 text-sm">Select report type and date range</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Report Type Selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Report Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setReportType(type.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          reportType === type.value
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={reportType === type.value ? 'text-emerald-600' : 'text-gray-500'}>{type.icon}</span>
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateReport}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <FileTextIcon size="1.25rem" />
                  Generate Report
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Stats Summary */}
          <div className="lg:col-span-1">
            <Card title="Report Summary">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-700 text-sm font-medium">Total Reports Generated</span>
                    <ChartIcon size="1.25rem" className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{summary ? summary.totalReportsGenerated : '...'}</p>
                  <p className="text-blue-600 text-xs mt-1">This month</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-700 text-sm font-medium">Last Generated</span>
                    <HourglassIcon size="1.25rem" className="text-purple-500" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{summary && summary.lastGenerated ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(summary.lastGenerated.created_at)) : 'N/A'}</p>
                  <p className="text-purple-600 text-xs mt-1">{summary && summary.lastGenerated ? summary.lastGenerated.name : ''}</p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-700 text-sm font-medium">Most Generated</span>
                    <ChartIcon size="1.25rem" className="text-emerald-500" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{summary && summary.mostGenerated ? summary.mostGenerated.type : 'N/A'}</p>
                  <p className="text-emerald-600 text-xs mt-1">{summary && summary.mostGenerated ? `${summary.mostGenerated.cnt} reports this month` : ''}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Reports Table */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Reports</h3>
              <p className="text-gray-500 text-sm mt-1">Previously generated reports</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon size="1rem" />
                </div>
                <input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-lg bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
              <input
                type="date"
                value={recentFrom}
                onChange={(e) => setRecentFrom(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <input
                type="date"
                value={recentTo}
                onChange={(e) => setRecentTo(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <select
                value={recentStatus}
                onChange={(e) => setRecentStatus(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="All">All</option>
                <option value="Ready">Ready</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed</option>
                <option value="Completed">Completed</option>
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setSearchQuery(''); setRecentFrom(''); setRecentTo(''); setRecentStatus('All'); }}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Report Name</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Type</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Generated By</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Date</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Size</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Status</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 text-gray-900 font-medium">{report.name}</td>
                      <td className="py-4 px-4">
                        <Badge variant="info">{report.type}</Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{report.generatedBy}</td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {new Date(report.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{report.size}</td>
                      <td className="py-4 px-4">
                        <Badge variant="success">{report.status}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadReport(report.id, report.filename)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <DownloadIcon size="1.125rem" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <TrashIcon size="1.125rem" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 px-4 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FileTextIcon size="2rem" />
                        <p>No reports found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Reports;
