import { PackageSearch } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, onSelectProduct, onAddToBasket }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
        <PackageSearch className="mb-3 h-10 w-10" />
        <p className="font-medium">No products match your search</p>
        <p className="text-sm">Try a different keyword or category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onSelect={onSelectProduct} onAddToBasket={onAddToBasket} />
      ))}
    </div>
  );
}
