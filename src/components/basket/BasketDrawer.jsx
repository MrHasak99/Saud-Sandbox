import { useEffect } from "react";
import { X, ShoppingBasket } from "lucide-react";
import BasketLine from "./BasketLine";
import { PRODUCTS } from "../../data/catalogue";
import { getBasketLines, getBasketSubtotal } from "../../lib/basketHelpers";
import { formatKwd } from "../../lib/money";

// A right-side slide-over drawer (distinct from the centered profile modal,
// matching the common "basket" pattern) that never navigates away from the
// storefront. Prices and names always come from the live catalogue — the
// basket itself only ever stores productId + quantity.
export default function BasketDrawer({ open, onClose, items, onIncrease, onDecrease, onRemove }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const lines = getBasketLines(items, PRODUCTS);
  const subtotal = getBasketSubtotal(lines);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Shopping basket"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <ShoppingBasket className="h-5 w-5 text-emerald-600" />
          <p className="flex-1 text-sm font-semibold text-slate-900">Your basket</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close basket"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <ShoppingBasket className="mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium">Your basket is empty</p>
              <p className="text-sm">Browse products and tap "Add to Basket" to get started.</p>
            </div>
          ) : (
            lines.map((line) => (
              <BasketLine
                key={line.product.id}
                product={line.product}
                quantity={line.quantity}
                lineTotal={line.lineTotal}
                onIncrease={() => onIncrease(line.product.id)}
                onDecrease={() => onDecrease(line.product.id)}
                onRemove={() => onRemove(line.product.id)}
              />
            ))
          )}
        </div>

        {/* Subtotal */}
        {lines.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Subtotal</span>
              <span className="text-lg font-bold text-slate-900">{formatKwd(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Checkout isn't available in this demo yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
