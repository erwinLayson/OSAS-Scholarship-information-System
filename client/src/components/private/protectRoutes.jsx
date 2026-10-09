import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import API from "../../API/fetchAPI";
import { setAuthRole, clearAuthRole } from "../../hooks/useAuthRole";

// Where each role lands after login / when bounced off a route it can't access.
export const HOME_BY_ROLE = {
  admin: "/dashboard",
  student: "/student/dashboard",
};

const homeForRole = (role) => HOME_BY_ROLE[role] || "/login";

/**
 * Route guard with role-based access control.
 *
 * The server's GET /auth/me is the single source of truth for "who am I?".
 * - Not authenticated  -> redirect to the shared /login page.
 * - Authenticated but role not in `allowedRoles` -> redirect to that role's home.
 *
 * @param {object}   props
 * @param {React.Element} props.elements     element(s) to render when allowed
 * @param {string[]} props.allowedRoles      roles permitted ([] = any logged-in user)
 */
export default function ProtectedRoutes({ elements, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await API.get("/auth/me");
        if (cancelled) return;

        if (res.data.success && res.data.user) {
          const currentRole = res.data.user.role || "user";
          // Mirror the server-authoritative role into client state.
          setAuthRole(currentRole);
          setRole(currentRole);
        } else {
          clearAuthRole();
          setRole(null);
        }
      } catch (err) {
        if (cancelled) return;
        clearAuthRole();
        setRole(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 via-green-700 to-emerald-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Not signed in -> the shared login page.
  if (!role) return <Navigate to="/login" replace />;

  // Role-based access filter: signed in but the wrong account type.
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return elements;
}
