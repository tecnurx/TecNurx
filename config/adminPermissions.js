// config/adminPermissions.js
"use client";

import { useEffect, useState } from "react";

/**
 * Route-to-Permission Mapping for staff roles.
 * Each route maps to an array of valid permissions (any match grants access).
 */
export const ROUTE_PERMISSIONS = {
  "/admin-dashboard/staff": ["staff:manage"],
  "/admin-dashboard/roles": ["roles:manage"],
  "/admin-dashboard/transactions": [
    "payments:read",
    "payments:manage",
    "payments:write",
  ],
  "/admin-dashboard/orders": [
    "repairs:read",
    "repairs:manage",
    "repairs:assign",
    "repairs:write",
  ],
  "/admin-dashboard/engineers": [
    "engineers:manage",
    "engineers:verify",
    "users:read",
    "users:manage",
  ],
  "/admin-dashboard/users": [
    "users:read",
    "users:manage",
  ],
  "/admin-dashboard/logistics": [
    "logistics:manage",
    "logistics:read",
  ],
  "/admin-dashboard/gadgets": [
    "catalog:manage",
    "catalog:read",
    "services:manage",
    "services:read",
  ],
  "/admin-dashboard/support": [
    "support:tickets:read",
    "support:tickets:reply",
    "support:manage",
    "support:read",
  ],
};

/**
 * Extracts normalized permissions array from user/staff object
 */
export const getStaffPermissions = (user) => {
  if (!user) return [];

  // 1. Direct permissions array on user
  if (Array.isArray(user.permissions)) {
    return user.permissions.map((p) => (typeof p === "string" ? p : p.key || p.name));
  }

  // 2. Nested under role object
  if (user.role && typeof user.role === "object" && Array.isArray(user.role.permissions)) {
    return user.role.permissions.map((p) => (typeof p === "string" ? p : p.key || p.name));
  }

  // 3. Nested under data.staff or staff
  const staffObj = user.staff || user.data?.staff;
  if (staffObj) {
    return getStaffPermissions(staffObj);
  }

  return [];
};

/**
 * Extracts role name (e.g. 'super_admin', 'admin', 'finance')
 */
export const getStaffRoleName = (user) => {
  if (!user) return "";
  if (typeof user.role === "string") return user.role.toLowerCase();
  if (user.role && typeof user.role === "object" && user.role.name) {
    return user.role.name.toLowerCase();
  }
  const staffObj = user.staff || user.data?.staff;
  if (staffObj) {
    return getStaffRoleName(staffObj);
  }
  const legacyRole = user.adminType || user.adminRole || user.type;
  return legacyRole ? String(legacyRole).toLowerCase() : "";
};

/**
 * Helper for user-facing display of active admin type
 */
export const getAdminType = (user) => {
  const roleName = getStaffRoleName(user);
  if (roleName) return roleName.replace(/_/g, " ").toUpperCase();
  return "ADMIN";
};

/**
 * Checks if a user has a specific granular permission or wildcard
 *
 * @param {Object} user - The logged-in staff/user object
 * @param {string|string[]} permission - The required permission string or array of permissions
 * @returns {boolean} True if authorized
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;

  const roleName = getStaffRoleName(user);
  if (roleName === "super_admin" || roleName === "superadmin") {
    return true;
  }

  const userPermissions = getStaffPermissions(user);
  if (userPermissions.includes("*")) {
    return true;
  }

  if (Array.isArray(permission)) {
    return permission.some((p) => userPermissions.includes(p));
  }

  return userPermissions.includes(permission);
};

/**
 * React hook for consuming staff permissions inside client components
 */
export const useStaffPermissions = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("staff") || localStorage.getItem("user");
      if (userJson) {
        try {
          setCurrentUser(JSON.parse(userJson));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }
  }, []);

  const can = (permission) => hasPermission(currentUser, permission);

  return {
    currentUser,
    can,
    roleName: getStaffRoleName(currentUser),
    isSuperAdmin: getStaffRoleName(currentUser) === "super_admin" || can("*"),
  };
};

/**
 * Determines whether a logged-in staff member has permission to visit a route.
 *
 * @param {Object} user - The logged-in staff/user object from localStorage.
 * @param {string} pathname - Current route path (e.g. '/admin-dashboard/orders/123').
 * @returns {boolean} True if authorized, false otherwise.
 */
export const hasAdminAccess = (user, pathname) => {
  if (!user) return true; // Default allow until auth fully mounts

  const roleName = getStaffRoleName(user);

  // 1. Super admin always has unrestricted access to everything
  if (roleName === "super_admin" || roleName === "superadmin") {
    return true;
  }

  const permissions = getStaffPermissions(user);

  // 2. Wildcard permission ("*") grants full access to everything
  if (permissions.includes("*")) {
    return true;
  }

  // 3. Root dashboard overview is accessible to all authenticated staff
  if (pathname === "/admin-dashboard") {
    return true;
  }

  // 4. Find matching route rule (checks exact match or route prefix)
  const matchingRouteKey = Object.keys(ROUTE_PERMISSIONS).find(
    (routePrefix) => pathname === routePrefix || pathname.startsWith(routePrefix + "/")
  );

  if (matchingRouteKey) {
    const requiredPermissions = ROUTE_PERMISSIONS[matchingRouteKey];
    return requiredPermissions.some((perm) => permissions.includes(perm));
  }

  // 5. Default fallback for standard 'admin' role if no granular permissions rule is matched
  if (roleName === "admin") {
    return true;
  }

  return false;
};
