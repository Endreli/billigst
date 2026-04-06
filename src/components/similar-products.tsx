"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { useBasketContext } from "@/components/basket-provider";
import { formatKr } from "@/lib/format";

interface SimilarProduct {
  ean: string;
  name: string;
  brand: string | null;
  vendor: string | null;
  imageUrl: string | null;
  category: string | null;
  currentPrice: number | null;
  chain: string | null;
}

interface SimilarProductsProps {
  ean: string;
  currentName: string;
}

export function SimilarProducts({ ean, currentName }: SimilarProductsProps) {
  const [products, setProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${ean}/similar`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ean]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wide">
          Lignende produkter
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-48 bg-surface rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-[13px] font-semibold text-text-muted uppercase tracking-wide">
        Lignende produkter
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {products.map((p) => (
          <SimilarProductCard key={p.ean} product={p} />
        ))}
      </div>
    </div>
  );
}

function SimilarProductCard({ product }: { product: SimilarProduct }) {
  const { addItem, hasItem } = useBasketContext();
  const inBasket = hasItem(product.ean);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inBasket) {
      addItem({
        ean: product.ean,
        name: product.name,
        brand: product.brand,
        imageUrl: product.imageUrl,
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 600);
    }
  }

  return (
    <Link
      href={`/produkt/${product.ean}`}
      className="flex-shrink-0 w-40 bg-surface border border-border rounded-xl p-3 hover:border-primary/20 transition-colors group"
    >
      <div className="flex justify-center mb-2">
        <ProductImage src={product.imageUrl} alt={product.name} size="lg" />
      </div>
      {product.brand && (
        <div className="text-[11px] text-text-muted uppercase tracking-wide truncate">
          {product.brand}
        </div>
      )}
      <div className="text-white text-[13px] font-medium line-clamp-2 leading-snug min-h-[2.5em]">
        {product.name}
      </div>
      {product.currentPrice != null && (
        <div className="mt-1.5">
          <span className="text-white font-bold text-[14px]">
            {formatKr(product.currentPrice)}
          </span>
          {product.chain && (
            <span className="text-[11px] text-text-muted ml-1">
              {product.chain}
            </span>
          )}
        </div>
      )}
      <button
        onClick={handleAdd}
        className={`mt-2 w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 ${
          inBasket
            ? "bg-primary/15 text-primary border border-primary/30"
            : "bg-primary text-white hover:bg-primary-hover"
        } ${justAdded ? "animate-basket-pop" : ""}`}
        aria-label={
          inBasket
            ? `${product.name} er i handlekurven`
            : `Legg til ${product.name}`
        }
      >
        {inBasket ? "Lagt til" : "Legg til"}
      </button>
    </Link>
  );
}
