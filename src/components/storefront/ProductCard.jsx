import { useState } from "react";
import { AlertTriangle, Check, Plus } from "lucide-react";
import ProductImage from "./ProductImage";
import { formatKwd } from "../../lib/money";

export default function ProductCard({ product, onSelect, onAddToBasket }) {
  const outOfStock = product.availability === "out_of_stock";
  // Brief local "Added!" feedback — separate from the real basket state, so
  // it resets on its own a moment later without needing a global toast system.
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e) => {
    // The whole card is clickable (opens product details), so this stops
    // that click from also firing when someone just wants to add to basket.
    e.stopPropagation();
    onAddToBasket(product.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    // This used to be a <button> wrapping everything, which made the inner
    // "Add to Basket" button invalid HTML (buttons can't nest). It's now a
    // div acting as a keyboard-accessible clickable card instead, with the
    // basket button as its own separate, independent control.
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(product.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(product.id);
        }
      }}
      className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      <div className="relative">
        <ProductImage emoji={product.emoji} className="h-32 w-full" />
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
        {!product.allergensKnown && (
          <span
            title="Allergen info not confirmed — check packaging"
            className="absolute right-2 top-2 rounded-full bg-amber-100 p-1 text-amber-700"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="mt-3 flex-1">
        {product.brand && <p className="text-xs font-medium text-emerald-700">{product.brand}</p>}
        <h3 className="text-sm font-semibold text-slate-900">{product.name}</h3>
        <p className="text-xs text-slate-500">{product.packSize}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-base font-bold text-slate-900">{formatKwd(product.priceKwd)}</span>
        {outOfStock && <span className="text-xs text-slate-400">Unavailable</span>}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className={`mt-3 flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
          justAdded
            ? "bg-emerald-100 text-emerald-700"
            : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        }`}
      >
        {justAdded ? (
          <>
            <Check className="h-3.5 w-3.5" /> Added
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" /> Add to Basket
          </>
        )}
      </button>
    </div>
  );
}
