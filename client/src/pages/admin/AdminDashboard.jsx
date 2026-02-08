import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/shareFIles/AdminLayout';
import API from '../../API/fetchAPI';
import ActivityChart from '../../components/admin/ActivityChart';
import { StatCard, Card, Badge, Button } from '../../components/shared/ui';
import { PeopleIcon, ClipboardIcon, SuccessIcon, ChartIcon, PlusIcon, EyeIcon, FileTextIcon } from '../../components/shared/Icons';

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

  return (
    <AdminLayout activeMenu="dashboard" title="Dashboard" subtitle="Welcome back, Admin!">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={loading ? '...' : stats.totalStudents}
            icon={<PeopleIcon size="1.5rem" />}
            color="blue"
          />
          <StatCard
            title="Pending Applications"
            value={loading ? '...' : stats.pendingApplications}
            icon={<ClipboardIcon size="1.5rem" />}
            color="amber"
          />
          <StatCard
            title="Approved Applications"
            value={loading ? '...' : stats.approvedApplications}
            icon={<SuccessIcon size="1.5rem" />}
            color="emerald"
          />
          <StatCard
            title="Total Applications"
            value={loading ? '...' : stats.totalApplications}
            icon={<ChartIcon size="1.5rem" />}
            color="purple"
          />
        </div>

        {/* Recent Applications */}      
        <Card 
          title="Recent Applications"
          headerAction={
            <Button 
              onClick={() => navigate('/admin/applications')}
              variant="secondary"
              size="sm"
            >
              View All
            </Button>
          }
        >
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileTextIcon className="text-gray-400" size="2rem" />
              </div>
              <p className="text-gray-500 text-lg">No applications yet</p>
              <p className="text-gray-400 text-sm mt-2">Applications will appear here when students apply</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Student</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Email</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Date</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-800 font-medium">{app.student}</td>
                      <td className="py-3 px-4 text-gray-600">{app.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'error' : 'warning'}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{app.date}</td>
                      <td className="py-3 px-4">
                        <Button 
                          variant="ghost"
                          size="sm"
                          icon={<EyeIcon size="1rem" />}
                          onClick={() => navigate('/admin/applications')}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Actions & Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/scholarships')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="w-12 h-12 bg-emerald-200 rounded-xl flex items-center justify-center">
                  <PlusIcon className="text-emerald-600" size="1.5rem" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Add New Scholarship</p>
                  <p className="text-sm text-gray-500">Create a new scholarship program</p>
                </div>
              </button>
              <button 
                onClick={() => navigate('/admin/applications')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                  <ClipboardIcon className="text-blue-600" size="1.5rem" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Review Applications</p>
                  <p className="text-sm text-gray-500">Check pending applications</p>
                </div>
              </button>
              <button 
                onClick={() => navigate('/admin/reports')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                  <ChartIcon className="text-purple-600" size="1.5rem" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Generate Report</p>
                  <p className="text-sm text-gray-500">Download system reports</p>
                </div>
              </button>
            </div>
          </Card>

          {/* Activity Chart */}
          <Card 
            title="Activity Overview"
            headerAction={
              <div className="flex items-center gap-2">
                <button 
                  onClick={()=>setChartView('daily')} 
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chartView==='daily' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Daily
                </button>
                <button 
                  onClick={()=>setChartView('weekly')} 
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chartView==='weekly' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={()=>setChartView('yearly')} 
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${chartView==='yearly' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Yearly
                </button>
              </div>
            }
          >
            <div className="h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
              <ActivityChart data={chartData} height={200} color="#10b981" />
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
