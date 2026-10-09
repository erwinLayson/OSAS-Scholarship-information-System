import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import ApplicantRegister from './pages/applicants/ApplicantRegister'
import Login from "./pages/Login";
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

// Role-based route guards.
const AdminRoute = (props) => (
  <ProtectedRoutes allowedRoles={["admin"]} {...props} />
);

const StudentRoute = (props) => (
  <ProtectedRoutes allowedRoles={["student"]} {...props} />
);

function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<ApplicantRegister/>} />
          <Route path='/home' element={<LandingPages/>} />

          {/* Protected Student Routes (students only) */}
          <Route path='/student/dashboard' element={<StudentRoute elements={<StudentDashboard/>}/>} />

          {/* Protected Admin Routes (admins only) */}
          <Route path='/' element={<AdminRoute elements={<AdminDashboard/>}/>} />
          <Route path='/dashboard' element={<AdminRoute elements={<AdminDashboard/>}/>} />
          <Route path='/admin/students' element={<AdminRoute elements={<Students/>}/>} />
          <Route path='/admin/manage' element={<AdminRoute elements={<ManageAdmin/>}/>} />
          <Route path='/admin/applications' element={<AdminRoute elements={<Applications/>}/>} />
          <Route path='/admin/scholarships/applications' element={<AdminRoute elements={<ScholarshipApplications/>}/>} />
          <Route path='/admin/scholarships' element={<AdminRoute elements={<Scholarships/>}/>} />
          <Route path='/admin/reports' element={<AdminRoute elements={<Reports/>}/>} />
          <Route path='/admin/settings' element={<AdminRoute elements={<Settings/>}/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
