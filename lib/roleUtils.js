// lib/roleUtils.js

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
  const userObj =
    userData.user ||
    userData.data?.user ||
    userData.staff ||
    userData.data?.staff ||
    userData;

  // Direct staff type check
  if (userObj.type === "staff" || userObj.isStaff || !!userObj.staffId) {
    return "admin";
  }

  const roleValue =
    typeof userObj.role === "object" && userObj.role !== null
      ? userObj.role.name || userObj.role.slug || userObj.role.title || ""
      : userObj.role || userObj.type || userObj.userType || "";

  const roleStr = String(roleValue)
    .toLowerCase()
    .trim()
    .replace(/_/g, "")
    .replace(/\s+/g, "");

  // 1. Admin / Staff check
  if (
    ["admin", "administrator", "superadmin", "staff", "manager", "support"].includes(
      roleStr
    ) ||
    roleStr.includes("admin") ||
    roleStr.includes("staff")
  ) {
    return "admin";
  }

  // 2. Engineer / Service Partner check
  if (
    [
      "eng",
      "engineer",
      "servicepartner",
      "serviceprovider",
      "partner",
      "provider",
    ].includes(roleStr) ||
    roleStr.includes("engineer") ||
    roleStr.includes("partner")
  ) {
    return "engineer";
  }

  // 3. Customer / User check
  if (["user", "customer", "client"].includes(roleStr)) {
    return "customer";
  }

  // Fallback: If user has staff permissions array, classify as admin
  if (
    Array.isArray(userObj.permissions) ||
    Array.isArray(userObj.role?.permissions)
  ) {
    return "admin";
  }

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
