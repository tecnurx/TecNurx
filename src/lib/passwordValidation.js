// src/lib/passwordValidation.js

/**
 * Standard password validation criteria:
 * - At least 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character
 */

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']).{8,}$/;

export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return {
      isValid: false,
      message: "Password is required.",
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must include at least one lowercase letter (a-z).",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must include at least one uppercase letter (A-Z).",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must include at least one number (0-9).",
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password)) {
    return {
      isValid: false,
      message: "Password must include at least one special character (!@#$%^&*...).",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

export const getPasswordRequirements = (password = "") => {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(password) },
    { label: "At least one special character (!@#$...)", met: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password) },
  ];
};
