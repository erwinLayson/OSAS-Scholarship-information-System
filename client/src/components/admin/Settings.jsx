import { useState, useEffect } from 'react';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import { useToast } from '../../hooks/useToast';
import Toast from '../shared/Toast';
import { UserIcon, InfoIcon, LockIcon, BellIcon } from '../shared/Icons';

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
        smsNotifications: false,
        maintenanceMode: false,
        autoApproval: false,
    });

    const tabs = [
      { id: 'profile', name: 'Profile Settings', icon: <UserIcon className="w-5 h-5" /> },
      { id: 'system', name: 'System Settings', icon: <InfoIcon className="w-5 h-5" /> },
      { id: 'security', name: 'Security', icon: <LockIcon className="w-5 h-5" /> },
      { id: 'notifications', name: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
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

  return (
    <AdminLayout activeMenu="settings" title="Settings" subtitle="Manage system and account settings">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="bg-green-900 rounded-xl border border-green-700 mb-6">
          <div className="flex flex-wrap gap-2 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-green-800 text-green-200 hover:bg-green-700'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="bg-green-900 rounded-xl border border-green-700 p-6">
            <h3 className="text-2xl font-bold text-green-50 mb-6">Profile Information</h3>
            
            <form className="space-y-6 max-w-2xl">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
                  A
                </div>
                <div>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium">
                    Change Photo
                  </button>
                  <p className="text-sm text-green-300 mt-2">JPG, PNG or GIF (max. 2MB)</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <p className="text-sm font-semibold text-green-100 mb-2 flex gap-3">
                Username: <span className="text-sm font-semibold text-green-100"> { profileData.username}</span>
                </p>
              </div>

              {/* Email */}
              <div>
                <p className="flex gap-3 text-sm font-semibold text-green-100 mb-2">
                    Email Address: <span className="text-sm font-semibold text-green-100"> { profileData.email }</span>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="bg-green-900 rounded-xl border border-green-700 p-6">
            <h3 className="text-2xl font-bold text-green-50 mb-6">System Configuration</h3>
            
            <form className="space-y-6 max-w-2xl">
              {/* Site Name */}
              <div>
                <label className="block text-sm font-semibold text-green-100 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={systemSettings.siteName}
                  onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
                  className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              {/* Site Description */}
              <div>
                <label className="block text-sm font-semibold text-green-100 mb-2">
                  Site Description
                </label>
                <textarea
                  rows="3"
                  value={systemSettings.siteDescription}
                  onChange={(e) => setSystemSettings({...systemSettings, siteDescription: e.target.value})}
                  className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-800 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-50">Email Notifications</p>
                    <p className="text-sm text-green-300">Send email notifications to users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.emailNotifications}
                      onChange={(e) => setSystemSettings({...systemSettings, emailNotifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-800 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-50">SMS Notifications</p>
                    <p className="text-sm text-green-300">Send SMS notifications to users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.smsNotifications}
                      onChange={(e) => setSystemSettings({...systemSettings, smsNotifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-800 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-50">Maintenance Mode</p>
                    <p className="text-sm text-green-300">Temporarily disable site access</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-800 rounded-lg">
                  <div>
                    <p className="font-semibold text-green-50">Auto Approval</p>
                    <p className="text-sm text-green-300">Automatically approve qualifying applications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.autoApproval}
                      onChange={(e) => setSystemSettings({...systemSettings, autoApproval: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-green-900 rounded-xl border border-green-700 p-6">
            <h3 className="text-2xl font-bold text-green-50 mb-6">Change Password</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-green-100 mb-2">
                    Username
                </label>
                <input
                type="text"
                name='username'
                value={formdata.username }
                readOnly
                className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter current password"
            />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-green-100 mb-2">
                  New Password
                </label>
                <input
                type="password"
                name='password'
                onChange={handleInput}
                className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter new password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-green-100 mb-2">
                  Confirm New Password
                </label>
                <input
                type="password"
                name='confirmPassword'
                onChange={handleInput}
                className="w-full px-4 py-3 bg-green-800 text-green-50 border border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors"
              >
                Update Password
              </button>
            </form>

            {/* Two-Factor Authentication */}
            <div className="mt-8 pt-8 border-t border-green-700">
              <h4 className="text-xl font-bold text-green-50 mb-4">Two-Factor Authentication</h4>
              <div className="flex items-center justify-between p-4 bg-green-800 rounded-lg max-w-2xl">
                <div>
                  <p className="font-semibold text-green-50">Enable 2FA</p>
                  <p className="text-sm text-green-300">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium">
                  Enable
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-green-900 rounded-xl border border-green-700 p-6">
            <h3 className="text-2xl font-bold text-green-50 mb-6">Notification Preferences</h3>
            
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 bg-green-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-green-50">New Application Submitted</p>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 bg-green-800 border-green-600 rounded focus:ring-green-500" />
                </div>
                <p className="text-sm text-green-300">Receive notifications when new applications are submitted</p>
              </div>

              <div className="p-4 bg-green-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-green-50">Application Status Changed</p>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 bg-green-800 border-green-600 rounded focus:ring-green-500" />
                </div>
                <p className="text-sm text-green-300">Get notified when application status changes</p>
              </div>

              <div className="p-4 bg-green-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-green-50">New Student Registration</p>
                  <input type="checkbox" className="w-5 h-5 text-green-600 bg-green-800 border-green-600 rounded focus:ring-green-500" />
                </div>
                <p className="text-sm text-green-300">Be notified when new students register</p>
              </div>

              <div className="p-4 bg-green-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-green-50">System Updates</p>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 bg-green-800 border-green-600 rounded focus:ring-green-500" />
                </div>
                <p className="text-sm text-green-300">Receive notifications about system updates and maintenance</p>
              </div>

              <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors mt-6">
                Save Preferences
              </button>
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

export default Settings;
