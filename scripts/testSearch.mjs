// Plain Node.js test script for the catalogue search and AI retrieval
// helpers — no test framework needed for a project this size. Run it with:
//   node scripts/testSearch.mjs
//
// This exists specifically to catch the "shrimp search returns nothing"
// class of bug automatically in future, instead of only noticing it by
// clicking around the site by hand.
import assert from "node:assert/strict";
import { PRODUCTS } from "../src/data/catalogue.js";
import {
  searchProducts,
  filterByCategory,
  findRelevantProducts,
  scoreRelevantProducts,
  detectBudgetKwd,
  hasPriceIntent,
} from "../src/lib/catalogueHelpers.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

test("searching 'shrimp' returns results", () => {
  const results = searchProducts(PRODUCTS, "shrimp");
  assert.ok(results.length > 0, "expected at least one shrimp product");
});

test("searching 'prawns' (synonym, plural) returns shrimp results", () => {
  const results = searchProducts(PRODUCTS, "prawns");
  assert.ok(results.length > 0, "expected synonym match for prawns -> shrimp");
});

test("searching 'shrimps' (naive plural) returns results", () => {
  const results = searchProducts(PRODUCTS, "shrimps");
  assert.ok(results.length > 0, "expected plural match for shrimps -> shrimp");
});

test("brand search 'Americana' returns results", () => {
  const results = searchProducts(PRODUCTS, "Americana");
  assert.ok(results.length > 0);
});

test("category filter 'frozen-foods' only returns frozen items", () => {
  const results = filterByCategory(PRODUCTS, "frozen-foods");
  assert.ok(results.length > 0);
  assert.ok(results.every((p) => p.category === "frozen-foods"));
});

test("'frozen shrimp' matches frozen seafood shrimp products", () => {
  const results = searchProducts(PRODUCTS, "frozen shrimp");
  assert.ok(results.length > 0);
  assert.ok(results.every((p) => p.category === "frozen-foods"));
});

test("Arabic keyword 'حليب' (milk) matches milk products", () => {
  const results = searchProducts(PRODUCTS, "حليب");
  assert.ok(results.length > 0, "expected Arabic 'milk' keyword to match milk products");
});

test("nonsense query returns no results, doesn't crash", () => {
  const results = searchProducts(PRODUCTS, "zzqqxxnotarealproduct");
  assert.equal(results.length, 0);
});

test("hasPriceIntent detects 'cheapest' but not an unrelated sentence", () => {
  assert.equal(hasPriceIntent("what's the cheapest shrimp?"), true);
  assert.equal(hasPriceIntent("tell me about shrimp"), false);
});

test("detectBudgetKwd parses 'under 5 KWD', returns null when absent", () => {
  assert.equal(detectBudgetKwd("frozen prawns under 5 KWD"), 5);
  assert.equal(detectBudgetKwd("no budget mentioned here"), null);
});

test("findRelevantProducts sorted by price surfaces the TRUE cheapest match", () => {
  const scored = scoreRelevantProducts("shrimp");
  const expectedCheapest = scored.reduce(
    (min, s) => (s.product.priceKwd < min.priceKwd ? s.product : min),
    scored[0].product,
  );
  const sorted = findRelevantProducts("shrimp", 15, { sortByPrice: true });
  assert.equal(
    sorted[0].id,
    expectedCheapest.id,
    "first item after price sort should be the real cheapest match, not just the first keyword match",
  );
});

test("maxBudgetKwd keeps only products STRICTLY under that price", () => {
  const results = findRelevantProducts("frozen shrimp", 15, { sortByPrice: true, maxBudgetKwd: 2 });
  assert.ok(results.length > 0, "expected at least one frozen shrimp product under 2 KWD");
  assert.ok(results.every((p) => p.priceKwd < 2), "every result must be strictly under the budget, not equal to it");
});

// --- Regression tests for the "cheapest frozen shrimp" bug -----------------
// Root cause: scoreRelevantProducts used to count ANY shared word as a match
// (OR semantics), so a product only had to share the single word "frozen"
// with the question to be treated as a "frozen shrimp" candidate — letting
// frozen ice cream and frozen minced beef outrank real shrimp once sorted by
// price. These tests lock in the fix (AND semantics: every meaningful word
// must match) using the real catalogue, without hard-coding specific products.

test("'cheapest frozen shrimp under 5 KWD' never includes ice cream or beef", () => {
  const results = findRelevantProducts("What's the cheapest frozen shrimp under 5 KWD?", 15, {
    sortByPrice: true,
    maxBudgetKwd: 5,
  });
  assert.ok(results.length > 0, "expected at least one genuine frozen shrimp match under 5 KWD");
  for (const p of results) {
    const text = `${p.name} ${p.keywords || ""}`.toLowerCase();
    assert.ok(/shrimp|prawn/.test(text), `"${p.name}" is not a shrimp/prawn product and must not appear`);
    assert.ok(!/ice cream|minced beef/.test(text), `"${p.name}" is an unrelated product and must not appear`);
  }
});

test("'cheapest frozen shrimp under 5 KWD' picks the true cheapest qualifying product", () => {
  const terms = ["frozen", "shrimp"];
  const expectedCheapest = PRODUCTS.filter((p) => {
    const text = `${p.name} ${p.nameAr || ""} ${p.brand || ""} ${p.category} ${p.subcategory || ""} ${p.keywords || ""}`.toLowerCase();
    return terms.every((t) => text.includes(t)) && p.priceKwd < 5;
  }).reduce((min, p) => (p.priceKwd < min.priceKwd ? p : min));

  const results = findRelevantProducts("What's the cheapest frozen shrimp under 5 KWD?", 15, {
    sortByPrice: true,
    maxBudgetKwd: 5,
  });
  assert.equal(results[0].id, expectedCheapest.id, "first result should be the real cheapest qualifying frozen shrimp product");
});

test("'cheapest prawns under 5 KWD' (no 'frozen') matches shrimp/prawn products only", () => {
  const results = findRelevantProducts("cheapest prawns under 5 KWD", 15, { sortByPrice: true, maxBudgetKwd: 5 });
  assert.ok(results.length > 0);
  for (const p of results) {
    const text = `${p.name} ${p.keywords || ""}`.toLowerCase();
    assert.ok(/shrimp|prawn/.test(text), `"${p.name}" should not match a prawn/shrimp search`);
  }
});

test("a budget with no qualifying products falls back to real relevant matches, not junk", () => {
  // An unreasonably low budget that no shrimp product can meet.
  const results = findRelevantProducts("cheapest frozen shrimp under 0.01 KWD", 15, {
    sortByPrice: true,
    maxBudgetKwd: 0.01,
  });
  // Fallback keeps the full relevant (AND-matched) set — every result must
  // still genuinely be a shrimp/prawn product, never an unrelated fallback.
  for (const p of results) {
    const text = `${p.name} ${p.keywords || ""}`.toLowerCase();
    assert.ok(/shrimp|prawn/.test(text), `"${p.name}" is not shrimp/prawn and should not appear even as a fallback`);
  }
});

test("a query with no real catalogue match returns nothing (no irrelevant filler)", () => {
  const results = findRelevantProducts("cheapest unicorn tears under 5 KWD", 15, { sortByPrice: true, maxBudgetKwd: 5 });
  assert.equal(results.length, 0, "a nonsense product request should return no results, not unrelated products");
});


test("findRelevantProducts never returns duplicate product ids", () => {
  const results = findRelevantProducts("milk", 15);
  const ids = results.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("empty query returns no relevant matches", () => {
  const results = findRelevantProducts("", 15);
  assert.equal(results.length, 0);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
