// Reads and writes the customer's dietary profile to the browser's
// localStorage. This is a LOCAL PROTOTYPE ONLY — localStorage is plain,
// unencrypted browser storage. It is fine for demo preferences on your own
// device, but it is NOT secure storage for sensitive health information and
// nothing here is ever sent to OpenRouter or any other server.

import { GOAL_OPTIONS, DIETARY_PREFERENCE_OPTIONS, ALLERGY_OPTIONS, BUDGET_PERIODS } from "../data/profileOptions";

const STORAGE_KEY = "freshkwt.dietProfile.v1";

const GOAL_IDS = GOAL_OPTIONS.map((o) => o.id);
const PREFERENCE_IDS = DIETARY_PREFERENCE_OPTIONS.map((o) => o.id);
const ALLERGY_IDS = ALLERGY_OPTIONS.map((o) => o.id);
const PERIOD_IDS = BUDGET_PERIODS.map((o) => o.id);

// The shape used everywhere else in the app. Keeping one function that
// produces this shape means every consumer can rely on it always looking
// the same, even right after "Clear Profile".
export function emptyProfile() {
  return {
    goals: [],
    dietaryPreferences: [],
    allergies: [],
    otherAllergyText: "",
    avoidIngredients: "",
    budget: { amount: null, period: "weekly" },
    nutritionTargets: { calories: null, protein: null, carbs: null, fat: null },
    updatedAt: null,
  };
}

// Keeps only numbers that are finite and >= 0; anything else becomes null.
// This is the safety net for corrupted/old localStorage data, independent
// from the form's own live validation.
function sanitizeNonNegativeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

function sanitizeStringArray(value, allowedIds) {
  if (!Array.isArray(value)) return [];
  return value.filter((id) => typeof id === "string" && allowedIds.includes(id));
}

function sanitizeText(value) {
  return typeof value === "string" ? value : "";
}

// Takes whatever was parsed from localStorage (which could be anything —
// an old version, a typo'd file, or garbage) and returns a safe, complete
// profile object. Never throws.
function sanitizeProfile(raw) {
  const base = emptyProfile();
  if (!raw || typeof raw !== "object") return base;

  const budgetRaw = raw.budget && typeof raw.budget === "object" ? raw.budget : {};
  const nutritionRaw = raw.nutritionTargets && typeof raw.nutritionTargets === "object" ? raw.nutritionTargets : {};

  return {
    goals: sanitizeStringArray(raw.goals, GOAL_IDS),
    dietaryPreferences: sanitizeStringArray(raw.dietaryPreferences, PREFERENCE_IDS),
    allergies: sanitizeStringArray(raw.allergies, ALLERGY_IDS),
    otherAllergyText: sanitizeText(raw.otherAllergyText),
    avoidIngredients: sanitizeText(raw.avoidIngredients),
    budget: {
      amount: sanitizeNonNegativeNumber(budgetRaw.amount),
      period: PERIOD_IDS.includes(budgetRaw.period) ? budgetRaw.period : "weekly",
    },
    nutritionTargets: {
      calories: sanitizeNonNegativeNumber(nutritionRaw.calories),
      protein: sanitizeNonNegativeNumber(nutritionRaw.protein),
      carbs: sanitizeNonNegativeNumber(nutritionRaw.carbs),
      fat: sanitizeNonNegativeNumber(nutritionRaw.fat),
    },
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : base.updatedAt,
  };
}

// Returns the saved profile (sanitized) or null if nothing valid was saved yet.
export function loadProfile() {
  let rawText;
  try {
    rawText = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage can throw in private-browsing modes on some browsers.
    return null;
  }
  if (!rawText) return null;

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Corrupted JSON — treat it as if nothing was saved, rather than crashing.
    return null;
  }

  return sanitizeProfile(parsed);
}

// Returns true if the save succeeded, false otherwise (e.g. storage full or disabled).
export function saveProfile(profile) {
  const toSave = { ...sanitizeProfile(profile), updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch {
    return false;
  }
}

export function clearProfile() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing more we can do if localStorage itself is unavailable.
  }
}
