import axios from "axios"
import { getAuthRole, clearAuthRole } from "../hooks/useAuthRole"

const API = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

// Attach the current auth role to each request so the backend can correlate it.
// The backend enforces access via cookies/JWT; this header is informational only.
API.interceptors.request.use((config) => {
    const role = getAuthRole();
    if (role) {
        config.headers['X-User-Role'] = role;
    }
    return config;
})

// After each response, sync the auth state from the server.
// If the server returns a fresh token (e.g. after login/profile update), store it.
API.interceptors.response.use(
    (res) => {
        // Some login/profile endpoints echo the token back in the body.
        if (res.data && res.data.token) {
            localStorage.setItem('student_token', res.data.token);
        }
        return res;
    },
    (err) => {
        // 401/403 responses mean the session or role is no longer valid.
        // Clear local role state so the UI can react (e.g. redirect to login).
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            clearAuthRole();
            localStorage.removeItem('student_token');
        }
        return Promise.reject(err);
    }
)

export default API;