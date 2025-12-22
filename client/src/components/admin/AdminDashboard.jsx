import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import ActivityChart from './ActivityChart';
import { PeopleIcon, ClipboardIcon, SuccessIcon, ChartIcon, PlusIcon } from '../shared/Icons';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [applicantsList, setApplicantsList] = useState([]);
  const [chartView, setChartView] = useState('daily'); // daily|weekly|yearly

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await API.get('/admin/dashboard-stats');
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentApplications(response.data.recentApplications);
      }
      // fetch full applicants (protected route)
      try {
        const appsRes = await API.get('/admin/applicants');
        if (appsRes && appsRes.data) {
          setApplicantsList(appsRes.data);
        }
      } catch (err) {
        // ignore if not authorized in current session
        console.warn('Could not fetch applicants for charts', err.message || err);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // helpers to build series
  const parseAppDate = (app) => {
    const possible = app.created_at || app.createdDate || app.createdAt || app.date || app.created;
    const d = possible ? new Date(possible) : new Date();
    if (isNaN(d)) return new Date();
    return d;
  }

  const buildSeries = (view) => {
    const now = new Date();
    if (!Array.isArray(applicantsList)) return [];

    if (view === 'daily') {
      // last 7 days
      const days = Array.from({length:7}).map((_,i)=>{
        const dt = new Date(now);
        dt.setDate(now.getDate() - (6 - i));
        return dt;
      });
      const labels = days.map(d=>`${d.getMonth()+1}/${d.getDate()}`);
      const counts = labels.map((_,i)=>0);

      applicantsList.forEach(app=>{
        const d = parseAppDate(app);
        const key = `${d.getMonth()+1}/${d.getDate()}`;
        const idx = labels.indexOf(key);
        if (idx >= 0) counts[idx]++;
      })

      return labels.map((label,i)=>({ label, value: counts[i]}));
    }

    if (view === 'weekly') {
      // last 12 weeks (week start date)
      const weeks = Array.from({length:12}).map((_,i)=>{
        const dt = new Date(now);
        dt.setDate(now.getDate() - (7*(11 - i)));
        // get Monday as week label
        const day = dt.getDay();
        const diff = (day + 6) % 7; // days since Monday
        dt.setDate(dt.getDate() - diff);
        return dt;
      });
      const labels = weeks.map(d=>`${d.getMonth()+1}/${d.getDate()}`);
      const counts = labels.map(()=>0);
      applicantsList.forEach(app=>{
        const d = parseAppDate(app);
        // find latest week start that is <= d
        for (let i = weeks.length -1; i >=0; i--) {
          if (d >= weeks[i]) { counts[i]++; break; }
        }
      })
      return labels.map((label,i)=>({ label, value: counts[i]}));
    }

    // yearly - last 5 years
    const currentYear = now.getFullYear();
    const years = Array.from({length:5}).map((_,i)=>currentYear - (4 - i));
    const labels = years.map(y=>String(y));
    const counts = labels.map(()=>0);
    applicantsList.forEach(app=>{
      const d = parseAppDate(app);
      const y = d.getFullYear();
      const idx = labels.indexOf(String(y));
      if (idx >= 0) counts[idx]++;
    })
    return labels.map((label,i)=>({ label, value: counts[i]}));
  }

  const chartData = useMemo(()=> buildSeries(chartView), [applicantsList, chartView]);

  const statsDisplay = [
    { 
      title: 'Total Students', 
      value: loading ? '...' : stats.totalStudents.toString(), 
      icon: <PeopleIcon className="w-8 h-8 text-blue-200" />,
      color: 'bg-blue-900'
    },
    { 
      title: 'Pending Applications', 
      value: loading ? '...' : stats.pendingApplications.toString(), 
      icon: <ClipboardIcon className="w-8 h-8 text-yellow-200" />,
      color: 'bg-yellow-900'
    },
    { 
      title: 'Approved Applications', 
      value: loading ? '...' : stats.approvedApplications.toString(), 
      icon: <SuccessIcon className="w-8 h-8 text-green-200" />,
      color: 'bg-green-900'
    },
    { 
      title: 'Total Applications', 
      value: loading ? '...' : stats.totalApplications.toString(), 
      icon: <ChartIcon className="w-8 h-8 text-purple-200" />,
      color: 'bg-purple-900'
    },
  ];

  return (
    <AdminLayout activeMenu="dashboard" title="Dashboard" subtitle="Welcome back, Admin!">
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsDisplay.map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl p-6 border border-green-700 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                </div>
                <h3 className="text-green-300 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-green-50">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Applications */}      
          <div className="bg-green-900 rounded-xl p-6 border border-green-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-green-50">Recent Applications</h3>
              <button 
                onClick={() => navigate('/admin/applications')}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors text-sm font-medium"
              >
                View All
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-green-300">Loading applications...</div>
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-green-300 text-lg">No applications yet</p>
                <p className="text-green-400 text-sm mt-2">Applications will appear here when students apply</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-green-700">
                      <th className="text-left py-3 px-4 text-green-300 font-semibold">Student</th>
                      <th className="text-left py-3 px-4 text-green-300 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-green-300 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-green-300 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-green-300 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app.id} className="border-b border-green-800 hover:bg-green-800/50 transition-colors">
                        <td className="py-3 px-4 text-green-50">{app.student}</td>
                        <td className="py-3 px-4 text-green-200">{app.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600 text-white">
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-green-200">{app.date}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => navigate('/admin/applications')}
                            className="text-green-400 hover:text-green-200 font-medium transition-colors flex items-center gap-2"
                          >
                            <span>View</span>
                            <ChartIcon className="w-4 h-4 text-green-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions & Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-green-900 rounded-xl p-6 border border-green-700">
              <h3 className="text-xl font-bold text-green-50 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/admin/scholarships')}
                  className="w-full flex items-center gap-3 p-4 rounded-lg bg-green-800 hover:bg-green-700 text-green-50 transition-colors text-left"
                >
                  <span className="text-2xl"><PlusIcon className="w-6 h-6" /></span>
                  <div>
                    <p className="font-semibold">Add New Scholarship</p>
                    <p className="text-sm text-green-300">Create a new scholarship program</p>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/applications')}
                  className="w-full flex items-center gap-3 p-4 rounded-lg bg-green-800 hover:bg-green-700 text-green-50 transition-colors text-left"
                >
                  <span className="text-2xl"><ClipboardIcon className="w-6 h-6" /></span>
                  <div>
                    <p className="font-semibold">Review Applications</p>
                    <p className="text-sm text-green-300">Check pending applications</p>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/reports')}
                  className="w-full flex items-center gap-3 p-4 rounded-lg bg-green-800 hover:bg-green-700 text-green-50 transition-colors text-left"
                >
                  <span className="text-2xl"><ChartIcon className="w-6 h-6" /></span>
                  <div>
                    <p className="font-semibold">Generate Report</p>
                    <p className="text-sm text-green-300">Download system reports</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-green-900 rounded-xl p-6 border border-green-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-50">Activity Overview</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setChartView('daily')} className={`px-3 py-1 rounded ${chartView==='daily'?'bg-green-600':'bg-green-800'} text-sm`}>Daily</button>
                  <button onClick={()=>setChartView('weekly')} className={`px-3 py-1 rounded ${chartView==='weekly'?'bg-green-600':'bg-green-800'} text-sm`}>Weekly</button>
                  <button onClick={()=>setChartView('yearly')} className={`px-3 py-1 rounded ${chartView==='yearly'?'bg-green-600':'bg-green-800'} text-sm`}>Yearly</button>
                </div>
              </div>
              <div className="h-64 bg-green-800/50 rounded-lg border border-green-700 p-4">
                <ActivityChart data={chartData} height={200} color="#22c55e" />
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
