import { useState, useEffect } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { MoneyIcon, SuccessIcon, PeopleIcon, ClipboardIcon, CloseIcon, PlusIcon } from '../shared/Icons';

const Scholarships = () => {
  const { toasts, showToast, hideToast } = useToast();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    slots: '',
    requirements: '',
    deadline: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const response = await API.get('/scholarships/list');
      if (response.data.success) {
        setScholarships(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter scholarships based on search term and status
  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'All') return matchesSearch;
    
    return matchesSearch && scholarship.status === filterStatus;
  });

  const stats = [
    { title: 'Total Scholarships', value: scholarships.length, icon: <MoneyIcon className="w-8 h-8 text-green-200" />, color: 'bg-green-900' },
    { title: 'Active Programs', value: scholarships.filter(s => s.status === 'Active').length, icon: <SuccessIcon className="w-8 h-8 text-blue-200" />, color: 'bg-blue-900' },
    { title: 'Total Slots', value: scholarships.reduce((sum, s) => sum + s.slots, 0), icon: <PeopleIcon className="w-8 h-8 text-purple-200" />, color: 'bg-purple-900' },
    { title: 'Available Slots', value: scholarships.reduce((sum, s) => sum + s.available_slots, 0), icon: <ClipboardIcon className="w-8 h-8 text-yellow-200" />, color: 'bg-yellow-900' },
  ];

  const handleView = (scholarship) => {
    setSelectedScholarship(scholarship);
    setFormData({
      name: scholarship.name,
      description: scholarship.description,
      amount: scholarship.amount,
      slots: scholarship.slots,
      requirements: scholarship.requirements,
      deadline: scholarship.deadline,
      status: scholarship.status
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (scholarship) => {
    setSelectedScholarship(scholarship);
    setFormData({
      name: scholarship.name,
      description: scholarship.description,
      amount: scholarship.amount,
      slots: scholarship.slots,
      requirements: scholarship.requirements,
      deadline: scholarship.deadline,
      status: scholarship.status
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (scholarshipId) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;
    
    try {
      const response = await API.delete(`/scholarships/delete/${scholarshipId}`);
      if (response.data.success) {
        showToast('Scholarship deleted successfully', 'success');
        setScholarships(scholarships.filter(s => s.id !== scholarshipId));
      }
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      showToast('Failed to delete scholarship', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedScholarship(null);
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      amount: '',
      slots: '',
      requirements: '',
      deadline: '',
      status: 'Active'
    });
  };

  const handleAddNew = () => {
    setSelectedScholarship(null);
    setFormData({
      name: '',
      description: '',
      amount: '',
      slots: '',
      requirements: '',
      deadline: '',
      status: 'Active'
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedScholarship) {
        // Update existing scholarship
        const response = await API.put(`/scholarships/edit/${selectedScholarship.id}`, {
          ...formData,
          available_slots: selectedScholarship.available_slots
        });
        
        if (response.data.success) {
          showToast('Scholarship updated successfully', 'success');
          fetchScholarships();
          handleCloseModal();
        }
      } else {
        // Create new scholarship
        const response = await API.post('/scholarships/create', formData);
        
        if (response.data.success) {
          showToast('Scholarship created successfully', 'success');
          fetchScholarships();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving scholarship:', error);
      showToast(error.response?.data?.message || 'Failed to save scholarship', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-600 text-white';
      case 'Closed': return 'bg-red-600 text-white';
      case 'Pending': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <AdminLayout activeMenu="scholarships" title="Scholarships" subtitle="Manage scholarship programs">
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
      
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

        {/* Search and Filter */}
        <div className="bg-green-900 rounded-xl p-6 border border-green-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-400"
              />
            </div>

            {/* Filter */}
            <div className="w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Add New Button */}
            <button
              onClick={handleAddNew}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New
            </button>
          </div>
        </div>

        {/* Scholarships Table */}
        <div className="bg-green-900 rounded-xl shadow-2xl border border-green-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-800">
                <tr>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">ID</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Scholarship Name</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Amount</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Slots</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Available</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Deadline</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Status</th>
                  <th className="text-left py-4 px-6 text-green-100 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScholarships.length > 0 ? (
                  filteredScholarships.map((scholarship) => (
                    <tr key={scholarship.id} className="border-t border-green-800 hover:bg-green-800/50 transition-colors">
                      <td className="py-4 px-6 text-green-50 font-mono">#{scholarship.id}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-green-50 font-medium">{scholarship.name}</p>
                        <p className="text-green-300 text-sm">{scholarship.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-green-50 font-semibold">₱{Number(scholarship.amount).toLocaleString()}</td>
                    <td className="py-4 px-6 text-green-50">{scholarship.slots}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        scholarship.available_slots > 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {scholarship.available_slots}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-green-200">
                      {new Date(scholarship.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(scholarship.status)}`}>
                        {scholarship.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(scholarship)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(scholarship)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(scholarship.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 px-6 text-center text-green-300">
                      No scholarships found
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
            Showing {filteredScholarships.length} of {scholarships.length} scholarships
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
        {showModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-green-900/30 flex items-center justify-center z-50 p-4">
            <div className="bg-green-900 rounded-2xl shadow-2xl border border-green-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-green-800 p-6 border-b border-green-700 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-green-50">
                    {isEditing ? (selectedScholarship ? 'Edit Scholarship' : 'Add New Scholarship') : 'Scholarship Details'}
                  </h3>
                  <p className="text-green-300 text-sm mt-1">
                    {isEditing ? 'Update scholarship information' : 'Complete scholarship details'}
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
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-green-300 text-sm font-medium mb-2">Scholarship Name *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-green-800 text-green-50 rounded-lg border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="Enter scholarship name"
                      />
                    ) : (
                      <p className="text-green-50 text-lg font-semibold bg-green-800 p-3 rounded-lg">{formData.name}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-green-300 text-sm font-medium mb-2">Description *</label>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                        className="w-full px-4 py-3 bg-green-800 text-green-50 rounded-lg border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="Enter description"
                      />
                    ) : (
                      <p className="text-green-50 bg-green-800 p-3 rounded-lg">{formData.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-green-300 text-sm font-medium mb-2">Amount *</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        className="w-full px-4 py-3 bg-green-800 text-green-50 rounded-lg border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="50000"
                      />
                    ) : (
                      <p className="text-green-50 text-lg font-semibold bg-green-800 p-3 rounded-lg">₱{Number(formData.amount).toLocaleString()}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-green-300 text-sm font-medium mb-2">Total Slots *</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="slots"
                        value={formData.slots}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-4 py-3 bg-green-800 text-green-50 rounded-lg border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="10"
                      />
                    ) : (
                      <p className="text-green-50 text-lg bg-green-800 p-3 rounded-lg">{formData.slots}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-green-300 text-sm font-medium mb-2">Deadline *</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-green-800 text-green-50 rounded-lg border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                    ) : (
                      <p className="text-green-50 text-lg bg-green-800 p-3 rounded-lg">
                        {new Date(formData.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-green-300 text-sm font-medium mb-2">Status *</label>
                    {isEditing ? (
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-green-800 text-green-50 rounded-lg border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(formData.status)}`}>
                        {formData.status}
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-green-300 text-sm font-medium mb-2">Requirements</label>
                    {isEditing ? (
                      <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-green-800 text-green-50 rounded-lg border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="List requirements..."
                      />
                    ) : (
                      <p className="text-green-50 bg-green-800 p-3 rounded-lg">{formData.requirements || 'No requirements specified'}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-green-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    {isEditing ? 'Cancel' : 'Close'}
                  </button>
                  {isEditing && (
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors"
                    >
                      {selectedScholarship ? 'Save Changes' : 'Create Scholarship'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Scholarships;
