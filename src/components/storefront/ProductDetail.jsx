import { useState } from "react";
import { ArrowLeft, AlertTriangle, ShieldCheck, Check, Plus } from "lucide-react";
import ProductImage from "./ProductImage";
import { formatKwd } from "../../lib/money";
import { getCategoryBySlug } from "../../data/categories";

// Shows every known detail for one product, and is honest about what's missing.
export default function ProductDetail({ product, onBack, onAddToBasket }) {
  const category = getCategoryBySlug(product.category);
  const outOfStock = product.availability === "out_of_stock";
  const nutrition = product.nutritionPer100g;
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAddToBasket(product.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const nutritionRows = [
    { label: "Calories", value: nutrition?.calories, unit: "kcal" },
    { label: "Protein", value: nutrition?.proteinG, unit: "g" },
    { label: "Carbohydrates", value: nutrition?.carbsG, unit: "g" },
    { label: "Fat", value: nutrition?.fatG, unit: "g" },
    { label: "Fibre", value: nutrition?.fiberG, unit: "g" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </button>

      <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <ProductImage emoji={product.emoji} className="h-48 w-full text-7xl" />

        <div>
          {category && <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{category.name}</p>}
          {product.brand && <p className="text-sm text-slate-500">{product.brand}</p>}
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{product.name}</h2>
          <p className="mt-2 text-sm text-slate-600">{product.description}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-slate-900">{formatKwd(product.priceKwd)}</span>
            <span className="text-sm text-slate-400">· {product.packSize}</span>
          </div>

          <p className={`mt-2 text-sm font-medium ${outOfStock ? "text-red-500" : "text-emerald-600"}`}>
            {outOfStock ? "Currently out of stock" : "In stock"}
          </p>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className={`mt-4 flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              justAdded
                ? "bg-emerald-100 text-emerald-700"
                : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" /> Added to basket
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add to Basket
              </>
            )}
          </button>

          {product.dietaryTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Allergen info */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          {product.allergensKnown ? (
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          )}
          Allergen information
        </h3>
        {product.allergensKnown ? (
          product.allergens.length > 0 ? (
            <p className="text-sm text-slate-600">
              Contains: <span className="font-medium text-slate-900">{product.allergens.join(", ")}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-600">No known allergens for this product.</p>
          )
        ) : (
          <p className="text-sm text-amber-700">
            Allergen details are not confirmed for this product. Please check the packaging or
            contact the manufacturer before eating it if you have an allergy.
          </p>
        )}
      </div>

      {/* Nutrition table */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Nutrition (per 100 g)</h3>
        {nutrition ? (
          <table className="w-full text-sm">
            <tbody>
              {nutritionRows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-500">{row.label}</td>
                  <td className="py-2 text-right font-medium text-slate-900">
                    {row.value === null || row.value === undefined ? "Not specified" : `${row.value} ${row.unit}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">Nutrition information is not available for this product.</p>
        )}
      </div>
    </div>
  );
}
