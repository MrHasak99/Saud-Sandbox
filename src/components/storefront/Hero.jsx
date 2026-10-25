import { Sparkles, UserCircle } from "lucide-react";

export default function Hero({ onOpenProfile, hasProfile }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-10 text-white sm:px-10 sm:py-14">
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
        <Sparkles className="h-3.5 w-3.5" />
        Demo catalogue for Kuwait
      </span>
      <h1 className="max-w-xl text-2xl font-bold leading-tight sm:text-4xl">
        Groceries chosen around your goals, not the other way around.
      </h1>
      <p className="mt-3 max-w-lg text-sm text-emerald-50 sm:text-base">
        Browse fresh produce, proteins, pantry staples and more — all priced in
        Kuwaiti Dinar. Set your dietary goals, allergies and budget to tailor
        your experience.
      </p>
      <button
        type="button"
        onClick={onOpenProfile}
        className="mt-5 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
      >
        <UserCircle className="h-4 w-4" />
        {hasProfile ? "Edit your profile" : "Set up your profile"}
      </button>
    </div>
  );
}
