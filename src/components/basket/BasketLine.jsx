import { Minus, Plus, Trash2 } from "lucide-react";
import ProductImage from "../storefront/ProductImage";
import { formatKwd } from "../../lib/money";

// One row inside the basket drawer: image, name, quantity controls and line total.
export default function BasketLine({ product, quantity, lineTotal, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
      <ProductImage emoji={product.emoji} className="h-14 w-14 shrink-0 text-2xl" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
        <p className="text-xs text-slate-500">
          {formatKwd(product.priceKwd)} · {product.packSize}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrease}
            disabled={quantity <= 1}
            aria-label={`Decrease quantity of ${product.name}`}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-5 text-center text-sm font-medium text-slate-900">{quantity}</span>
          <button
            type="button"
            onClick={onIncrease}
            aria-label={`Increase quantity of ${product.name}`}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-emerald-300"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="text-sm font-semibold text-slate-900">{formatKwd(lineTotal)}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${product.name} from basket`}
          className="text-slate-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
