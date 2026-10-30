// src/lib/roleUtils.js

/**
 * Safely extracts and normalizes the user's role from any user data structure.
 * Handles nested objects ({ user: { role } }, { data: { user: { role } } })
 * and variations in naming ("service_partner", "service partner", "eng", "customer", etc.).
 *
 * @param {Object} userData - Raw parsed user object from localStorage or API
 * @returns {string} Normalized role string: "customer" | "engineer" | "admin"
 */
export const extractUserRole = (userData) => {
  if (!userData) return "customer";

  // Handle nested objects safely
  const userObj = userData.staff || userData.user || userData.data?.staff || userData.data?.user || userData;

  // Extract role string or object role name
  const rawRole =
    (typeof userObj.role === "object" ? userObj.role?.name : userObj.role) ||
    userObj.type ||
    userObj.userType ||
    userObj.adminType ||
    "";

  const roleStr = String(rawRole)
    .toLowerCase()
    .trim()
    .replace(/_/g, "")
    .replace(/\s+/g, "");

  // 1. Customer / User role check
  if (["user", "customer", "client"].includes(roleStr)) {
    return "customer";
  }

  // 2. Engineer / Service Partner role check
  if (
    [
      "eng",
      "engineer",
      "servicepartner",
      "serviceprovider",
      "partner",
      "provider",
    ].includes(roleStr)
  ) {
    return "engineer";
  }

  // 3. Admin / Staff roles check
  if (
    [
      "admin",
      "administrator",
      "superadmin",
      "super_admin",
      "support",
      "operationsadmin",
      "logisticsadmin",
      "financeadmin",
      "supportadmin",
    ].includes(roleStr) ||
    roleStr.includes("admin") ||
    Array.isArray(userObj.permissions) ||
    (userObj.role && typeof userObj.role === "object" && Array.isArray(userObj.role.permissions))
  ) {
    return "admin";
  }

  // Default fallback if role is unrecognized
  return "customer";
};

/**
 * Returns the destination dashboard path for a given user.
 *
 * @param {Object} userData
 * @returns {string} Path: "/dashboard" | "/engineer-dashboard" | "/admin-dashboard"
 */
export const getDashboardForUser = (userData) => {
  const role = extractUserRole(userData);
  switch (role) {
    case "engineer":
      return "/engineer-dashboard";
    case "admin":
      return "/admin-dashboard";
    case "customer":
    default:
      return "/dashboard";
  }
};
