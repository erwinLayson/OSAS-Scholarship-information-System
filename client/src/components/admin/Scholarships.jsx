import { useState, useEffect } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { StatCard, Card, Badge, Button, Modal } from '../shared/ui';
import { MoneyIcon, SuccessIcon, PeopleIcon, ClipboardIcon, SearchIcon, EyeIcon, EditIcon, TrashIcon, PlusIcon } from '../shared/Icons';

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

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Closed': return 'error';
      case 'Pending': return 'warning';
      default: return 'info';
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
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Scholarships"
            value={scholarships.length}
            icon={<MoneyIcon size="1.5rem" />}
            color="blue"
          />
          <StatCard
            title="Active Programs"
            value={scholarships.filter(s => s.status === 'Active').length}
            icon={<SuccessIcon size="1.5rem" />}
            color="emerald"
          />
          <StatCard
            title="Total Slots"
            value={scholarships.reduce((sum, s) => sum + s.slots, 0)}
            icon={<PeopleIcon size="1.5rem" />}
            color="purple"
          />
          <StatCard
            title="Available Slots"
            value={scholarships.reduce((sum, s) => sum + s.available_slots, 0)}
            icon={<ClipboardIcon size="1.5rem" />}
            color="amber"
          />
        </div>

        {/* Search and Filter */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon size="1.25rem" />
              </div>
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400"
              />
            </div>

            {/* Filter */}
            <div className="w-full md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Add New Button */}
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <PlusIcon size="1.25rem" />
              Add New
            </Button>
          </div>
        </Card>

        {/* Scholarships Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">ID</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Scholarship Name</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Amount</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Slots</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Available</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Deadline</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Status</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScholarships.length > 0 ? (
                  filteredScholarships.map((scholarship) => (
                    <tr key={scholarship.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 text-gray-500 font-mono text-sm">#{scholarship.id}</td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900 font-medium">{scholarship.name}</p>
                          <p className="text-gray-500 text-sm line-clamp-1">{scholarship.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-semibold">₱{Number(scholarship.amount).toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-600">{scholarship.slots}</td>
                      <td className="py-4 px-4">
                        <Badge variant={scholarship.available_slots > 0 ? 'success' : 'error'}>
                          {scholarship.available_slots}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {new Date(scholarship.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={getStatusBadgeVariant(scholarship.status)}>
                          {scholarship.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(scholarship)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <EyeIcon size="1.125rem" />
                          </button>
                          <button
                            onClick={() => handleEdit(scholarship)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <EditIcon size="1.125rem" />
                          </button>
                          <button
                            onClick={() => handleDelete(scholarship.id)}
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
                    <td colSpan="8" className="py-12 px-4 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <MoneyIcon size="2rem" />
                        <p>No scholarships found</p>
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
              Showing {filteredScholarships.length} of {scholarships.length} scholarships
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
          isOpen={showModal}
          onClose={handleCloseModal}
          title={isEditing ? (selectedScholarship ? 'Edit Scholarship' : 'Add New Scholarship') : 'Scholarship Details'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-2">Scholarship Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter scholarship name"
                  />
                ) : (
                  <p className="text-gray-900 text-lg font-semibold bg-gray-50 p-3 rounded-lg">{formData.name}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-2">Description *</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter description"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{formData.description}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Amount *</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="50000"
                  />
                ) : (
                  <p className="text-gray-900 text-lg font-semibold bg-gray-50 p-3 rounded-lg">₱{Number(formData.amount).toLocaleString()}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Total Slots *</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="slots"
                    value={formData.slots}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="10"
                  />
                ) : (
                  <p className="text-gray-900 text-lg bg-gray-50 p-3 rounded-lg">{formData.slots}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Deadline *</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-gray-900 text-lg bg-gray-50 p-3 rounded-lg">
                    {new Date(formData.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Status *</label>
                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Pending">Pending</option>
                  </select>
                ) : (
                  <Badge variant={getStatusBadgeVariant(formData.status)} className="text-sm">
                    {formData.status}
                  </Badge>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-2">Requirements</label>
                {isEditing ? (
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="List requirements..."
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{formData.requirements || 'No requirements specified'}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseModal}
                className="flex-1"
              >
                {isEditing ? 'Cancel' : 'Close'}
              </Button>
              {isEditing && (
                <Button type="submit" className="flex-1">
                  {selectedScholarship ? 'Save Changes' : 'Create Scholarship'}
                </Button>
              )}
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default Scholarships;
