// Pure calculations for turning basket items (just productId + quantity)
// into something a component can render, using the catalogue as the only
// source of truth for names and prices.
import { roundKwd } from "./money";

// Joins basket items with live product data. Any item whose product can no
// longer be found (e.g. removed from the catalogue) is silently skipped —
// basketStorage already filters these out on load/save, this is just a
// second safety net for in-memory state during a session.
export function getBasketLines(items, products) {
  return items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        product,
        quantity: item.quantity,
        lineTotal: roundKwd(product.priceKwd * item.quantity),
      };
    })
    .filter(Boolean);
}

export function getBasketSubtotal(lines) {
  return roundKwd(lines.reduce((sum, line) => sum + line.lineTotal, 0));
}

export function getBasketItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
