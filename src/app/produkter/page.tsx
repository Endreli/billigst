import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produkter — Billigst",
  description: "Bla gjennom dagligvarer og sammenlign priser på tvers av norske butikkjeder. Finn de billigste produktene.",
};

const CATEGORY_EMOJI: Record<string, string> = {
  Meieriprodukter: "🥛",
  Ost: "🧀",
  "Kjøtt": "🥩",
  Egg: "🥚",
  "Brød": "🍞",
  Fisk: "🐟",
  Sjokolade: "🍫",
  Ferdigmat: "🍕",
  Brus: "🥤",
  Drikke: "🧃",
  Sauser: "🍅",
};

interface BrowsePageProps {
  searchParams: Promise<{ category?: string }>;
}

async function getBrowseData(category?: string) {
  const products = await prisma.product.findMany({
    where: category ? { category } : undefined,
    include: {
      prices: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: [{ searchCount: "desc" }, { name: "asc" }],
  });

  const allProducts = await prisma.product.groupBy({
    by: ["category"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const categories = allProducts
    .filter((c) => c.category != null)
    .map((c) => ({ name: c.category!, count: c._count.id }));

  return {
    products: products.map((p) => ({
      ean: p.ean,
      name: p.name,
      brand: p.brand,
      vendor: p.vendor,
      imageUrl: p.imageUrl,
      category: p.category,
      currentPrice: p.prices[0] ? Number(p.prices[0].price) : null,
      chain: p.prices[0]?.chain ?? null,
    })),
    categories,
    selectedCategory: category,
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const data = await getBrowseData(params.category);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Produkter</h1>
        <p className="text-text-muted text-[15px] mt-1">
          {data.selectedCategory
            ? `${data.products.length} produkter i ${data.selectedCategory}`
            : `${data.products.length} produkter tilgjengelig`}
        </p>
      </div>

      {/* Categories — horizontal scroll on mobile */}
      <div className="relative -mx-4 px-4">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 w-max pr-8">
            <a
              href="/produkter"
              className={`px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors active:scale-95 ${
                !data.selectedCategory
                  ? "bg-primary/15 border border-primary/30 text-primary"
                  : "bg-surface-hover border border-border text-text-muted hover:text-white"
              }`}
            >
              Alle ({data.categories.reduce((s: number, c: any) => s + c.count, 0)})
            </a>
            {data.categories.map((cat: any) => {
              const emoji = CATEGORY_EMOJI[cat.name] || "📦";
              const isActive = data.selectedCategory === cat.name;
              return (
                <a
                  key={cat.name}
                  href={`/produkter?category=${encodeURIComponent(cat.name)}`}
                  className={`px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors active:scale-95 ${
                    isActive
                      ? "bg-primary/15 border border-primary/30 text-primary"
                      : "bg-surface-hover border border-border text-text-muted hover:text-white"
                  }`}
                >
                  {emoji} {cat.name} ({cat.count})
                </a>
              );
            })}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#111318] to-transparent pointer-events-none" />
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.products.map((p: any) => (
          <ProductCard key={p.ean} {...p} />
        ))}
      </div>
    </div>
  );
}
