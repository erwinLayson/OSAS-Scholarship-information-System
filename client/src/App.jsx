import { HashRouter, Routes, Route } from "react-router-dom";

import ApplicantRegister from './components/applicants/ApplicantRegister'
import AdminLogin from "./components/admin/AdminLogin";
import StudentLogin from "./components/students/StudentLogin";
import StudentDashboard from "./components/students/StudentDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import Students from "./components/admin/Students";
import ManageAdmin from "./components/admin/ManageAdmin";
import Applications from "./components/admin/Applications";
import ScholarshipApplications from "./components/admin/ScholarshipApplications";
import Scholarships from "./components/admin/Scholarships";
import Reports from "./components/admin/Reports";
import Settings from "./components/admin/Settings";

// Protec routes
import ProtectedRoutes from "./components/private/protectRoutes"
import { LandingPages } from "./components/shared/LandingPages";

function App() {

  return (
    <>
      <HashRouter>
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
      </HashRouter>
    </>
  )
}

export default App
