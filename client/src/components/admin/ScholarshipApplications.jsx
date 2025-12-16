import { useState, useEffect } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';

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
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl font-bold">×</button>
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
  const [loading, setLoading] = useState(false);
  const { toasts, showToast, hideToast } = useToast();
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const updateStatus = async (id, status) => {
    if (!confirm(`Set status to ${status}?`)) return;
    try {
      await API.put(`/scholarships/applications/${id}/status`, { status });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      showToast('Status updated', 'success');
    } catch (err) {
      console.error('Status update error', err);
      showToast('Failed to update status', 'error');
    }
  };

  // Filter applications by status
  const filteredApplications = statusFilter === 'All'
    ? applications
    : applications.filter(app => app.status === statusFilter);

  return (
    <AdminLayout activeMenu="scholarship_applications" title="Scholarship Applications" subtitle="Manage scholarship applications from students">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-end mb-4">
          <label className="text-green-100 font-semibold mr-2">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded border border-green-600 bg-green-900 text-green-50"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="bg-green-900 rounded-xl shadow-2xl border border-green-700 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-800">
                <tr>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Student</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Scholarship</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Submitted</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Status</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? filteredApplications.map(app => (
                  <tr key={app.id} className="border-t border-green-800 hover:bg-green-800/50 transition-colors">
                    <td className="py-4 px-6 text-green-50">{app.student_name || app.student_name}</td>
                    <td className="py-4 px-6 text-green-200">{app.email || ''}</td>
                    <td className="py-4 px-6 text-green-200">{app.scholarship_name || '—'}</td>
                    <td className="py-4 px-6 text-green-200">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${app.status === 'Approved' ? 'bg-green-600 text-white' : app.status === 'Rejected' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <button onClick={() => updateStatus(app.id, 'Approved')} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                      <button onClick={() => updateStatus(app.id, 'Rejected')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                      <button onClick={() => { setSelectedApp(app); setShowDocsModal(true); }} className="px-3 py-1 bg-blue-600 text-white rounded">View</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-8 px-6 text-center text-green-300">No scholarship applications found</td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Documents Modal */}
            <ApplicationDocumentsModal
              visible={showDocsModal}
              onClose={() => setShowDocsModal(false)}
              app={selectedApp}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => hideToast(t.id)} />)}
      </div>
    </AdminLayout>
  );
};

export default ScholarshipApplications;
