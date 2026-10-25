// Builds a compact, text-only snapshot of the demo catalogue to hand to the
// AI assistant as a system message. This is the ONLY way the assistant ever
// "sees" product data — it's generated straight from the same PRODUCTS array
// the storefront itself uses, so it can never drift out of sync or let the
// model invent products that don't exist.
import { PRODUCTS } from "../data/catalogue";
import { getCategoryBySlug } from "../data/categories";
import { formatKwd } from "./money";

function describeProduct(product) {
  const category = getCategoryBySlug(product.category)?.name ?? product.category;
  const stock = product.availability === "in_stock" ? "In stock" : "Out of stock";

  const allergens = product.allergensKnown
    ? product.allergens.length > 0
      ? `Contains: ${product.allergens.join(", ")}`
      : "No known allergens"
    : "Allergen info not confirmed";

  const tags = product.dietaryTags.length > 0 ? product.dietaryTags.join(", ") : "none listed";
  const brandPart = product.brand ? ` (${product.brand})` : "";

  return `- ${product.name}${brandPart} | ${category} | ${formatKwd(product.priceKwd)} per ${product.packSize} | ${stock} | ${allergens} | Dietary tags: ${tags}`;
}

function buildCatalogueContext() {
  const lines = PRODUCTS.map(describeProduct).join("\n");

  return `FRESHKWT DEMO CATALOGUE — this is the ONLY product data you have access to:
${lines}

How to use this catalogue:
- Only mention products, prices, pack sizes, stock status, allergens or dietary tags exactly as listed above.
- If a customer asks for something not listed above, say plainly that FreshKWT doesn't carry it in this demo, and suggest the closest real match from the list if one fits.
- "Allergen info not confirmed" means you must NOT say or imply that product is safe for that allergy — tell the customer to check the packaging themselves.
- Never invent a price, stock status, ingredient or nutrition figure that isn't shown above.`;
}

// Computed once at module load — the catalogue is static demo data, so there's
// no need to rebuild this string on every message.
export const CATALOGUE_CONTEXT = buildCatalogueContext();
