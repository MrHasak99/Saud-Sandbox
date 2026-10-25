import { Check } from "lucide-react";

// A row of toggle-able pill buttons, reusing the same visual style as the
// storefront's CategoryNav. Works for both single-pick and multi-pick lists —
// the parent decides what "toggling" an id actually means.
export default function MultiSelectPills({ options, selectedIds, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            aria-pressed={isSelected}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
              isSelected
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            {isSelected && <Check className="h-3.5 w-3.5" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
