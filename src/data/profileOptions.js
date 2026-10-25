// The fixed lists of choices shown in the dietary profile form.
// Each option has a stable `id` (used as the data key) and a `label` (shown to the user).

export const GOAL_OPTIONS = [
  { id: "muscleGain", label: "Muscle gain" },
  { id: "weightLoss", label: "Weight loss" },
  { id: "weightMaintenance", label: "Weight maintenance" },
  { id: "healthyEating", label: "General healthy eating" },
  { id: "other", label: "Other" },
];

export const DIETARY_PREFERENCE_OPTIONS = [
  { id: "none", label: "No specific preference" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "halal", label: "Halal preference" },
  { id: "other", label: "Other preferences" },
];

export const ALLERGY_OPTIONS = [
  { id: "peanuts", label: "Peanuts" },
  { id: "treeNuts", label: "Tree nuts" },
  { id: "milk", label: "Milk" },
  { id: "eggs", label: "Eggs" },
  { id: "fish", label: "Fish" },
  { id: "shellfish", label: "Shellfish" },
  { id: "wheat", label: "Wheat" },
  { id: "soy", label: "Soy" },
  { id: "sesame", label: "Sesame" },
  { id: "other", label: "Other allergies" },
];

export const BUDGET_PERIODS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
];
