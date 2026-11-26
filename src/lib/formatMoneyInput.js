/**
 * Strips non-numeric characters (keeping at most one decimal point)
 * so state always holds a clean, unformatted numeric string for API submission.
 */
export function sanitizeMoneyInput(value) {
  if (value === undefined || value === null) return "";
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

/**
 * Formats a raw numeric string/number with thousand-separator commas for display.
 */
export function formatMoneyInput(value) {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value);
  const [intPart, decPart] = str.split(".");
  const formattedInt = intPart ? Number(intPart).toLocaleString("en-US") : "";
  if (decPart !== undefined) {
    return `${formattedInt}.${decPart}`;
  }
  return formattedInt;
}
