// Small helpers for showing Kuwaiti Dinar (KWD) prices consistently.
//
// WHY 3 DECIMAL PLACES? Most currencies use 2 decimals (like 1.50 USD),
// but KWD's smallest coin is the "fils" and there are 1000 fils in 1 KWD.
// So prices should always show 3 digits after the dot, e.g. 0.450 KD.
//
// We use amount.toFixed(3) instead of Intl.NumberFormat so the output is
// predictable across every browser, instead of depending on locale support.

export function formatKwd(amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—";
  return `${amount.toFixed(3)} KD`;
}

// Rounds a KWD amount to the nearest fils (3 decimal places) as a NUMBER
// (not a string). Use this after any add/multiply on money so repeated
// calculations (basket subtotals, etc.) don't drift due to normal floating
// point rounding error (e.g. 0.1 + 0.2 !== 0.3 in JavaScript).
export function roundKwd(amount) {
  return Math.round(amount * 1000) / 1000;
}

