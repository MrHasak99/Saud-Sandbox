// The grocery categories shown in navigation and used to group products.
// `slug` must match the `category` field used on products in catalogue.js.
export const CATEGORIES = [
  { slug: "fruit-veg", name: "Fruits & Vegetables", emoji: "🥦" },
  { slug: "protein", name: "Meat, Fish & Plant Protein", emoji: "🍗" },
  { slug: "dairy", name: "Dairy & Alternatives", emoji: "🥛" },
  { slug: "grains", name: "Grains, Rice & Pasta", emoji: "🍚" },
  { slug: "pantry", name: "Pantry Essentials", emoji: "🥫" },
  { slug: "snacks", name: "Snacks & Beverages", emoji: "🍪" },
];

// Quick lookup helper: find a category object by its slug.
export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}
