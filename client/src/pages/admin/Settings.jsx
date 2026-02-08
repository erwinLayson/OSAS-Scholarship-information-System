import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/shared/Toast';
import { Card, Button, Modal } from '../../components/shared/ui';
import { UserIcon, InfoIcon, LockIcon, BellIcon } from '../../components/shared/Icons';

const Settings = () => {
    const { toasts, showToast, hideToast } = useToast();

    const [formdata, setformdata] = useState({
        username: 'admin',
        password: '',
        confirmPassword: ''
    })
    
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        username: '',
        email: ''
    });

    const [systemSettings, setSystemSettings] = useState({
        siteName: 'OSAS System',
        siteDescription: 'Online Scholarship Application System',
        emailNotifications: true,
        maintenanceMode: false,
    });

    // Grade edit settings
    const [allowGradeEdit, setAllowGradeEdit] = useState(false);
    const [showSemesterPicker, setShowSemesterPicker] = useState(false);
    const [semesterInput, setSemesterInput] = useState('');

    const tabs = [
      { id: 'profile', name: 'Profile Settings', icon: <UserIcon size="1.25rem" /> },
      { id: 'system', name: 'System Settings', icon: <InfoIcon size="1.25rem" /> },
      { id: 'security', name: 'Security', icon: <LockIcon size="1.25rem" /> },
      { id: 'notifications', name: 'Notifications', icon: <BellIcon size="1.25rem" /> },
      ];
    
    function handleInput(e) {
        const { name, value } = e.target;
        setformdata((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    useEffect(() => {
        (async () => {
            try {
                console.log(formdata.username)
                const res = await API.post('/admin/profile', {username: formdata.username})
                const admin = res.data
                console.log(admin);
                
                if (admin.success && admin.data.length > 0) {
                    setProfileData({
                        username: admin.data[0].username,
                        email: admin.data[0].email
                    });
                }
            } catch (err) {
                console.log(err);
            }
        })();

        // Fetch grade edit setting
        (async () => {
            try {
                const res = await API.get('/settings/allow_grade_edit');
                if (res.data && res.data.success) {
                    setAllowGradeEdit(!!res.data.value);
                }
            } catch (e) {
                try {
                    const val = localStorage.getItem('allow_grade_edit') === 'true';
                    setAllowGradeEdit(val);
                } catch (e2) {}
            }
        })();

        // Fetch maintenance mode setting
        (async () => {
            try {
                const res = await API.get('/settings/maintenance_mode');
                if (res.data && res.data.success) {
                    setSystemSettings(prev => ({ ...prev, maintenanceMode: !!res.data.value }));
                }
            } catch (e) {
                console.error('Failed to fetch maintenance mode', e);
            }
        })();
    }, [])

    async function handleSubmit(e) {
        e.preventDefault();

        const isFill = Object.keys(formdata).every(key => (
            formdata[key] !== '' && formdata[key] !== undefined && formdata[key] !== null 
        ))

        if (!isFill) {
            showToast("Please fill up all fields", "warning");
            return;
        }

        try {
            const res = await API.put('/admin/password', formdata);
            const result = res.data;
            console.log(result);
            if (result.success) {
                showToast(result.message, "success");
                e.target.reset();
                setformdata({
                    username: 'admin',
                    password: '',
                    confirmPassword: ''
                });
                return
            }

            showToast(result.message, "error");
        } catch (error) {
            console.log(error);
            showToast("An error occurred while updating password", "error");
        }
    }

    const handleGradeEditToggle = async (checked) => {
        if (checked) {
            // When enabling, show semester picker first
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const sem = month >= 7 ? 'S2' : 'S1';
            setSemesterInput(`${year}-${sem}`);
            setShowSemesterPicker(true);
        } else {
            // When disabling, directly update
            try {
                const res = await API.put('/settings/allow_grade_edit', { value: false });
                if (res.data && res.data.success) {
                    setAllowGradeEdit(false);
                    try { localStorage.setItem('allow_grade_edit', 'false'); } catch (e) {}
                    showToast('Students can no longer update semester grades', 'warning');
                } else {
                    showToast(res.data?.message || 'Failed to update setting', 'error');
                }
            } catch (err) {
                console.error('Failed to update setting', err);
                showToast('Failed to update setting', 'error');
            }
        }
    };

    const handleEnableSemester = async () => {
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
    };

    const handleMaintenanceModeToggle = async (checked) => {
        try {
            const res = await API.put('/settings/maintenance_mode', { value: checked });
            if (res.data && res.data.success) {
                setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }));
                if (checked) {
                    showToast('Maintenance mode enabled. Students cannot login.', 'warning');
                } else {
                    showToast('Maintenance mode disabled. Students can login.', 'success');
                }
            } else {
                showToast(res.data?.message || 'Failed to update maintenance mode', 'error');
            }
        } catch (err) {
            console.error('Failed to update maintenance mode', err);
            showToast('Failed to update maintenance mode', 'error');
        }
    };

  return (
    <AdminLayout activeMenu="settings" title="Settings" subtitle="Manage system and account settings">
      <div className="max-w-5xl mx-auto">
        {/* Tabs */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserIcon size="1.5rem" className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
                <p className="text-sm text-gray-500">View and manage your account details</p>
              </div>
            </div>
            
            <div className="space-y-6 max-w-2xl">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profileData.username?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <Button variant="primary" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (max. 2MB)</p>
                </div>
              </div>

              {/* Username */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Username</label>
                <p className="text-lg font-semibold text-gray-800">{profileData.username || 'Not set'}</p>
              </div>

              {/* Email */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                <p className="text-lg font-semibold text-gray-800">{profileData.email || 'Not set'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <InfoIcon size="1.5rem" className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">System Configuration</h3>
                <p className="text-sm text-gray-500">Configure system-wide settings</p>
              </div>
            </div>
            
            <form className="space-y-6 max-w-2xl">
              {/* Site Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={systemSettings.siteName}
                  onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                  className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Site Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  rows="3"
                  value={systemSettings.siteDescription}
                  onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
                  className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Toggle Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">System Preferences</h4>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                  <div>
                    <p className="font-semibold text-gray-800">Email Notifications</p>
                    <p className="text-sm text-gray-500">Send email notifications to users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.emailNotifications}
                      onChange={(e) => setSystemSettings({...systemSettings, emailNotifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200 hover:border-amber-300 transition-all">
                  <div>
                    <p className="font-semibold text-gray-800">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Temporarily disable student login and registration (admin can still login)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => handleMaintenanceModeToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                  <div>
                    <p className="font-semibold text-gray-800">Enable Student Edit Grade</p>
                    <p className="text-sm text-gray-500">Allow students to update their semester grades</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowGradeEdit}
                      onChange={(e) => handleGradeEditToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="primary">
                  Save Settings
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-red-100 rounded-lg">
                <LockIcon size="1.5rem" className="text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Security Settings</h3>
                <p className="text-sm text-gray-500">Manage your password and account security</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name='username'
                  value={formdata.username}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded-xl cursor-not-allowed"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name='password'
                  onChange={handleInput}
                  className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Enter new password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name='confirmPassword'
                  onChange={handleInput}
                  className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Confirm new password"
                />
              </div>

              <Button type="submit" variant="primary">
                Update Password
              </Button>
            </form>

            {/* Two-Factor Authentication */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Two-Factor Authentication</h4>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 max-w-2xl">
                <div>
                  <p className="font-semibold text-gray-800">Enable 2FA</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BellIcon size="1.5rem" className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Notification Preferences</h3>
                <p className="text-sm text-gray-500">Choose what notifications you want to receive</p>
              </div>
            </div>
            
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div>
                  <p className="font-semibold text-gray-800">New Application Submitted</p>
                  <p className="text-sm text-gray-500">Receive notifications when new applications are submitted</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-5 h-5 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div>
                  <p className="font-semibold text-gray-800">Application Status Changed</p>
                  <p className="text-sm text-gray-500">Get notified when application status changes</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-5 h-5 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div>
                  <p className="font-semibold text-gray-800">New Student Registration</p>
                  <p className="text-sm text-gray-500">Be notified when new students register</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div>
                  <p className="font-semibold text-gray-800">System Updates</p>
                  <p className="text-sm text-gray-500">Receive notifications about system updates and maintenance</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-5 h-5 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 cursor-pointer" 
                />
              </div>

              <div className="pt-4">
                <Button variant="primary">
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Semester Picker Modal */}
      <Modal
        isOpen={showSemesterPicker}
        onClose={() => setShowSemesterPicker(false)}
        title="Select Semester to Enable"
        size="sm"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select 
                value={semesterInput.split('-')[1] || 'S1'} 
                onChange={(e) => {
                  const yr = semesterInput.split('-')[0] || new Date().getFullYear();
                  setSemesterInput(`${yr}-${e.target.value}`);
                }} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="S1">S1 (1st Sem)</option>
                <option value="S2">S2 (2nd Sem)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowSemesterPicker(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnableSemester}>
              Enable
            </Button>
          </div>
        </div>
      </Modal>
      
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

export default Settings;
