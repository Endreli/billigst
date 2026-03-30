import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { subDays } from "date-fns";

export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  const recentPrices = await prisma.$queryRaw<
    { ean: string; name: string; brand: string | null; image_url: string | null; current_price: number; old_price: number; change: number }[]
  >`
    WITH recent AS (
      SELECT DISTINCT ON (p.product_id)
        p.product_id, p.price as current_price, p.date
      FROM prices p
      WHERE p.date >= ${thirtyDaysAgo}
      ORDER BY p.product_id, p.date DESC
    ),
    older AS (
      SELECT DISTINCT ON (p.product_id)
        p.product_id, p.price as old_price
      FROM prices p
      WHERE p.date >= ${sixtyDaysAgo} AND p.date < ${thirtyDaysAgo}
      ORDER BY p.product_id, p.date DESC
    )
    SELECT
      pr.ean, pr.name, pr.brand, pr.image_url,
      r.current_price::float, o.old_price::float,
      (r.current_price - o.old_price)::float as change
    FROM recent r
    JOIN older o ON r.product_id = o.product_id
    JOIN products pr ON r.product_id = pr.id
    WHERE r.current_price != o.old_price
    ORDER BY ABS(r.current_price - o.old_price) DESC
    LIMIT 10
  `;

  const latestCpi = await prisma.cpiData.findFirst({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const productCount = await prisma.product.count();

  return NextResponse.json({
    trending: recentPrices.map((p) => ({
      ean: p.ean, name: p.name, brand: p.brand, imageUrl: p.image_url,
      currentPrice: p.current_price, oldPrice: p.old_price, change: p.change,
    })),
    stats: {
      latestCpi: latestCpi ? { year: latestCpi.year, month: latestCpi.month, value: latestCpi.value } : null,
      productCount,
    },
  });
}
