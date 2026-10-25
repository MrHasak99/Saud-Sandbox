// One-time / re-runnable import script: reads kuwait_products.xlsx and writes
// src/data/catalogue.js in the shape the React app expects.
//
// Run it with:  npm run import:catalogue
//
// WHY A SEPARATE SCRIPT INSTEAD OF READING THE EXCEL FILE IN THE BROWSER?
// The `xlsx` parsing library is only needed once, at import time, on your
// computer. If we imported it into the React app instead, every customer's
// browser would have to download that whole library just to show a product
// list — wasteful, and unnecessary since the data doesn't change per visit.
// Instead, this script runs with Node.js and writes out a plain JavaScript
// file (src/data/catalogue.js) that the app already knows how to use.
import XLSX from "xlsx";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { roundKwd } from "../src/lib/money.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_FILE = path.resolve(__dirname, "../kuwait_products.xlsx");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/catalogue.js");

// Maps the raw "category" text from the spreadsheet to a short, URL/CSS-safe
// slug. The slug is what the rest of the app (filters, data/categories.js)
// uses to refer to a category.
const CATEGORY_SLUGS = {
  Dairy: "dairy",
  Beverages: "beverages",
  Snacks: "snacks",
  Bakery: "bakery",
  "Frozen Foods": "frozen-foods",
  "Canned & Packaged Food": "canned-packaged-food",
  "Cleaning & Household": "cleaning-household",
  "Personal Care": "personal-care",
  "Fresh Produce": "fresh-produce",
  "Meat & Seafood": "meat-seafood",
};

// Fallback emoji per category, used only if a product's subcategory isn't
// found in SUBCATEGORY_EMOJI below. We have no real product photos, so an
// emoji is the "picture" shoppers see — see ProductImage.jsx.
const CATEGORY_EMOJI = {
  Dairy: "🥛",
  Beverages: "🥤",
  Snacks: "🍪",
  Bakery: "🍞",
  "Frozen Foods": "🧊",
  "Canned & Packaged Food": "🥫",
  "Cleaning & Household": "🧽",
  "Personal Care": "🧴",
  "Fresh Produce": "🥦",
  "Meat & Seafood": "🍗",
};

// More specific emoji per subcategory, so e.g. "Chocolate" looks different
// from "Chips" even though both are in the Snacks category.
const SUBCATEGORY_EMOJI = {
  "Arabic Bread": "🫓",
  Bread: "🍞",
  Cake: "🎂",
  Pastry: "🥐",
  Tortilla: "🌯",
  "Energy Drinks": "⚡",
  Juice: "🧃",
  "Soft Drinks": "🥤",
  "Tea Drinks": "🍵",
  Water: "💧",
  "Canned Beans": "🫘",
  "Canned Tuna": "🐟",
  Pasta: "🍝",
  Rice: "🍚",
  Sauces: "🍶",
  Dishwashing: "🧽",
  "Garbage Bags": "🗑️",
  Laundry: "🧺",
  "Paper Goods": "🧻",
  "Surface Cleaner": "🧴",
  Cheese: "🧀",
  Cream: "🥛",
  Laban: "🥤",
  Milk: "🍼",
  Yogurt: "🥣",
  Dates: "🌴",
  Fruit: "🍎",
  Herbs: "🌿",
  "Salad Packs": "🥗",
  Vegetables: "🥦",
  "Frozen Chicken": "🍗",
  "Frozen Desserts": "🍨",
  "Frozen Meat": "🥩",
  "Frozen Seafood": "🦐",
  "Frozen Vegetables": "🧊",
  Beef: "🥩",
  Chicken: "🍗",
  Fish: "🐟",
  Lamb: "🍖",
  Shrimp: "🦐",
  "Baby Care": "👶",
  Deodorant: "🧴",
  Shampoo: "🚿",
  Soap: "🧼",
  Toothpaste: "🪥",
  Biscuits: "🍪",
  Chips: "🍟",
  Chocolate: "🍫",
  Nuts: "🥜",
  Popcorn: "🍿",
};

function slugifyCategory(name) {
  if (CATEGORY_SLUGS[name]) return CATEGORY_SLUGS[name];
  // Fallback for any category not in our known list (shouldn't happen with
  // this file, but keeps the script from crashing on future imports).
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Builds an honest, factual description from the structured columns only.
// We never invent marketing copy that isn't supported by the source data.
function buildDescription(row) {
  const attrBits = [row.attribute_1, row.attribute_2].filter(Boolean).map(capitalize);
  const attrText = attrBits.length > 0 ? `${attrBits.join(", ")}. ` : "";
  return `${attrText}${row.brand} — ${row.subcategory}. Pack size: ${row.size}.`;
}

function convertRow(row, rowNumber, report) {
  const categorySlug = slugifyCategory(row.category);
  const emoji = SUBCATEGORY_EMOJI[row.subcategory] || CATEGORY_EMOJI[row.category] || "🛒";
  const price = roundKwd(Number(row.typical_price_kwd));

  if (!Number.isFinite(price) || price <= 0) {
    report.invalidPrices.push({ row: rowNumber, barcode: row.barcode, price: row.typical_price_kwd });
  }

  return {
    id: String(row.barcode),
    barcode: String(row.barcode),
    name: row.name_en,
    nameAr: row.name_ar || null,
    brand: row.brand || null,
    brandOrigin: row.brand_origin_type || null,
    category: categorySlug,
    subcategory: row.subcategory || null,
    description: buildDescription(row),
    packSize: row.size,
    unit: row.unit || null,
    priceKwd: price,
    availability: row.available_usually === "yes" ? "in_stock" : "out_of_stock",
    emoji,
    // This import has NO nutrition, ingredient or allergen data for any
    // product. We must not guess or infer it — the UI and chatbot are
    // designed to say "not available / not confirmed" whenever these are
    // null / false, rather than imply a product is safe.
    nutritionPer100g: null,
    allergensKnown: false,
    allergens: [],
    dietaryTags: [],
    keywords: row.keywords || "",
    aisle: row.aisle || null,
    section: row.section || null,
    floor: row.floor || null,
    sourceType: row.source_type || "unknown",
  };
}

function run() {
  const report = {
    totalRows: 0,
    duplicateBarcodes: [],
    duplicateProductIds: [],
    missingRequiredFields: [],
    invalidPrices: [],
    categoryCounts: new Map(),
  };

  const workbook = XLSX.readFile(SOURCE_FILE);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  report.totalRows = rows.length;

  const seenBarcodes = new Map();
  const seenProductIds = new Map();
  const requiredFields = ["product_id", "barcode", "name_en", "category", "typical_price_kwd"];

  rows.forEach((row, i) => {
    const rowNumber = i + 2; // +2 = header row + 1-based index
    seenBarcodes.set(row.barcode, (seenBarcodes.get(row.barcode) || 0) + 1);
    seenProductIds.set(row.product_id, (seenProductIds.get(row.product_id) || 0) + 1);

    const missing = requiredFields.filter((f) => row[f] === null || row[f] === undefined || row[f] === "");
    if (missing.length > 0) {
      report.missingRequiredFields.push({ row: rowNumber, missing });
    }
  });

  report.duplicateBarcodes = [...seenBarcodes.entries()].filter(([, count]) => count > 1);
  report.duplicateProductIds = [...seenProductIds.entries()].filter(([, count]) => count > 1);

  // Skip rows with missing required fields entirely rather than guessing —
  // this dataset has none, but a future re-import might.
  const validRows = rows.filter(
    (row) => !requiredFields.some((f) => row[f] === null || row[f] === undefined || row[f] === ""),
  );

  const products = validRows.map((row, i) => convertRow(row, i + 2, report));

  products.forEach((p) => {
    report.categoryCounts.set(p.category, (report.categoryCounts.get(p.category) || 0) + 1);
  });

  const fileHeader = `// GENERATED FILE — do not hand-edit.
// Produced by scripts/convertCatalogue.mjs from kuwait_products.xlsx.
// To update the catalogue: replace kuwait_products.xlsx and re-run
// \`npm run import:catalogue\`.
//
// IMPORTANT, HONEST LIMITATIONS OF THIS DATA:
// - Every product below is SAMPLE / SYNTHETIC data (see sourceType), not a
//   real live inventory feed. Prices and stock status are indicative, not
//   guaranteed current real-world figures.
// - This import has NO nutrition or allergen data for any product, so
//   nutritionPer100g is always null and allergensKnown is always false.
//   The UI and the AI assistant must treat that as "unconfirmed," never as
//   "safe" or "known to be free of X."
// - dietaryTags is always empty for the same reason: we don't fabricate
//   dietary claims (vegan, halal, gluten-free, etc.) without real evidence.

export const PRODUCTS = [
`;

  const body = products
    .map((p) => `  ${JSON.stringify(p)},`)
    // JSON.stringify gives us valid JS object literal syntax too (quoted
    // keys are legal JS), so this keeps the generator simple and safe.
    .join("\n");

  const fileContent = `${fileHeader}${body}\n];\n`;

  writeFileSync(OUTPUT_FILE, fileContent, "utf-8");

  // ---- Print the validation report ----
  console.log("\n=== Catalogue import report ===");
  console.log(`Total rows read: ${report.totalRows}`);
  console.log(`Products written: ${products.length}`);
  console.log(`Duplicate barcodes: ${report.duplicateBarcodes.length}`);
  if (report.duplicateBarcodes.length > 0) console.log(report.duplicateBarcodes);
  console.log(`Duplicate product_id values: ${report.duplicateProductIds.length}`);
  if (report.duplicateProductIds.length > 0) console.log(report.duplicateProductIds);
  console.log(`Rows missing a required field: ${report.missingRequiredFields.length}`);
  if (report.missingRequiredFields.length > 0) console.log(report.missingRequiredFields);
  console.log(`Invalid prices (<=0 or not a number): ${report.invalidPrices.length}`);
  if (report.invalidPrices.length > 0) console.log(report.invalidPrices);
  console.log("Category counts:");
  for (const [slug, count] of [...report.categoryCounts.entries()].sort()) {
    console.log(`  ${slug}: ${count}`);
  }
  console.log(`Wrote ${OUTPUT_FILE}`);
  console.log("================================\n");
}

run();
