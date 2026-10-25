// Reads and writes the customer's shopping basket to localStorage. Only
// `productId` + `quantity` pairs are stored — never a price or product name —
// so the catalogue in data/catalogue.js always stays the single source of
// truth for what something is called and what it costs.
import { PRODUCTS } from "../data/catalogue";

const STORAGE_KEY = "freshkwt.basket.v1";
export const MAX_ITEM_QUANTITY = 99;

const VALID_PRODUCT_IDS = new Set(PRODUCTS.map((p) => p.id));

export function emptyBasket() {
  return { items: [] };
}

// Drops anything that isn't a real product id or a sane positive quantity.
// This is what protects the app from corrupted localStorage, old formats, or
// a product that was removed from the catalogue after being saved.
function sanitizeItems(raw) {
  if (!Array.isArray(raw)) return [];
  const byId = new Map();
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const { productId, quantity } = entry;
    if (typeof productId !== "string" || !VALID_PRODUCT_IDS.has(productId)) continue;
    const qty = Math.floor(Number(quantity));
    if (!Number.isFinite(qty) || qty < 1) continue;
    byId.set(productId, Math.min(qty, MAX_ITEM_QUANTITY));
  }
  return Array.from(byId, ([productId, quantity]) => ({ productId, quantity }));
}

export function loadBasket() {
  let rawText;
  try {
    rawText = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return emptyBasket();
  }
  if (!rawText) return emptyBasket();

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Corrupted JSON — treat it as an empty basket rather than crashing.
    return emptyBasket();
  }

  return { items: sanitizeItems(parsed?.items) };
}

export function saveBasket(basket) {
  const toSave = { items: sanitizeItems(basket.items), updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch {
    return false;
  }
}

export function clearBasket() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing more we can do if localStorage itself is unavailable.
  }
}
