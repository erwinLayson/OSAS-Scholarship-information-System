import { useState, useEffect } from 'react';
import API from '../../API/fetchAPI';
import AdminLayout from './shareFIles/AdminLayout';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';

const ManageAdmin = () => {
  const { toasts, showToast, hideToast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await API.get('/admin/admin_list');
        const data = res.data.data;
        setAdmins(data);
        console.log(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAdmins();
  }, []);

  function handleInput(e) {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    const isFill = Object.keys(formData).every(key => (
      formData[key] !== "" && formData[key] !== null && formData[key] !== undefined
    ));

    console.log(formData);

    if (!isFill) {
      showToast("Please fill up all fields", "warning");
      return;
    }

    try {
      const res = await API.post('/admin/create', formData);
      const req = res.data;
      if (!req.success) {
        console.log(req.message);
        showToast(req.message || "Something went wrong", "error");
        return;
      }

      showToast(req.message, "success");
      e.target.reset();
      setFormData({
        username: '',
        email: '',
        password: '',
      });
      setShowModal(false);
      // Refresh admin list
      const refreshRes = await API.get('/admin/admin_list');
      setAdmins(refreshRes.data.data);

    } catch (err) {
      console.log(err);
      showToast("Failed to create admin account", "error");
    }
  }
  return (
    <AdminLayout activeMenu="settings" title="Manage Admin Accounts" subtitle="Add, edit, or remove administrator accounts">
      <div className="max-w-7xl mx-auto">

        {/* Add Admin Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Add New Admin
          </button>
        </div>

        {/* Admin List */}
        <div className="bg-green-900 rounded-xl shadow-2xl border border-green-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-800">
                <tr>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Name</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Created</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-t border-green-800 hover:bg-green-800/50 transition-colors">
                    <td className="py-4 px-6 text-green-50 font-medium">{admin.username}</td>
                    <td className="py-4 px-6 text-green-200">{admin.email}</td>
                    <td className="py-4 px-6 text-green-200">
                      {admin.date_created ? new Intl.DateTimeFormat("en-US", {
                        month: 'long', day: "2-digit", year: "numeric"
                      }).format(new Date(admin.date_created)) : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                          title="Toggle Status"
                        >
                          🔄
                        </button>
                        <button
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-green-900 rounded-2xl shadow-2xl border border-green-700 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-green-50 mb-6">
                {editingAdmin ? 'Edit Admin Account' : 'Add New Admin'}
              </h2>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-green-100 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    id='username'
                    onChange={handleInput}
                    className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-400"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-green-100 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id='email'
                    onChange={handleInput}
                    className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-400"
                    placeholder="admin@osas.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-green-100 mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    id='password'
                    onChange={handleInput}
                    className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-400"
                    placeholder="Enter password"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors"
                  >
                    Add Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
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

export default ManageAdmin;
