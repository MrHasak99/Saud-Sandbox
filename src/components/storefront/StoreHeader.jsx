import { Leaf, ShoppingBasket, UserCircle } from "lucide-react";

export default function StoreHeader({ onOpenProfile, hasProfile, onOpenBasket, basketItemCount = 0 }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
        <div className="rounded-xl bg-emerald-600 p-2">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">FreshKWT</h1>
          <p className="text-xs text-slate-500">Premium groceries, delivered smart</p>
        </div>

        <button
          type="button"
          onClick={onOpenProfile}
          title="Your dietary profile"
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
        >
          <UserCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{hasProfile ? "My Profile" : "Set up profile"}</span>
        </button>

        <button
          type="button"
          onClick={onOpenBasket}
          title="Your basket"
          className="relative flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
        >
          <ShoppingBasket className="h-4 w-4" />
          <span className="hidden sm:inline">Basket</span>
          {basketItemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
              {basketItemCount > 99 ? "99+" : basketItemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
