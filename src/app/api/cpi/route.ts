import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const cpiData = await prisma.cpiData.findMany({
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  return NextResponse.json({
    data: cpiData.map((c) => ({ year: c.year, month: c.month, value: c.value })),
  });
}
