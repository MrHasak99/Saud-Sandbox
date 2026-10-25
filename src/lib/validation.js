// Small, reusable validation helpers (not tied to any one feature).

// Parses a text input into either:
//   { value: number, error: null }   — a valid, non-negative number
//   { value: null, error: null }     — the field was left blank (that's allowed)
//   { value: null, error: "..." }    — the text isn't a valid non-negative number
// This is used for optional numeric fields like budget and nutrition targets,
// where "leave it blank" must always be a valid choice.
export function parseOptionalNonNegativeNumber(rawText) {
  const trimmed = (rawText ?? "").toString().trim();
  if (trimmed === "") return { value: null, error: null };

  const num = Number(trimmed);
  if (Number.isNaN(num)) return { value: null, error: "Enter a valid number." };
  if (num < 0) return { value: null, error: "Value cannot be negative." };

  return { value: num, error: null };
}
