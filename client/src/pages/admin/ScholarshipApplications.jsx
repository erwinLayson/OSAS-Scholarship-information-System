import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/shared/Toast';
import { CloseIcon } from '../../components/shared/Icons';

// Modal for viewing application documents
const ApplicationDocumentsModal = ({ visible, onClose, app }) => {
  if (!visible || !app) return null;
  let docs = [];
  try {
    docs = Array.isArray(app.documents)
      ? app.documents
      : typeof app.documents === 'string' ? JSON.parse(app.documents) : [];
  } catch {
    docs = [];
  }
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-green-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Documents for {app.student_name || app.email}</h3>
            <p className="text-sm text-gray-600">Scholarship: {app.scholarship_name || app.scholarship_id}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl font-bold" aria-label="Close">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Uploaded Documents</h4>
            {docs.length === 0 ? (
              <p className="text-sm text-gray-500">No documents uploaded.</p>
            ) : (
              <ul className="space-y-4">
                {docs.map((d, i) => {
                  const normalized = String(d).replace(/\\\\/g, '/').replace(/\\/g, '/');
                  const url = `${API.defaults.baseURL}/${normalized}`;
                  const name = normalized.split('/').pop();
                  const ext = name.split('.').pop().toLowerCase();
                  const isImage = ['jpg','jpeg','png','gif','bmp','webp'].includes(ext);
                  return (
                    <li key={i} className="bg-gray-50 p-3 rounded flex flex-col gap-2">
                      <div className="text-sm text-gray-700">{name}</div>
                      {isImage ? (
                        <img src={url} alt={name} className="max-h-64 max-w-full rounded border border-gray-200 object-contain" style={{background:'#f8fafc'}} />
                      ) : (
                        <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-600 text-white rounded text-sm inline-block">Open</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="text-right">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScholarshipApplications = () => {
  const [applications, setApplications] = useState([]);
  const [historyApplications, setHistoryApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toasts, showToast, hideToast } = useToast();
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  
  // Filters for history
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');
  const [historyScholarshipFilter, setHistoryScholarshipFilter] = useState('All');
  const [historyDateFrom, setHistoryDateFrom] = useState('');
  const [historyDateTo, setHistoryDateTo] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchHistory();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/scholarships/applications');
      const result = res.data;
      if (result && result.success) setApplications(result.data || []);
    } catch (err) {
      console.error('Error fetching scholarship applications:', err);
      showToast('Failed to load scholarship applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get('/scholarships/applications/history');
      const result = res.data;
      if (result && result.success) setHistoryApplications(result.data || []);
    } catch (err) {
      console.error('Error fetching application history:', err);
    }
  };

  const updateStatus = async (id, status) => {
    if (!confirm(`Set status to ${status}?`)) return;
    try {
      await API.put(`/scholarships/applications/${id}/status`, { status });
      // Remove from pending list and refresh history
      setApplications(prev => prev.filter(a => a.id !== id));
      fetchHistory();
      showToast(`Application ${status.toLowerCase()} and moved to history`, 'success');
    } catch (err) {
      console.error('Status update error', err);
      showToast('Failed to update status', 'error');
    }
  };

  // Get unique scholarship names for filter dropdown
  const uniqueScholarships = [...new Set(historyApplications.map(app => app.scholarship_name).filter(Boolean))];

  // Filter history applications
  const filteredHistory = historyApplications.filter(app => {
    // Status filter
    if (historyStatusFilter !== 'All' && app.status !== historyStatusFilter) return false;
    
    // Scholarship filter
    if (historyScholarshipFilter !== 'All' && app.scholarship_name !== historyScholarshipFilter) return false;
    
    // Date from filter
    if (historyDateFrom) {
      const appDate = new Date(app.processed_at);
      const fromDate = new Date(historyDateFrom);
      if (appDate < fromDate) return false;
    }
    
    // Date to filter
    if (historyDateTo) {
      const appDate = new Date(app.processed_at);
      const toDate = new Date(historyDateTo);
      toDate.setHours(23, 59, 59, 999);
      if (appDate > toDate) return false;
    }
    
    return true;
  });

  const clearHistoryFilters = () => {
    setHistoryStatusFilter('All');
    setHistoryScholarshipFilter('All');
    setHistoryDateFrom('');
    setHistoryDateTo('');
  };

  return (
    <AdminLayout activeMenu="scholarship_applications" title="Scholarship Applications" subtitle="Manage scholarship applications from students">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Application History ({historyApplications.length})
          </button>
        </div>

        {/* Pending Applications Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-800 font-semibold">Student</th>
                    <th className="text-left py-4 px-6 text-gray-800 font-semibold">Email</th>
                    <th className="text-left py-4 px-6 text-gray-800 font-semibold">Scholarship</th>
                    <th className="text-left py-4 px-6 text-gray-800 font-semibold">Submitted</th>
                    <th className="text-left py-4 px-6 text-gray-800 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-gray-800 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length > 0 ? applications.map(app => (
                    <tr key={app.id} className="border-t border-gray-200 hover:bg-gray-100 transition-colors">
                      <td className="py-4 px-6 text-gray-800">{app.student_name || app.student_name}</td>
                      <td className="py-4 px-6 text-gray-800">{app.email || ''}</td>
                      <td className="py-4 px-6 text-gray-800">{app.scholarship_name || '—'}</td>
                      <td className="py-4 px-6 text-gray-800">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded text-sm font-medium bg-yellow-500 text-white">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 flex gap-2">
                        <button onClick={() => updateStatus(app.id, 'Approved')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Approve</button>
                        <button onClick={() => updateStatus(app.id, 'Rejected')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Reject</button>
                        <button onClick={() => { setSelectedApp(app); setShowDocsModal(true); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">View</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-8 px-6 text-center text-gray-400">No pending applications</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            {/* History Filters */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-4">
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
                    {uniqueScholarships.map(name => (
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
                  onClick={clearHistoryFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Showing {filteredHistory.length} of {historyApplications.length} records
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-800 font-semibold">Student</th>
                      <th className="text-left py-4 px-6 text-gray-800 font-semibold">Email</th>
                      <th className="text-left py-4 px-6 text-gray-800 font-semibold">Scholarship</th>
                      <th className="text-left py-4 px-6 text-gray-800 font-semibold">Applied</th>
                      <th className="text-left py-4 px-6 text-gray-800 font-semibold">Processed</th>
                      <th className="text-left py-4 px-6 text-gray-800 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length > 0 ? filteredHistory.map(app => (
                      <tr key={app.id} className="border-t border-gray-200 hover:bg-gray-100 transition-colors">
                        <td className="py-4 px-6 text-gray-800">{app.student_name || '—'}</td>
                        <td className="py-4 px-6 text-gray-800">{app.email || ''}</td>
                        <td className="py-4 px-6 text-gray-800">{app.scholarship_name || '—'}</td>
                        <td className="py-4 px-6 text-gray-800">{app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}</td>
                        <td className="py-4 px-6 text-gray-800">{app.processed_at ? new Date(app.processed_at).toLocaleDateString() : '—'}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded text-sm font-medium ${
                            app.status === 'Approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="py-8 px-6 text-center text-gray-400">No application history found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Documents Modal */}
        <ApplicationDocumentsModal
          visible={showDocsModal}
          onClose={() => setShowDocsModal(false)}
          app={selectedApp}
        />
      </div>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => hideToast(t.id)} />)}
      </div>
    </AdminLayout>
  );
};

export default ScholarshipApplications;
