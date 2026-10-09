import { useState, useEffect } from 'react';

/**
 * Client-side role tracker.
 * The server is the source of truth (JWT payload + role checks).
 * This hook keeps a local mirror so UI components (navbar, layouts, protectRoutes)
 * can react to the current role without an extra round-trip on every render.
 *
 * Role is set explicitly by login pages and cleared on logout / 401/403.
 */
let roleState = typeof window !== 'undefined' ? localStorage.getItem('user_role') || null : null;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(roleState));
}

export function setAuthRole(role) {
  roleState = role ?? null;
  if (typeof window !== 'undefined') {
    if (roleState) {
      localStorage.setItem('user_role', roleState);
    } else {
      localStorage.removeItem('user_role');
    }
  }
  notify();
}

export function getAuthRole() {
  return roleState;
}

export function clearAuthRole() {
  setAuthRole(null);
}

export function useAuthRole() {
  const [role, setRole] = useState(roleState);

  useEffect(() => {
    const handler = () => setRole(roleState);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return role;
}

export default useAuthRole;
