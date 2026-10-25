import { CATEGORIES } from "../../data/categories";

export default function CategoryNav({ selectedCategory, onSelectCategory }) {
  const pillClass = (isActive) =>
    `flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "border-emerald-600 bg-emerald-600 text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
    }`;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onSelectCategory("all")}
        className={pillClass(selectedCategory === "all")}
      >
        🛒 All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          type="button"
          onClick={() => onSelectCategory(cat.slug)}
          className={pillClass(selectedCategory === cat.slug)}
        >
          <span>{cat.emoji}</span>
          {cat.name}
        </button>
      ))}
    </div>
  );
}
