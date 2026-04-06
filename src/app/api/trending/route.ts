import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { subDays } from "date-fns";

export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30).toISOString();
  const sixtyDaysAgo = subDays(now, 60).toISOString();

  const recentPrices = await prisma.$queryRawUnsafe<
    { ean: string; name: string; brand: string | null; image_url: string | null; current_price: number; old_price: number; change: number }[]
  >(`
    WITH recent AS (
      SELECT p.product_id, p.price as current_price, p.date,
        ROW_NUMBER() OVER (PARTITION BY p.product_id ORDER BY p.date DESC) as rn
      FROM prices p
      WHERE p.date >= ?
    ),
    older AS (
      SELECT p.product_id, p.price as old_price,
        ROW_NUMBER() OVER (PARTITION BY p.product_id ORDER BY p.date DESC) as rn
      FROM prices p
      WHERE p.date >= ? AND p.date < ?
    )
    SELECT
      pr.ean, pr.name, pr.brand, pr.image_url,
      r.current_price, o.old_price,
      (r.current_price - o.old_price) as change
    FROM recent r
    JOIN older o ON r.product_id = o.product_id AND o.rn = 1
    JOIN products pr ON r.product_id = pr.id
    WHERE r.rn = 1 AND r.current_price != o.old_price
    ORDER BY ABS(r.current_price - o.old_price) DESC
    LIMIT 10
  `, thirtyDaysAgo, sixtyDaysAgo, thirtyDaysAgo);

  const productCount = await prisma.product.count();

  return NextResponse.json({
    trending: recentPrices.map((p) => ({
      ean: p.ean, name: p.name, brand: p.brand, imageUrl: p.image_url,
      currentPrice: Number(p.current_price), oldPrice: Number(p.old_price), change: Number(p.change),
    })),
    stats: { productCount },
  });
}
