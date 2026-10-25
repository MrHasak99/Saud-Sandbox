// The grocery categories shown in navigation and used to group products.
// `slug` must match the `category` field used on products in catalogue.js.
// These 10 categories come directly from the imported kuwait_products.xlsx
// catalogue — see scripts/convertCatalogue.mjs for how the slug is derived
// from the original spreadsheet's category names.
export const CATEGORIES = [
  { slug: "fresh-produce", name: "Fresh Produce", emoji: "🥦" },
  { slug: "meat-seafood", name: "Meat & Seafood", emoji: "🍗" },
  { slug: "dairy", name: "Dairy", emoji: "🥛" },
  { slug: "bakery", name: "Bakery", emoji: "🍞" },
  { slug: "frozen-foods", name: "Frozen Foods", emoji: "🧊" },
  { slug: "canned-packaged-food", name: "Canned & Packaged Food", emoji: "🥫" },
  { slug: "beverages", name: "Beverages", emoji: "🥤" },
  { slug: "snacks", name: "Snacks", emoji: "🍪" },
  { slug: "cleaning-household", name: "Cleaning & Household", emoji: "🧽" },
  { slug: "personal-care", name: "Personal Care", emoji: "🧴" },
];

// Quick lookup helper: find a category object by its slug.
export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}
