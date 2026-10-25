// Plain JavaScript helpers for browsing the demo catalogue.
// No AI and no network calls here — just simple, predictable filtering/sorting
// so the storefront behaves the same way every time.
import { PRODUCTS } from "../data/catalogue.js";

// PERFORMANCE NOTE (catalogue now has 1,500 products instead of 24):
// Calling `.toLowerCase()` on several fields for every product, on every
// single keystroke, would mean doing that string work thousands of times a
// second while someone types. Instead we build ONE lowercase "search blob"
// per product a single time when this file first loads, and reuse it for
// every search afterwards. This keeps typing in the search box instant even
// with a much bigger catalogue, without needing any extra search library.
const SEARCH_INDEX = new Map(
  PRODUCTS.map((p) => [
    p.id,
    [p.name, p.nameAr, p.brand, p.category, p.subcategory, p.keywords].filter(Boolean).join(" ").toLowerCase(),
  ]),
);

// SYNONYMS: the imported spreadsheet only ever uses ONE English word per
// concept (e.g. always "Shrimp", never "Prawn"). Without this, a shopper
// typing a perfectly reasonable alternative word gets zero results even
// though the product genuinely exists — that's the exact "shrimp search"
// bug this fixes. Each inner array is a group of words that should all be
// treated as the same thing. This list isn't exhaustive — it only covers
// common grocery words we know are likely to come up; add more groups here
// as new gaps are found.
const SYNONYM_GROUPS = [
  ["shrimp", "shrimps", "prawn", "prawns"],
  ["soda", "sodas", "pop", "soft drink", "soft drinks"],
  ["eggplant", "eggplants", "aubergine", "aubergines"],
  ["cilantro", "coriander"],
  ["zucchini", "zucchinis", "courgette", "courgettes"],
  ["garbanzo", "garbanzos", "chickpea", "chickpeas"],
  ["scallion", "scallions", "spring onion", "spring onions", "green onion", "green onions"],
  ["arugula", "rocket"],
  ["capsicum", "capsicums", "bell pepper", "bell peppers"],
];

// Flips the groups above into a quick lookup: one word -> its whole group.
const SYNONYM_MAP = new Map();
for (const group of SYNONYM_GROUPS) {
  for (const term of group) {
    SYNONYM_MAP.set(term, group);
  }
}

// For one search word, returns every spelling we should also try: the word
// itself, a naive singular/plural guess (just add/remove a trailing "s" —
// not real grammar, but enough to catch "shrimps" vs "shrimp"), and any
// known synonyms. This is intentionally simple keyword matching, not a real
// spell-checker or language model.
function expandTerm(term) {
  const variants = new Set([term]);
  if (term.length > 3 && term.endsWith("s")) variants.add(term.slice(0, -1));
  if (!term.endsWith("s")) variants.add(`${term}s`);
  const group = SYNONYM_MAP.get(term);
  if (group) group.forEach((t) => variants.add(t));
  return [...variants];
}

function termMatches(text, term) {
  return expandTerm(term).some((variant) => text.includes(variant));
}

function matchesAllTerms(text, terms) {
  return terms.every((term) => termMatches(text, term));
}

// Returns products whose combined name/brand/category/subcategory/keywords
// match every word the shopper typed (case-insensitive, any order, with
// synonym + naive plural expansion per word — see expandTerm above).
export function searchProducts(products, query) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  const terms = q.split(/\s+/).filter(Boolean);
  return products.filter((p) => matchesAllTerms(SEARCH_INDEX.get(p.id) || "", terms));
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

// Recognises phrases like "cheapest", "best value", "least expensive" so the
// AI assistant knows to ask for products sorted by real price instead of
// relevance — see findRelevantProducts' sortByPrice option below.
const PRICE_INTENT_REGEX = /\b(cheap(?:est)?|lowest price|least expensive|best value|most affordable|lowest cost)\b/i;
export function hasPriceIntent(text) {
  return PRICE_INTENT_REGEX.test(text || "");
}

// Pulls a KWD budget number out of phrases like "under 5 KWD", "below 3 KD",
// "less than 2 dinars". Returns null if no budget phrase is found. This lets
// the app filter candidates by real stored prices in code — never by asking
// the AI model to do the maths itself.
//
// "Under/below/less than X" is treated as a STRICT ceiling (price must be
// < X, not <= X) — that matches how a shopper actually means "under 5 KWD."
const BUDGET_REGEX = /\b(?:under|below|less than|up to|within)\s*(\d+(?:\.\d+)?)\s*(?:kwd|kd|dinars?|fils)?\b/i;
export function detectBudgetKwd(text) {
  if (!text) return null;
  const match = text.match(BUDGET_REGEX);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
}

// ROOT CAUSE OF THE "cheapest frozen shrimp" BUG (now fixed):
// scoreRelevantProducts used to count how many of the shopper's words
// matched ANY product (OR semantics) and treat that as "good enough" to be
// a candidate. That meant a product only had to share ONE generic word
// (like "frozen") with the question to be considered a "frozen shrimp"
// candidate — so frozen ice cream and frozen minced beef could sneak into
// shrimp results just because they're also frozen. Then, because "cheapest"
// questions sort candidates by real price, those cheap-but-irrelevant
// products floated straight to the top of the list.
//
// THE FIX: require EVERY meaningful word the shopper used to match (AND
// semantics, like searchProducts above) before a product counts as a
// candidate at all. "frozen shrimp" now requires a product's text to contain
// BOTH "frozen" and "shrimp" (or a synonym/plural of each) — so plain beef or
// ice cream can never qualify just by sharing the word "frozen."
//
// Natural-language chat stopwords: ordinary question/filler words (and
// price/budget wording, which is already handled separately by
// hasPriceIntent/detectBudgetKwd above) are ignored here, since they
// describe HOW the shopper is asking, not WHAT product they want. Without
// this, requiring every single word to match would wrongly require "kwd" or
// "cheapest" to literally appear in a product's name.
const CHAT_STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "i", "im", "you", "your", "we", "our", "me", "my", "it", "its",
  "what", "whats", "which", "who", "how", "why", "when", "where",
  "do", "does", "did", "can", "could", "would", "should", "will", "shall",
  "to", "of", "for", "with", "without", "in", "on", "at", "by", "from",
  "and", "or", "but", "please", "show", "find", "get", "buy", "want",
  "need", "looking", "look", "have", "has", "some", "any", "something",
  "anything", "option", "options", "product", "products", "item", "items",
  "good", "nice", "best", "there", "ok", "okay", "thanks", "thank",
  // price/budget wording — handled as its own constraint elsewhere, so it
  // shouldn't also have to literally appear in a product's name/keywords.
  "cheap", "cheapest", "lowest", "least", "expensive", "affordable",
  "afford", "cost", "costs", "value", "under", "below", "less", "than",
  "up", "within", "kwd", "kd", "dinar", "dinars", "fils", "price", "prices",
]);

// Breaks a chat message into just the words that describe WHAT the shopper
// wants — e.g. "What's the cheapest frozen shrimp under 5 KWD?" becomes just
// ["frozen", "shrimp"]. Strips punctuation (so "KWD?" doesn't dodge the
// stopword list), stopwords, and bare numbers.
function extractSearchTerms(query) {
  const cleaned = (query || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
  return cleaned
    .split(/\s+/)
    .filter((t) => t.length > 1 && !CHAT_STOPWORDS.has(t) && !/^\d+$/.test(t));
}

// Used by the AI assistant (see lib/catalogueContext.js) to pull out a
// small, relevant slice of the 1,500-product catalogue for one question,
// instead of sending all 1,500 products to the AI every single message
// (which would be slow, expensive, and could exceed the model's limits).
//
// A product only becomes a candidate if it matches EVERY meaningful word the
// shopper used (see extractSearchTerms + matchesAllTerms above) — this is
// what keeps "frozen shrimp" from matching plain frozen beef or ice cream.
// This is still simple, predictable keyword matching (no embeddings, no
// extra API calls) — just AND instead of OR.
//
// Returns EVERY genuine match, unsorted-by-limit, so callers that need to
// see the full relevant set (like price comparisons) can do so before
// deciding how many to keep.
export function scoreRelevantProducts(query) {
  const terms = extractSearchTerms(query);
  if (terms.length === 0) return [];

  const scored = [];
  for (const product of PRODUCTS) {
    const text = SEARCH_INDEX.get(product.id) || "";
    if (!matchesAllTerms(text, terms)) continue;
    scored.push({ product, score: terms.length });
  }
  return scored;
}

// Thin, limit-aware wrapper around scoreRelevantProducts for everyday use.
// Options:
//   sortByPrice   — sort the relevant set by real stored price (ascending)
//                   instead of by keyword relevance. Use this whenever the
//                   shopper is asking for the cheapest/best-value option, so
//                   the actual lowest price is guaranteed to be first instead
//                   of relying on whichever 15 happened to be matched. This
//                   sorts the FULL genuinely-matching set before slicing, so
//                   "cheapest" always reflects every real candidate, not an
//                   arbitrary top-15 cut taken before sorting.
//   maxBudgetKwd  — only keep products STRICTLY under this KWD price (see
//                   the "under 5 KWD" note on detectBudgetKwd above). If NO
//                   relevant product is under budget, we deliberately keep
//                   the full relevant set instead of returning nothing, so
//                   the caller can still show the closest (cheaper)
//                   alternatives honestly rather than a dead end — it will
//                   never contain unrelated products, since they were
//                   already excluded by the AND-matching above.
export function findRelevantProducts(query, limit = 15, options = {}) {
  const { sortByPrice = false, maxBudgetKwd = null } = options;
  let scored = scoreRelevantProducts(query);

  if (maxBudgetKwd != null) {
    const underBudget = scored.filter((s) => s.product.priceKwd < maxBudgetKwd);
    if (underBudget.length > 0) scored = underBudget;
  }

  const sorted = [...scored].sort((a, b) =>
    sortByPrice ? a.product.priceKwd - b.product.priceKwd : b.score - a.score,
  );

  return sorted.slice(0, limit).map((s) => s.product);
}
