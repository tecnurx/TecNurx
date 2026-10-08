// config/adminPermissions.js

/**
 * Available Admin Types / Roles.
 * Edit or add new types here when the backend team implements admin roles.
 */
export const ADMIN_TYPES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  OPERATIONS_ADMIN: "OPERATIONS_ADMIN",
  LOGISTICS_ADMIN: "LOGISTICS_ADMIN",
  FINANCE_ADMIN: "FINANCE_ADMIN",
  SUPPORT_ADMIN: "SUPPORT_ADMIN",
};

/**
 * Route Permissions Map per Admin Type.
 * - Use '*' to grant unrestricted access to all admin subroutes.
 * - Or specify exact route path prefixes, e.g., ['/admin-dashboard', '/admin-dashboard/orders']
 */
export const ADMIN_ROLE_PERMISSIONS = {
  [ADMIN_TYPES.SUPER_ADMIN]: ["*"], // Full access to all pages

  [ADMIN_TYPES.OPERATIONS_ADMIN]: [
    "/admin-dashboard",
    "/admin-dashboard/engineers",
    "/admin-dashboard/users",
    "/admin-dashboard/orders",
    "/admin-dashboard/gadgets",
  ],

  [ADMIN_TYPES.LOGISTICS_ADMIN]: [
    "/admin-dashboard",
    "/admin-dashboard/orders",
    "/admin-dashboard/logistics",
  ],

  [ADMIN_TYPES.FINANCE_ADMIN]: [
    "/admin-dashboard",
    "/admin-dashboard/orders",
    "/admin-dashboard/transactions",
  ],

  [ADMIN_TYPES.SUPPORT_ADMIN]: [
    "/admin-dashboard",
    "/admin-dashboard/users",
    "/admin-dashboard/orders",
  ],
};

/**
 * Extracts the admin type from the logged-in user object.
 * Defaults to SUPER_ADMIN if adminType is missing (granting full access until backend integration).
 *
 * @param {Object} user - The user object from localStorage / Auth context.
 * @returns {string} The active admin type.
 */
export const getAdminType = (user) => {
  if (!user) return ADMIN_TYPES.SUPER_ADMIN;

  // Inspects possible field keys when backend sends adminType
  const type =
    user.adminType ||
    user.admin_type ||
    user.adminRole ||
    user.type ||
    user.subRole;

  if (type && ADMIN_TYPES[type.toUpperCase()]) {
    return type.toUpperCase();
  }

  // DEFAULT TO SUPER_ADMIN (Grants 100% access for now)
  return ADMIN_TYPES.SUPER_ADMIN;
};

/**
 * Determines whether a logged-in admin has permission to visit a specific route.
 *
 * @param {Object} user - The user object.
 * @param {string} pathname - The current route path (e.g. '/admin-dashboard/transactions').
 * @returns {boolean} True if access is allowed, false otherwise.
 */
export const hasAdminAccess = (user, pathname) => {
  const adminType = getAdminType(user);
  const allowedRoutes = ADMIN_ROLE_PERMISSIONS[adminType] || [];

  // Super Admin or wildcard access
  if (allowedRoutes.includes("*")) {
    return true;
  }

  // Root dashboard overview is accessible to all admins
  if (pathname === "/admin-dashboard") {
    return true;
  }

  // Check if pathname starts with any allowed route prefix
  return allowedRoutes.some(
    (route) => route !== "*" && pathname.startsWith(route)
  );
};
