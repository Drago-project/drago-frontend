// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("userData");

  // helper to redirect based on role
  const redirectForRole = (role) =>
    role?.toLowerCase().includes("doctor") ? "/dashboard" : "/home";

  // decode JWT payload safely
  const tryDecodeJwt = (raw) => {
    try {
      if (!raw || typeof raw !== "string") return null;
      const parts = raw.split(".");
      if (parts.length !== 3) return null;

      const payload = parts[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), "=");

      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  };

  let payload = token ? tryDecodeJwt(token) : null;

  // fallback to stored userData
  if (!payload && storedUser) {
    try {
      payload = JSON.parse(storedUser);
    } catch {
      payload = null;
    }
  }

  // extract role from payload or userData
  const extractRole = (p) => {
    if (!p) return null;

    // common fields
    const tryVals = [
      p.role,
      p.roles,
      p.roleName,
      p.userRole,
      p.role?.toString?.(),
    ];
    for (const v of tryVals) {
      if (v) return Array.isArray(v) ? v[0] : v;
    }

    // search keys containing 'role' (case-insensitive)
    for (const k of Object.keys(p)) {
      if (k.toLowerCase().includes("role")) {
        const val = p[k];
        return Array.isArray(val) ? val[0] : val;
      }
    }

    // search namespaced claim like "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    for (const k of Object.keys(p)) {
      if (k.toLowerCase().includes("claims/role")) {
        const val = p[k];
        return Array.isArray(val) ? val[0] : val;
      }
    }

    // nested user object
    if (p.user) return extractRole(p.user);

    return null;
  };

  const roleFromPayload = extractRole(payload);

  // check token expiration
  try {
    const now = Date.now() / 1000;
    const exp = payload && (payload.exp || payload.expiresAt);
    if (exp && exp < now) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      return <Navigate to="/auth/login" replace />;
    }
  } catch {
    /* ignore */
  }

  // if requiredRole is set, check access
  if (requiredRole) {
    const r = (roleFromPayload || "").toString().toLowerCase();
    if (r && !r.includes(requiredRole.toLowerCase())) {
      return <Navigate to={redirectForRole(r)} replace />;
    }
  }

  // all checks passed → render children
  return children;
}

export default ProtectedRoute;
