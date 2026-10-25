import { ChevronDown } from "lucide-react";
import { MODELS } from "../services/models";

export default function ModelSwitcher({ selectedModel, onModelChange, disabled }) {
  return (
    <div>
      <label htmlFor="model" className="mb-1 block text-sm font-medium text-slate-300">
        Model
      </label>
      <div className="relative">
        <select
          id="model"
          value={selectedModel}
          disabled={disabled}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 pr-10 text-white focus:border-indigo-400 focus:outline-none disabled:opacity-50"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
      </div>
      <p className="mt-1 text-xs text-slate-500">{selectedModel}</p>
    </div>
  );
}
