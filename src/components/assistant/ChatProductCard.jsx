import { useState } from "react";
import { Check, Plus } from "lucide-react";
import ProductImage from "../storefront/ProductImage";
import { formatKwd } from "../../lib/money";

// A compact product card shown INSIDE an assistant chat message. The AI
// model never generates this UI itself — useAssistantChat picks real
// catalogue product objects (see lib/catalogueContext.js) and this component
// just renders them, the same way ProductCard.jsx does for the main
// storefront grid. That's what keeps names/prices/stock trustworthy: they
// come straight from data/catalogue.js, never from the model's text.
export default function ChatProductCard({ product, onAddToBasket }) {
  const outOfStock = product.availability === "out_of_stock";
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    if (outOfStock) return;
    onAddToBasket(product.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
      <ProductImage emoji={product.emoji} className="h-12 w-12 shrink-0 text-2xl" />

      <div className="min-w-0 flex-1">
        {product.brand && <p className="truncate text-[11px] font-medium text-emerald-700">{product.brand}</p>}
        <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
        <p className="text-xs text-slate-500">
          {product.packSize} · {formatKwd(product.priceKwd)}
          {outOfStock && <span className="ml-1.5 font-medium text-red-500">Out of stock</span>}
        </p>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        aria-label={justAdded ? `${product.name} added to basket` : `Add ${product.name} to basket`}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
          justAdded
            ? "bg-emerald-100 text-emerald-700"
            : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        }`}
      >
        {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
    </div>
  );
}
