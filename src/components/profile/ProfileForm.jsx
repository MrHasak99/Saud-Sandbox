import { useState } from "react";
import MultiSelectPills from "./MultiSelectPills";
import NumberField from "./NumberField";
import { GOAL_OPTIONS, DIETARY_PREFERENCE_OPTIONS, ALLERGY_OPTIONS, BUDGET_PERIODS } from "../../data/profileOptions";
import { parseOptionalNonNegativeNumber } from "../../lib/validation";

// Turns the saved profile shape into form-friendly state: numbers become
// text (so the user can freely type/clear them), everything else is copied.
function profileToDraft(profile) {
  return {
    goals: profile.goals,
    dietaryPreferences: profile.dietaryPreferences,
    allergies: profile.allergies,
    otherAllergyText: profile.otherAllergyText,
    avoidIngredients: profile.avoidIngredients,
    budgetPeriod: profile.budget.period,
    budgetAmountText: profile.budget.amount === null ? "" : String(profile.budget.amount),
    caloriesText: profile.nutritionTargets.calories === null ? "" : String(profile.nutritionTargets.calories),
    proteinText: profile.nutritionTargets.protein === null ? "" : String(profile.nutritionTargets.protein),
    carbsText: profile.nutritionTargets.carbs === null ? "" : String(profile.nutritionTargets.carbs),
    fatText: profile.nutritionTargets.fat === null ? "" : String(profile.nutritionTargets.fat),
  };
}

export default function ProfileForm({ initialProfile, onSave, onCancel }) {
  // A fresh draft is built once when the form mounts, so cancelling just
  // discards it — the saved profile is never touched until Save succeeds.
  const [draft, setDraft] = useState(() => profileToDraft(initialProfile));
  const [errors, setErrors] = useState({});

  const toggleGoal = (id) =>
    setDraft((d) => ({
      ...d,
      goals: d.goals.includes(id) ? d.goals.filter((g) => g !== id) : [...d.goals, id],
    }));

  // Picking "No specific preference" clears the rest; picking anything else
  // removes "No specific preference" — they don't make sense together.
  const togglePreference = (id) =>
    setDraft((d) => {
      if (id === "none") return { ...d, dietaryPreferences: ["none"] };
      const without = d.dietaryPreferences.filter((p) => p !== "none");
      const next = without.includes(id) ? without.filter((p) => p !== id) : [...without, id];
      return { ...d, dietaryPreferences: next };
    });

  const toggleAllergy = (id) =>
    setDraft((d) => ({
      ...d,
      allergies: d.allergies.includes(id) ? d.allergies.filter((a) => a !== id) : [...d.allergies, id],
    }));

  const setField = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    const budget = parseOptionalNonNegativeNumber(draft.budgetAmountText);
    const calories = parseOptionalNonNegativeNumber(draft.caloriesText);
    const protein = parseOptionalNonNegativeNumber(draft.proteinText);
    const carbs = parseOptionalNonNegativeNumber(draft.carbsText);
    const fat = parseOptionalNonNegativeNumber(draft.fatText);

    const nextErrors = {
      budgetAmount: budget.error,
      calories: calories.error,
      protein: protein.error,
      carbs: carbs.error,
      fat: fat.error,
    };
    const hasErrors = Object.values(nextErrors).some(Boolean);
    setErrors(nextErrors);
    if (hasErrors) return;

    onSave({
      goals: draft.goals,
      dietaryPreferences: draft.dietaryPreferences,
      allergies: draft.allergies,
      otherAllergyText: draft.otherAllergyText.trim(),
      avoidIngredients: draft.avoidIngredients.trim(),
      budget: { amount: budget.value, period: draft.budgetPeriod },
      nutritionTargets: { calories: calories.value, protein: protein.value, carbs: carbs.value, fat: fat.value },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Food goals */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Food goals</h3>
        <p className="mt-0.5 text-xs text-slate-500">Select any that apply — this just helps us tailor suggestions.</p>
        <div className="mt-2">
          <MultiSelectPills options={GOAL_OPTIONS} selectedIds={draft.goals} onToggle={toggleGoal} />
        </div>
      </section>

      {/* Dietary preferences */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Dietary preferences</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          We never assume a product is halal automatically — you'll always need to check packaging.
        </p>
        <div className="mt-2">
          <MultiSelectPills
            options={DIETARY_PREFERENCE_OPTIONS}
            selectedIds={draft.dietaryPreferences}
            onToggle={togglePreference}
          />
        </div>
      </section>

      {/* Allergies */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Allergies</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          We treat these as hard limits once allergy-aware recommendations are added in a later stage.
        </p>
        <div className="mt-2">
          <MultiSelectPills options={ALLERGY_OPTIONS} selectedIds={draft.allergies} onToggle={toggleAllergy} />
        </div>
        {draft.allergies.includes("other") && (
          <input
            type="text"
            value={draft.otherAllergyText}
            onChange={(e) => setField("otherAllergyText")(e.target.value)}
            placeholder="Describe your other allergy..."
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        )}
      </section>

      {/* Foods to avoid (not an allergy) */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Foods you'd rather avoid</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Optional — things you dislike or prefer to skip, separate from any allergy above.
        </p>
        <textarea
          value={draft.avoidIngredients}
          onChange={(e) => setField("avoidIngredients")(e.target.value)}
          placeholder="e.g. mushrooms, cilantro, very spicy food..."
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </section>

      {/* Grocery budget */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Grocery budget</h3>
        <p className="mt-0.5 text-xs text-slate-500">Optional — leave blank if you'd rather not set one.</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <NumberField
              label="Amount"
              unit="KD"
              value={draft.budgetAmountText}
              onChange={setField("budgetAmountText")}
              error={errors.budgetAmount}
              placeholder="e.g. 25"
            />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-700">Period</span>
            <div className="mt-1 flex gap-2">
              {BUDGET_PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setField("budgetPeriod")(p.id)}
                  className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                    draft.budgetPeriod === p.id
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition targets */}
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Daily nutrition targets</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Optional and entirely up to you — these are general personal targets, not medical advice.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <NumberField
            label="Calories"
            unit="kcal"
            value={draft.caloriesText}
            onChange={setField("caloriesText")}
            error={errors.calories}
            placeholder="e.g. 2200"
          />
          <NumberField
            label="Protein"
            unit="g"
            value={draft.proteinText}
            onChange={setField("proteinText")}
            error={errors.protein}
            placeholder="e.g. 150"
          />
          <NumberField
            label="Carbohydrates"
            unit="g"
            value={draft.carbsText}
            onChange={setField("carbsText")}
            error={errors.carbs}
            placeholder="e.g. 220"
          />
          <NumberField
            label="Fat"
            unit="g"
            value={draft.fatText}
            onChange={setField("fatText")}
            error={errors.fat}
            placeholder="e.g. 70"
          />
        </div>
      </section>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}
