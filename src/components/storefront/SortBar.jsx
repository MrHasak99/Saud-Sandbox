export default function SortBar({ sortBy, onSortChange, resultCount }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">{resultCount} product{resultCount === 1 ? "" : "s"}</p>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none"
      >
        <option value="default">Sort: Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A to Z</option>
      </select>
    </div>
  );
}
