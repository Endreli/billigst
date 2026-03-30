import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchCpiData } from "@/lib/ssb";

export async function POST(request: NextRequest) {
  // Verify Vercel Cron secret
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cpiData = await fetchCpiData(2020);
    let saved = 0;

    for (const entry of cpiData) {
      await prisma.cpiData.upsert({
        where: { year_month: { year: entry.year, month: entry.month } },
        update: { value: entry.value },
        create: { year: entry.year, month: entry.month, value: entry.value },
      });
      saved++;
    }

    return NextResponse.json({ success: true, entriesSaved: saved });
  } catch (error) {
    console.error("CPI fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch CPI data" }, { status: 500 });
  }
}
