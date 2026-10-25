// A labelled numeric text input used for budget and nutrition target fields.
// It stores raw text (not a number) so the user can type freely — parsing
// and validation happen on save, in ProfileForm.
export default function NumberField({ label, unit, value, onChange, error, placeholder }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative mt-1">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white py-2 pl-3 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 focus:ring-red-100"
              : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100"
          }`}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {unit}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}
