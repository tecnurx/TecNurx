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
  "/admin-dashboard/fees": ["fees:manage"],
};

/**
 * Normalizes any role string by stripping spaces, dashes, underscores, and lowercasing.
 * E.g., "Super Admin", "Super_Admin", "super-admin" -> "superadmin"
 */
export const normalizeRoleString = (role) => {
  if (!role) return "";
  return String(role)
    .toLowerCase()
    .trim()
    .replace(/[\s_\-]+/g, "");
};

/**
 * Extracts normalized permissions array from user/staff object.
 * Safely aggregates permissions from direct arrays, role objects, and nested staff objects.
 */
export const getStaffPermissions = (user) => {
  if (!user) return [];

  const rawUser = user.staff || user.user || user.data?.staff || user.data?.user || user;
  const permissionsSet = new Set();

  const addPermissions = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((p) => {
      if (!p) return;
      if (typeof p === "string") {
        permissionsSet.add(p.trim());
      } else if (typeof p === "object") {
        const val = p.key || p.name || p.code || p.permission || p.value || p.slug;
        if (val && typeof val === "string") {
          permissionsSet.add(val.trim());
        }
      }
    });
  };

  // 1. Direct permissions
  addPermissions(rawUser.permissions);
  addPermissions(user.permissions);

  // 2. Nested under role
  if (rawUser.role && typeof rawUser.role === "object") {
    addPermissions(rawUser.role.permissions);
  }
  if (user.role && typeof user.role === "object") {
    addPermissions(user.role.permissions);
  }

  // 3. Nested under data
  if (user.data?.permissions) {
    addPermissions(user.data.permissions);
  }

  return Array.from(permissionsSet);
};

/**
 * Checks whether a staff user is a Super Admin via role name, flags, or wildcard permissions.
 */
export const isStaffSuperAdmin = (user) => {
  if (!user) return false;

  const rawUser = user.staff || user.user || user.data?.staff || user.data?.user || user;

  // 1. Check explicit boolean flags
  if (
    rawUser.isSuperAdmin === true ||
    rawUser.is_super_admin === true ||
    user.isSuperAdmin === true ||
    user.is_super_admin === true ||
    rawUser.role?.isSuperAdmin === true ||
    rawUser.role?.is_super_admin === true
  ) {
    return true;
  }

  // 2. Check all possible role names
  const roleCandidates = [
    typeof rawUser.role === "string" ? rawUser.role : null,
    rawUser.role?.name,
    rawUser.role?.slug,
    rawUser.role?.role,
    rawUser.role?.title,
    rawUser.roleName,
    rawUser.adminType,
    rawUser.adminRole,
    rawUser.type,
    typeof user.role === "string" ? user.role : null,
    user.role?.name,
    user.role?.slug,
    user.roleName,
    user.adminType,
  ];

  for (const candidate of roleCandidates) {
    if (!candidate) continue;
    const clean = normalizeRoleString(candidate);
    if (
      clean === "superadmin" ||
      clean.includes("superadmin") ||
      (clean.includes("super") && clean.includes("admin"))
    ) {
      return true;
    }
  }

  // 3. Check wildcard permissions
  const permissions = getStaffPermissions(user);
  if (
    permissions.includes("*") ||
    permissions.includes("all") ||
    permissions.includes("super_admin") ||
    permissions.includes("superadmin")
  ) {
    return true;
  }

  return false;
};

/**
 * Extracts role name (e.g. 'super_admin', 'admin', 'finance')
 */
export const getStaffRoleName = (user) => {
  if (!user) return "";

  if (isStaffSuperAdmin(user)) {
    return "super_admin";
  }

  const rawUser = user.staff || user.user || user.data?.staff || user.data?.user || user;

  const candidate =
    (typeof rawUser.role === "string" ? rawUser.role : rawUser.role?.name) ||
    rawUser.role?.slug ||
    rawUser.role?.role ||
    rawUser.roleName ||
    rawUser.adminType ||
    rawUser.adminRole ||
    rawUser.type ||
    (typeof user.role === "string" ? user.role : user.role?.name) ||
    user.roleName ||
    user.adminType ||
    "";

  return String(candidate).trim().toLowerCase();
};

/**
 * Helper for user-facing display of active admin type
 */
export const getAdminType = (user) => {
  if (isStaffSuperAdmin(user)) return "SUPER ADMIN";
  const roleName = getStaffRoleName(user);
  if (roleName) return roleName.replace(/[_\-]/g, " ").toUpperCase();
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

  // Super admin always has all permissions
  if (isStaffSuperAdmin(user)) {
    return true;
  }

  const userPermissions = getStaffPermissions(user);
  if (userPermissions.includes("*") || userPermissions.includes("all")) {
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
    isSuperAdmin: isStaffSuperAdmin(currentUser),
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
  // RULE: Dashboard is ALWAYS accessible to any authenticated user regardless of roles/permissions
  if (
    pathname === "/admin-dashboard" ||
    pathname === "/admin-dashboard/" ||
    pathname === "/dashboard" ||
    pathname === "/dashboard/"
  ) {
    return true;
  }

  if (!user) return true; // Default allow during initial client hydration

  // 1. Super admin always has unrestricted access to everything
  if (isStaffSuperAdmin(user)) {
    return true;
  }

  const permissions = getStaffPermissions(user);

  // 2. Wildcard permission ("*" or "all") grants full access to everything
  if (permissions.includes("*") || permissions.includes("all")) {
    return true;
  }

  // 3. Find matching route rule (checks exact match or route prefix)
  const matchingRouteKey = Object.keys(ROUTE_PERMISSIONS).find(
    (routePrefix) => pathname === routePrefix || pathname.startsWith(routePrefix + "/")
  );

  if (matchingRouteKey) {
    const requiredPermissions = ROUTE_PERMISSIONS[matchingRouteKey];
    return requiredPermissions.some((perm) => permissions.includes(perm));
  }

  // 4. Default fallback for standard 'admin' role if no granular permissions rule is matched
  const roleName = getStaffRoleName(user);
  const cleanRole = normalizeRoleString(roleName);
  if (cleanRole === "admin" || cleanRole.includes("admin")) {
    return true;
  }

  return false;
};
