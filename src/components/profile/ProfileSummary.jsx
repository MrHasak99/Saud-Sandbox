import { useState } from "react";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { GOAL_OPTIONS, DIETARY_PREFERENCE_OPTIONS, ALLERGY_OPTIONS, BUDGET_PERIODS } from "../../data/profileOptions";
import { formatKwd } from "../../lib/money";

function labelsFor(options, ids) {
  return options.filter((o) => ids.includes(o.id)).map((o) => o.label);
}

function Row({ label, children }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm text-slate-800">{children}</div>
    </div>
  );
}

function ListOrFallback({ items, fallback }) {
  if (items.length === 0) return <span className="text-slate-400">{fallback}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ProfileSummary({ profile, justSaved, onEdit, onClear }) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  const goalLabels = labelsFor(GOAL_OPTIONS, profile.goals);
  const preferenceLabels = labelsFor(DIETARY_PREFERENCE_OPTIONS, profile.dietaryPreferences);
  const allergyLabels = labelsFor(ALLERGY_OPTIONS, profile.allergies).map((label) =>
    label === "Other allergies" && profile.otherAllergyText ? `Other: ${profile.otherAllergyText}` : label,
  );
  const periodLabel = BUDGET_PERIODS.find((p) => p.id === profile.budget.period)?.label ?? "Weekly";

  const nutritionParts = [];
  if (profile.nutritionTargets.calories !== null) nutritionParts.push(`${profile.nutritionTargets.calories} kcal`);
  if (profile.nutritionTargets.protein !== null) nutritionParts.push(`${profile.nutritionTargets.protein} g protein`);
  if (profile.nutritionTargets.carbs !== null) nutritionParts.push(`${profile.nutritionTargets.carbs} g carbs`);
  if (profile.nutritionTargets.fat !== null) nutritionParts.push(`${profile.nutritionTargets.fat} g fat`);

  return (
    <div>
      {justSaved && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Profile saved! Only you can see this, stored on this device.
        </div>
      )}

      <Row label="Food goals">
        <ListOrFallback items={goalLabels} fallback="No goals set" />
      </Row>
      <Row label="Dietary preferences">
        <ListOrFallback items={preferenceLabels} fallback="No preference set" />
      </Row>
      <Row label="Allergies">
        <ListOrFallback items={allergyLabels} fallback="No allergies set" />
      </Row>
      <Row label="Foods to avoid">
        {profile.avoidIngredients ? (
          <span>{profile.avoidIngredients}</span>
        ) : (
          <span className="text-slate-400">None noted</span>
        )}
      </Row>
      <Row label="Grocery budget">
        {profile.budget.amount !== null ? (
          <span>
            {formatKwd(profile.budget.amount)} / {periodLabel.toLowerCase()}
          </span>
        ) : (
          <span className="text-slate-400">Not set</span>
        )}
      </Row>
      <Row label="Daily nutrition targets">
        {nutritionParts.length > 0 ? (
          <span>{nutritionParts.join(" · ")}</span>
        ) : (
          <span className="text-slate-400">Not set</span>
        )}
      </Row>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit profile
        </button>

        {!confirmingClear ? (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear profile
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Are you sure?</span>
            <button
              type="button"
              onClick={() => {
                onClear();
                setConfirmingClear(false);
              }}
              className="rounded-full bg-red-500 px-3 py-1.5 font-medium text-white hover:bg-red-600"
            >
              Yes, clear
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
