import { useCallback, useEffect, useRef, useState } from "react";
import { loadBasket, saveBasket, clearBasket, MAX_ITEM_QUANTITY } from "../lib/basketStorage";

// Manages the shopping basket: items (productId + quantity only — prices and
// names always come live from the catalogue), backed by localStorage.
//
// `itemsRef` mirrors `items` so handlers can read the latest basket synchronously
// without relying on a setState updater function. (A sibling bug in the chat
// assistant showed why that pattern is risky: React 18 Strict Mode double-invokes
// updater functions in development, so any side effect placed inside one runs
// twice. We avoid that entirely here by always reading from the ref.)
export function useBasket() {
  const [items, setItems] = useState([]);
  const itemsRef = useRef([]);

  useEffect(() => {
    const saved = loadBasket();
    itemsRef.current = saved.items;
    setItems(saved.items);
  }, []);

  const commit = useCallback((nextItems) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
    saveBasket({ items: nextItems });
  }, []);

  const addItem = useCallback(
    (productId, quantity = 1) => {
      const current = itemsRef.current;
      const existing = current.find((i) => i.productId === productId);
      let next;
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, MAX_ITEM_QUANTITY);
        next = current.map((i) => (i.productId === productId ? { ...i, quantity: newQty } : i));
      } else {
        const safeQty = Math.min(Math.max(Math.floor(quantity), 1), MAX_ITEM_QUANTITY);
        next = [...current, { productId, quantity: safeQty }];
      }
      commit(next);
    },
    [commit],
  );

  // Sets an exact quantity. A quantity below 1 removes the item entirely —
  // that's a deliberate, predictable rule rather than silently clamping to 1.
  const setQuantity = useCallback(
    (productId, quantity) => {
      const current = itemsRef.current;
      const safeQty = Math.floor(quantity);
      if (!Number.isFinite(safeQty) || safeQty < 1) {
        commit(current.filter((i) => i.productId !== productId));
        return;
      }
      const clamped = Math.min(safeQty, MAX_ITEM_QUANTITY);
      commit(current.map((i) => (i.productId === productId ? { ...i, quantity: clamped } : i)));
    },
    [commit],
  );

  const increaseQuantity = useCallback(
    (productId) => {
      const existing = itemsRef.current.find((i) => i.productId === productId);
      if (!existing) return;
      setQuantity(productId, existing.quantity + 1);
    },
    [setQuantity],
  );

  // Never goes below 1 here — removing an item entirely is a separate,
  // explicit action (removeItem / the trash icon) so quantity controls can't
  // accidentally delete something.
  const decreaseQuantity = useCallback(
    (productId) => {
      const existing = itemsRef.current.find((i) => i.productId === productId);
      if (!existing || existing.quantity <= 1) return;
      setQuantity(productId, existing.quantity - 1);
    },
    [setQuantity],
  );

  const removeItem = useCallback(
    (productId) => {
      commit(itemsRef.current.filter((i) => i.productId !== productId));
    },
    [commit],
  );

  const clear = useCallback(() => {
    clearBasket();
    commit([]);
  }, [commit]);

  return { items, addItem, increaseQuantity, decreaseQuantity, removeItem, setQuantity, clear };
}
