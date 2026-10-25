// Gives the AI assistant access to real catalogue data WITHOUT sending all
// 1,500 products on every single message.
//
// WHY NOT JUST SEND EVERYTHING? With only 24 demo products this used to work
// fine. But 1,500 products is too much text to send to the AI every time
// someone sends a chat message — it would be slow, cost more (AI providers
// usually charge per word/token sent), and could even get cut off if it's
// too long for the model to accept. Instead we do two things:
//   1. CATALOGUE_OVERVIEW — a short, fixed summary (categories + counts +
//      price ranges) sent on every message, so the assistant always knows
//      roughly what FreshKWT sells.
//   2. getRelevantProducts(userText) — looks up just the handful of
//      products that seem relevant to what the shopper actually asked about
//      (see findRelevantProducts in catalogueHelpers.js), decides whether
//      they should be sorted by relevance or by real price (for "cheapest"
//      questions), and applies any stated KWD budget — all in plain code,
//      never left to the AI model to work out.
// This is the same basic idea behind "RAG" (Retrieval-Augmented Generation):
// instead of giving an AI your entire database, you fetch the small relevant
// slice of it for each question and hand that over instead.
import { PRODUCTS } from "../data/catalogue";
import { CATEGORIES } from "../data/categories";
import { findRelevantProducts, scoreRelevantProducts, hasPriceIntent, detectBudgetKwd } from "./catalogueHelpers";
import { formatKwd } from "./money";

function buildCategorySummaryLine(categorySlug, categoryName) {
  const productsInCategory = PRODUCTS.filter((p) => p.category === categorySlug);
  if (productsInCategory.length === 0) return `- ${categoryName}: no products`;
  const prices = productsInCategory.map((p) => p.priceKwd);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return `- ${categoryName}: ${productsInCategory.length} products, ${formatKwd(min)}–${formatKwd(max)}`;
}

function buildOverview() {
  const categoryLines = CATEGORIES.map((c) => buildCategorySummaryLine(c.slug, c.name)).join("\n");

  return `FRESHKWT DEMO CATALOGUE OVERVIEW (sample data, ${PRODUCTS.length} products total):
${categoryLines}

Important facts about this catalogue:
- This is SAMPLE / SYNTHETIC demo data for a learning project, not a real live inventory feed. Stock status and prices are indicative, not guaranteed current figures from a real store.
- NONE of these products currently have confirmed nutrition or ingredient/allergen data. Never say or imply a product is "safe" for an allergy, or state a specific calorie/macro figure for a product — always tell the customer that info isn't confirmed and to check the real packaging.
- For each customer question, you will also be shown a short list of specific matching products (if any were found) in a separate message below. Only mention product names, prices, pack sizes or stock status that appear in that list or in this overview — never invent a product that isn't shown to you.
- If no specific products are shown for a question that needs one, ask the customer to name the product, brand or category so you can look it up — don't guess.`;
}

// Computed once at module load — the catalogue is static demo data, so there's
// no need to rebuild this string on every message.
export const CATALOGUE_OVERVIEW = buildOverview();

function describeProduct(product) {
  const category = CATEGORIES.find((c) => c.slug === product.category)?.name ?? product.category;
  const stock = product.availability === "in_stock" ? "In stock (sample data)" : "Out of stock (sample data)";
  const subcat = product.subcategory ? ` > ${product.subcategory}` : "";
  const brandPart = product.brand ? ` (${product.brand})` : "";
  return `- ${product.name}${brandPart} | ${category}${subcat} | ${formatKwd(product.priceKwd)} per ${product.packSize} | ${stock}`;
}

// Works out which real catalogue products are relevant to one message, and
// HOW they should be ordered/filtered — all deterministic app logic, not AI
// guesswork. Shared by getRelevantProductsContext() (the text sent to the
// model) and useAssistantChat (which decides which products become visual
// cards), so the model's text and the cards shown are always grounded in the
// exact same real data.
export function getRelevantProducts(userText) {
  const budget = detectBudgetKwd(userText);
  const priceIntent = hasPriceIntent(userText);
  let budgetHadNoMatches = false;

  if (budget != null) {
    const scored = scoreRelevantProducts(userText);
    // Strict "<" to match findRelevantProducts' own strict budget filter —
    // "none under budget" means every match is AT OR ABOVE the budget line.
    budgetHadNoMatches = scored.length > 0 && scored.every((s) => s.product.priceKwd >= budget);
  }

  const matches = findRelevantProducts(userText || "", 15, {
    sortByPrice: priceIntent || budget != null,
    maxBudgetKwd: budget,
  });

  return { matches, budget, priceIntent, budgetHadNoMatches };
}

// Called fresh for each user message — returns a system message's worth of
// text describing just the products relevant to what they asked, or a plain
// note if nothing matched so the assistant doesn't silently assume there are
// no results for the wrong reason.
export function getRelevantProductsContext(userText) {
  const { matches, budget, priceIntent, budgetHadNoMatches } = getRelevantProducts(userText);

  if (matches.length === 0) {
    return "No specific products matched this message by keyword search. If the customer is asking about a specific product, ask them to clarify the name, brand or category.";
  }

  const lines = matches.map(describeProduct).join("\n");

  // The reminders below sit right next to the data on purpose: the model is
  // more likely to follow an instruction placed close to the data it applies
  // to, rather than one stated only once at the top of the whole prompt.
  let header = "These are candidate matches for reference only — do NOT list all of them to the customer. Pick the 3 best (up to 5 only if they ask for more options):";

  if (priceIntent || budget != null) {
    header = `These candidate matches are already sorted from CHEAPEST to most expensive by the app, using the real stored prices — the first one is the actual cheapest match, you don't need to compare prices yourself. ${header}`;
  }

  if (budget != null) {
    header += budgetHadNoMatches
      ? ` Note: none of the matching products are at or under the customer's stated budget of ${formatKwd(budget)} — tell them that plainly, then offer the closest (cheapest) alternatives shown below instead.`
      : ` All of the products below are at or under the customer's stated budget of ${formatKwd(budget)}.`;
  }

  return `${header}\n${lines}`;
}
