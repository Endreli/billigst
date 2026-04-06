import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ean: string }> }
) {
  const { ean } = await params;

  const product = await prisma.product.findUnique({ where: { ean } });
  if (!product) return NextResponse.json({ products: [] });

  // Extract key words from product name (skip short/common Norwegian words)
  const skipWords = new Set([
    "og", "med", "for", "fra", "den", "det", "en", "et", "av", "til",
    "som", "er", "på", "i", "de", "om", "kan", "vil", "har", "var",
  ]);
  const words = product.name
    .replace(/\d+\s*(g|kg|ml|cl|dl|l|stk|pk)\b/gi, "") // remove weight/unit
    .split(/\s+/)
    .filter((w) => w.length > 2 && !skipWords.has(w.toLowerCase()));

  if (words.length === 0) return NextResponse.json({ products: [] });

  // Use first 3 meaningful words for matching
  const searchWords = words.slice(0, 3);

  const likeConditions = searchWords
    .map(() => "LOWER(p.name) LIKE LOWER(?)")
    .join(" OR ");

  const similar = await prisma.$queryRawUnsafe<
    Array<{
      ean: string;
      name: string;
      brand: string | null;
      vendor: string | null;
      imageUrl: string | null;
      category: string | null;
      currentPrice: number | null;
      chain: string | null;
    }>
  >(
    `SELECT p.ean, p.name, p.brand, p.vendor, p.image_url as "imageUrl", p.category,
            (SELECT pr.price FROM prices pr WHERE pr.product_id = p.id ORDER BY pr.date DESC LIMIT 1) as "currentPrice",
            (SELECT pr.chain FROM prices pr WHERE pr.product_id = p.id ORDER BY pr.date DESC LIMIT 1) as "chain"
     FROM products p
     WHERE p.ean != ?
     AND (${likeConditions})
     ORDER BY p.name
     LIMIT 6`,
    ean,
    ...searchWords.map((w) => `%${w}%`)
  );

  return NextResponse.json({ products: similar });
}
