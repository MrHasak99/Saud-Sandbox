import { UserCircle } from "lucide-react";

// Shown the first time a customer opens their profile, before anything is saved.
export default function ProfileEmptyState({ onStart }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="rounded-full bg-emerald-50 p-4">
        <UserCircle className="h-8 w-8 text-emerald-600" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">No profile yet</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        Tell us about your goals, allergies and budget so we can tailor FreshKWT to you.
        It only takes a minute, and every question is optional.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Create my profile
      </button>
    </div>
  );
}
