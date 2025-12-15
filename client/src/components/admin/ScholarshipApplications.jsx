import { useState, useEffect } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';

const ScholarshipApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toasts, showToast, hideToast } = useToast();

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

  return (
    <AdminLayout activeMenu="scholarship_applications" title="Scholarship Applications" subtitle="Manage scholarship applications from students">
      <div className="max-w-7xl mx-auto">
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
                {applications.length > 0 ? applications.map(app => (
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
                      <a href={`/${(app.documents && app.documents.length) ? app.documents[0].replace(/\\/g, '/') : ''}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-600 text-white rounded">Download</a>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-8 px-6 text-center text-green-300">No scholarship applications found</td>
                  </tr>
                )}
              </tbody>
            </table>
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
