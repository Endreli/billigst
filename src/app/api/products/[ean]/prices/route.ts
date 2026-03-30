import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateCpiReferenceLine } from "@/lib/cpi-calc";
import { subMonths, subDays } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ean: string }> }
) {
  const { ean } = await params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "1y";

  const product = await prisma.product.findUnique({ where: { ean } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const now = new Date();
  let since: Date;
  switch (period) {
    case "1m": since = subDays(now, 30); break;
    case "6m": since = subMonths(now, 6); break;
    case "1y": since = subMonths(now, 12); break;
    case "max": since = new Date(2020, 0, 1); break;
    default: since = subMonths(now, 12);
  }

  const prices = await prisma.price.findMany({
    where: { productId: product.id, date: { gte: since } },
    orderBy: { date: "asc" },
  });

  const cpiData = await prisma.cpiData.findMany({
    where: {
      OR: [
        { year: { gt: since.getFullYear() } },
        { year: since.getFullYear(), month: { gte: since.getMonth() + 1 } },
      ],
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  const earliestPrice = prices[0];
  const cpiLine = earliestPrice
    ? calculateCpiReferenceLine(
        Number(earliestPrice.price),
        cpiData.map((c) => ({ year: c.year, month: c.month, value: Number(c.value) })),
        {
          year: new Date(earliestPrice.date).getFullYear(),
          month: new Date(earliestPrice.date).getMonth() + 1,
        }
      )
    : [];

  return NextResponse.json({
    ean, period,
    prices: prices.map((p) => ({ chain: p.chain, price: Number(p.price), date: p.date })),
    cpiLine,
  });
}
