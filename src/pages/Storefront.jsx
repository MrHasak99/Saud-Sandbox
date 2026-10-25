import { useMemo, useState } from "react";
import StoreHeader from "../components/storefront/StoreHeader";
import Hero from "../components/storefront/Hero";
import CategoryNav from "../components/storefront/CategoryNav";
import SearchBar from "../components/storefront/SearchBar";
import SortBar from "../components/storefront/SortBar";
import ProductGrid from "../components/storefront/ProductGrid";
import ProductDetail from "../components/storefront/ProductDetail";
import StoreFooter from "../components/storefront/StoreFooter";
import ChatWidget from "../components/assistant/ChatWidget";
import ProfilePanel from "../components/profile/ProfilePanel";
import BasketDrawer from "../components/basket/BasketDrawer";
import { PRODUCTS } from "../data/catalogue";
import { searchProducts, filterByCategory, sortProducts, getProductById } from "../lib/catalogueHelpers";
import { getBasketItemCount } from "../lib/basketHelpers";
import { useDietProfile } from "../hooks/useDietProfile";
import { useBasket } from "../hooks/useBasket";

export default function Storefront() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const { profile, hasProfile, save, clear } = useDietProfile();
  const basket = useBasket();

  // Recompute the visible product list whenever a filter/search/sort changes.
  const visibleProducts = useMemo(() => {
    let result = filterByCategory(PRODUCTS, selectedCategory);
    result = searchProducts(result, searchQuery);
    result = sortProducts(result, sortBy);
    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  const selectedProduct = selectedProductId ? getProductById(PRODUCTS, selectedProductId) : null;
  const basketItemCount = getBasketItemCount(basket.items);

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader
        onOpenProfile={() => setProfileOpen(true)}
        hasProfile={hasProfile}
        onOpenBasket={() => setBasketOpen(true)}
        basketItemCount={basketItemCount}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProductId(null)}
            onAddToBasket={basket.addItem}
          />
        ) : (
          <div className="space-y-6">
            <Hero onOpenProfile={() => setProfileOpen(true)} hasProfile={hasProfile} />

            <div className="space-y-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <CategoryNav selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
              <SortBar sortBy={sortBy} onSortChange={setSortBy} resultCount={visibleProducts.length} />
            </div>

            <ProductGrid
              products={visibleProducts}
              onSelectProduct={setSelectedProductId}
              onAddToBasket={basket.addItem}
            />
          </div>
        )}
      </main>

      <StoreFooter />
      <ChatWidget onAddToBasket={basket.addItem} />
      <ProfilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        hasProfile={hasProfile}
        onSave={save}
        onClear={clear}
      />
      <BasketDrawer
        open={basketOpen}
        onClose={() => setBasketOpen(false)}
        items={basket.items}
        onIncrease={basket.increaseQuantity}
        onDecrease={basket.decreaseQuantity}
        onRemove={basket.removeItem}
      />
    </div>
  );
}
