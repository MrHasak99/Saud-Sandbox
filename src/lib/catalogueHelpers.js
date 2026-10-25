// Plain JavaScript helpers for browsing the demo catalogue.
// No AI and no network calls here — just simple, predictable filtering/sorting
// so the storefront behaves the same way every time.

// Returns products whose name or brand matches the search text (case-insensitive).
export function searchProducts(products, query) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => {
    const name = p.name.toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    return name.includes(q) || brand.includes(q);
  });
}

// Returns only products in the given category slug. Pass null/"all" for every product.
export function filterByCategory(products, categorySlug) {
  if (!categorySlug || categorySlug === "all") return products;
  return products.filter((p) => p.category === categorySlug);
}

// Sorts a copy of the product list. Does not mutate the original array.
export function sortProducts(products, sortBy) {
  const copy = [...products];
  switch (sortBy) {
    case "price-asc":
      return copy.sort((a, b) => a.priceKwd - b.priceKwd);
    case "price-desc":
      return copy.sort((a, b) => b.priceKwd - a.priceKwd);
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy;
  }
}

// Finds one product by its id, or null if not found.
export function getProductById(products, id) {
  return products.find((p) => p.id === id) || null;
}
