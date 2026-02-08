import { HashRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import ApplicantRegister from './pages/applicants/ApplicantRegister'
import AdminLogin from "./pages/admin/AdminLogin";
import StudentLogin from "./pages/students/StudentLogin";
import StudentDashboard from "./pages/students/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import ManageAdmin from "./pages/admin/ManageAdmin";
import Applications from "./pages/admin/Applications";
import ScholarshipApplications from "./pages/admin/ScholarshipApplications";
import Scholarships from "./pages/admin/Scholarships";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import { LandingPages } from "./pages/LandingPages";

// Components
import ProtectedRoutes from "./components/private/protectRoutes"

function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<AdminLogin/>} />
          <Route path='/student/login' element={<StudentLogin/>} />
          <Route path='/register' element={<ApplicantRegister/>} />
          <Route path='/home' element={<LandingPages/>} />
          
          {/* Protected Student Routes */}
          <Route path='/student/dashboard' element={<StudentDashboard/>} />
          
          {/* Protected Admin Routes */}
          <Route path='/' element={<ProtectedRoutes url={'admin'} elements={<AdminDashboard/>}/>} />
          <Route path='/dashboard' element={<ProtectedRoutes  url={'admin'} elements={<AdminDashboard/>}/>} />
          <Route path='/admin/students' element={<ProtectedRoutes url={'admin'} elements={<Students/>}/>} />
          <Route path='/admin/manage' element={<ProtectedRoutes url={'admin'} elements={<ManageAdmin/>}/>} />
          <Route path='/admin/applications' element={<ProtectedRoutes  url={'admin'} elements={<Applications/>}/>} />
          <Route path='/admin/scholarships/applications' element={<ProtectedRoutes url={'admin'} elements={<ScholarshipApplications/>}/>} />
          <Route path='/admin/scholarships' element={<ProtectedRoutes url={'admin'} elements={<Scholarships/>}/>} />
          <Route path='/admin/reports' element={<ProtectedRoutes url={'admin'} elements={<Reports/>}/>} />
          <Route path='/admin/settings' element={<ProtectedRoutes  url={'admin'} elements={<Settings/>}/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
