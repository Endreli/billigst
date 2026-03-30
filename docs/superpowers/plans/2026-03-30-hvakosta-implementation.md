# HvaKosta.no Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Norwegian grocery price tracker that shows historical prices and compares them against CPI inflation data.

**Architecture:** Next.js 14+ App Router with PostgreSQL for price history storage. Kassalapp API provides product/price data, SSB API provides CPI data. Daily cron jobs collect prices, frontend displays search, product pages with price charts, and inflation comparisons.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, PostgreSQL (Supabase), Prisma ORM, Vercel hosting.

**Spec:** `docs/superpowers/specs/2026-03-30-hvakosta-design.md`

---

## File Structure

```
E:/Development/HvaKosta/
├── .env.local                          # API keys (KASSAL_API_KEY, DATABASE_URL, CRON_SECRET)
├── .env.example                        # Template without secrets
├── .gitignore
├── next.config.ts                      # Next.js config
├── tailwind.config.ts                  # Tailwind config with dark theme
├── tsconfig.json
├── package.json
├── vercel.json                         # Cron job config
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── seed.ts                         # Initial data seeding script
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with dark theme, nav
│   │   ├── page.tsx                    # Dashboard homepage
│   │   ├── sok/
│   │   │   └── page.tsx               # Search results page
│   │   ├── produkt/
│   │   │   └── [ean]/
│   │   │       └── page.tsx           # Product detail page
│   │   ├── inflasjon/
│   │   │   └── page.tsx               # Inflation overview page
│   │   └── api/
│   │       ├── products/
│   │       │   ├── search/
│   │       │   │   └── route.ts       # GET /api/products/search
│   │       │   └── [ean]/
│   │       │       ├── route.ts       # GET /api/products/[ean]
│   │       │       └── prices/
│   │       │           └── route.ts   # GET /api/products/[ean]/prices
│   │       ├── cpi/
│   │       │   └── route.ts           # GET /api/cpi
│   │       ├── trending/
│   │       │   └── route.ts           # GET /api/trending
│   │       └── cron/
│   │           ├── fetch-prices/
│   │           │   └── route.ts       # POST /api/cron/fetch-prices
│   │           └── fetch-cpi/
│   │               └── route.ts       # POST /api/cron/fetch-cpi
│   ├── lib/
│   │   ├── db.ts                      # Prisma client singleton
│   │   ├── kassal.ts                  # Kassalapp API client
│   │   ├── ssb.ts                     # SSB API client for KPI
│   │   ├── chains.ts                  # Chain name normalization
│   │   └── cpi-calc.ts               # KPI reference line calculation
│   └── components/
│       ├── search-bar.tsx             # Search input with autocomplete
│       ├── product-card.tsx           # Product card for search results
│       ├── price-chart.tsx            # Recharts price history + KPI overlay
│       ├── store-prices.tsx           # Store price comparison list
│       ├── stat-card.tsx              # Dashboard stat card
│       ├── trending-list.tsx          # Trending price changes list
│       └── nav.tsx                    # Top navigation bar
└── __tests__/
    ├── lib/
    │   ├── kassal.test.ts             # Kassalapp client tests
    │   ├── ssb.test.ts                # SSB client tests
    │   ├── chains.test.ts             # Chain normalization tests
    │   └── cpi-calc.test.ts           # KPI calculation tests
    └── api/
        ├── search.test.ts             # Search API tests
        ├── product.test.ts            # Product API tests
        └── trending.test.ts           # Trending API tests
```

---

## Task 1: Project Setup & Configuration

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.env.example`, `.env.local`, `.gitignore`, `vercel.json`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd E:/Development/HvaKosta
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @prisma/client recharts date-fns
npm install -D prisma @types/node vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Create `.env.example`**

```env
# Kassalapp API
KASSAL_API_KEY=your_api_key_here

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/hvakosta

# Cron job authentication
CRON_SECRET=your_cron_secret_here
```

- [ ] **Step 4: Create `.env.local` with real keys**

Copy `.env.example` to `.env.local` and fill in real values. User must get Kassalapp API key from https://kassal.app/profil/api.

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 6: Add test script to package.json**

Add to `scripts`: `"test": "vitest run", "test:watch": "vitest"`

- [ ] **Step 7: Create `vercel.json` for cron jobs**

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-prices",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/fetch-cpi",
      "schedule": "0 8 15 * *"
    }
  ]
}
```

- [ ] **Step 8: Update `.gitignore`**

Ensure `.env.local`, `node_modules`, `.next`, `.superpowers/` are included.

- [ ] **Step 9: Configure Tailwind for dark theme**

Update `tailwind.config.ts` to set `darkMode: "class"` and extend colors with custom palette:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#111111",
        "surface-hover": "#1a1a1a",
        border: "#2a2a2a",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 10: Git init and initial commit**

```bash
git init
git add -A
git commit -m "chore: initial Next.js project setup with Tailwind, Vitest, Prisma"
```

---

## Task 2: Database Schema (Prisma)

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write Prisma schema**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id        Int      @id @default(autoincrement())
  ean       String   @unique @db.VarChar(13)
  name      String
  brand     String?
  vendor    String?
  imageUrl  String?  @map("image_url")
  category  String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  prices    Price[]

  @@map("products")
}

model Price {
  id        Int      @id @default(autoincrement())
  productId Int      @map("product_id")
  chain     String
  price     Decimal  @db.Decimal(10, 2)
  date      DateTime @db.Date
  createdAt DateTime @default(now()) @map("created_at")
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, chain, date])
  @@index([productId, date])
  @@map("prices")
}

model CpiData {
  id    Int     @id @default(autoincrement())
  year  Int
  month Int
  value Decimal @db.Decimal(10, 2)

  @@unique([year, month])
  @@map("cpi_data")
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Generate Prisma client and push schema**

```bash
npx prisma generate
npx prisma db push
```

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/db.ts
git commit -m "feat: add Prisma schema with products, prices, cpi_data tables"
```

---

## Task 3: Kassalapp API Client

**Files:**
- Create: `src/lib/kassal.ts`, `src/lib/chains.ts`, `__tests__/lib/kassal.test.ts`, `__tests__/lib/chains.test.ts`

- [ ] **Step 1: Write chain normalization tests**

Create `__tests__/lib/chains.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { normalizeChain } from "@/lib/chains";

describe("normalizeChain", () => {
  it("extracts Kiwi from full store name", () => {
    expect(normalizeChain("Kiwi Majorstuen")).toBe("Kiwi");
  });
  it("extracts Meny from full store name", () => {
    expect(normalizeChain("Meny Storo")).toBe("Meny");
  });
  it("extracts Rema 1000", () => {
    expect(normalizeChain("REMA 1000 Grønland")).toBe("Rema 1000");
  });
  it("extracts Coop Extra", () => {
    expect(normalizeChain("Coop Extra Lambertseter")).toBe("Coop Extra");
  });
  it("extracts Coop Mega", () => {
    expect(normalizeChain("Coop Mega Bryn")).toBe("Coop Mega");
  });
  it("extracts Spar", () => {
    expect(normalizeChain("SPAR Frogner")).toBe("Spar");
  });
  it("extracts Joker", () => {
    expect(normalizeChain("Joker Bislett")).toBe("Joker");
  });
  it("extracts Oda", () => {
    expect(normalizeChain("Oda")).toBe("Oda");
  });
  it("extracts Bunnpris", () => {
    expect(normalizeChain("Bunnpris Torshov")).toBe("Bunnpris");
  });
  it("returns original if no match", () => {
    expect(normalizeChain("Unknown Store")).toBe("Unknown Store");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/lib/chains.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement chain normalization**

Create `src/lib/chains.ts`:

```typescript
const CHAIN_PATTERNS: [RegExp, string][] = [
  [/^rema\s*1000/i, "Rema 1000"],
  [/^coop\s+extra/i, "Coop Extra"],
  [/^coop\s+mega/i, "Coop Mega"],
  [/^coop\s+obs/i, "Coop Obs"],
  [/^coop\s+prix/i, "Coop Prix"],
  [/^kiwi/i, "Kiwi"],
  [/^meny/i, "Meny"],
  [/^spar\b/i, "Spar"],
  [/^joker/i, "Joker"],
  [/^oda\b/i, "Oda"],
  [/^bunnpris/i, "Bunnpris"],
  [/^havaristen/i, "Havaristen"],
];

export function normalizeChain(storeName: string): string {
  for (const [pattern, chain] of CHAIN_PATTERNS) {
    if (pattern.test(storeName.trim())) {
      return chain;
    }
  }
  return storeName.trim();
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run __tests__/lib/chains.test.ts
```
Expected: All tests PASS.

- [ ] **Step 5: Write Kassalapp client**

Create `src/lib/kassal.ts`:

```typescript
const BASE_URL = "https://kassal.app/api/v1";

function headers() {
  return {
    Authorization: `Bearer ${process.env.KASSAL_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface KassalProduct {
  id: number;
  name: string;
  brand: string | null;
  vendor: string | null;
  ean: string;
  image: string | null;
  category: string[];
  current_price: {
    price: number;
    unit_price: number | null;
    date: string;
    store: {
      name: string;
      code: string;
    };
  } | null;
}

export interface KassalSearchResult {
  data: KassalProduct[];
  links: { next: string | null; prev: string | null };
}

export interface KassalPriceHistory {
  ean: string;
  prices: {
    price: number;
    date: string;
    store: { name: string };
  }[];
}

export async function searchProducts(
  query: string,
  page = 1,
  size = 20
): Promise<KassalSearchResult> {
  const params = new URLSearchParams({
    search: query,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(`${BASE_URL}/products?${params}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Kassal API error: ${res.status}`);
  return res.json();
}

export async function getProductByEan(
  ean: string
): Promise<{ data: KassalProduct }> {
  const res = await fetch(`${BASE_URL}/products/ean/${ean}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Kassal API error: ${res.status}`);
  return res.json();
}

export async function getPricesBulk(
  eans: string[],
  days = 90
): Promise<{ data: KassalPriceHistory[] }> {
  const res = await fetch(`${BASE_URL}/products/prices-bulk`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ eans, days }),
  });
  if (!res.ok) throw new Error(`Kassal API error: ${res.status}`);
  return res.json();
}
```

- [ ] **Step 6: Write Kassalapp client tests (mocked fetch)**

Create `__tests__/lib/kassal.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchProducts, getProductByEan } from "@/lib/kassal";

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.stubEnv("KASSAL_API_KEY", "test-key");
  mockFetch.mockReset();
});

describe("searchProducts", () => {
  it("sends correct request and returns data", async () => {
    const mockData = { data: [{ id: 1, name: "Grandiosa", ean: "123" }], links: { next: null, prev: null } };
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData) });

    const result = await searchProducts("grandiosa");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/products?search=grandiosa"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      })
    );
    expect(result.data).toHaveLength(1);
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    await expect(searchProducts("test")).rejects.toThrow("Kassal API error: 429");
  });
});

describe("getProductByEan", () => {
  it("fetches product by EAN", async () => {
    const mockData = { data: { id: 1, name: "Grandiosa", ean: "7038010000539" } };
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockData) });

    const result = await getProductByEan("7038010000539");
    expect(result.data.ean).toBe("7038010000539");
  });
});
```

- [ ] **Step 7: Run all tests**

```bash
npx vitest run
```
Expected: All tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/kassal.ts src/lib/chains.ts __tests__/
git commit -m "feat: add Kassalapp API client and chain normalization"
```

---

## Task 4: SSB API Client (KPI)

**Files:**
- Create: `src/lib/ssb.ts`, `src/lib/cpi-calc.ts`, `__tests__/lib/ssb.test.ts`, `__tests__/lib/cpi-calc.test.ts`

- [ ] **Step 1: Write CPI calculation tests**

Create `__tests__/lib/cpi-calc.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { calculateCpiReferenceLine } from "@/lib/cpi-calc";

describe("calculateCpiReferenceLine", () => {
  const cpiData = [
    { year: 2024, month: 1, value: 100 },
    { year: 2024, month: 2, value: 101 },
    { year: 2024, month: 3, value: 102 },
    { year: 2024, month: 4, value: 103 },
  ];

  it("starts at the given base price", () => {
    const line = calculateCpiReferenceLine(50, cpiData, { year: 2024, month: 1 });
    expect(line[0].price).toBe(50);
  });

  it("scales price proportionally with CPI", () => {
    const line = calculateCpiReferenceLine(50, cpiData, { year: 2024, month: 1 });
    // month 2: 50 * (101/100) = 50.5
    expect(line[1].price).toBeCloseTo(50.5);
    // month 3: 50 * (102/100) = 51
    expect(line[2].price).toBeCloseTo(51);
  });

  it("returns empty array if no CPI data", () => {
    const line = calculateCpiReferenceLine(50, [], { year: 2024, month: 1 });
    expect(line).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/lib/cpi-calc.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement CPI calculation**

Create `src/lib/cpi-calc.ts`:

```typescript
interface CpiEntry {
  year: number;
  month: number;
  value: number;
}

interface CpiPricePoint {
  year: number;
  month: number;
  price: number;
}

export function calculateCpiReferenceLine(
  basePrice: number,
  cpiData: CpiEntry[],
  startMonth: { year: number; month: number }
): CpiPricePoint[] {
  if (cpiData.length === 0) return [];

  const baseCpi = cpiData.find(
    (d) => d.year === startMonth.year && d.month === startMonth.month
  );
  if (!baseCpi) return [];

  return cpiData
    .filter(
      (d) =>
        d.year > startMonth.year ||
        (d.year === startMonth.year && d.month >= startMonth.month)
    )
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((d) => ({
      year: d.year,
      month: d.month,
      price: Number(((basePrice * d.value) / baseCpi.value).toFixed(2)),
    }));
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/lib/cpi-calc.test.ts
```
Expected: All tests PASS.

- [ ] **Step 5: Write SSB client**

Create `src/lib/ssb.ts`:

```typescript
const SSB_API_URL = "https://data.ssb.no/api/v0/no/table/03013";

interface SsbQueryBody {
  query: { code: string; selection: { filter: string; values: string[] } }[];
  response: { format: string };
}

interface SsbJsonStat {
  dataset: {
    dimension: {
      Tid: { category: { index: Record<string, number>; label: Record<string, string> } };
    };
    value: number[];
  };
}

export interface CpiDataPoint {
  year: number;
  month: number;
  value: number;
}

export async function fetchCpiData(fromYear = 2020): Promise<CpiDataPoint[]> {
  const query: SsbQueryBody = {
    query: [
      {
        code: "Konsumgrp",
        selection: { filter: "item", values: ["TOTAL"] },
      },
      {
        code: "ContentsCode",
        selection: { filter: "item", values: ["KpiIndMnd"] },
      },
      {
        code: "Tid",
        selection: {
          filter: "agg:TidMaaneder10",
          values: Array.from({ length: 2027 - fromYear }, (_, i) =>
            String(fromYear + i)
          ).flatMap((y) =>
            Array.from({ length: 12 }, (_, m) =>
              `${y}M${String(m + 1).padStart(2, "0")}`
            )
          ),
        },
      },
    ],
    response: { format: "json-stat" },
  };

  const res = await fetch(SSB_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });

  if (!res.ok) throw new Error(`SSB API error: ${res.status}`);

  const json: SsbJsonStat = await res.json();
  const tidIndex = json.dataset.dimension.Tid.category.index;
  const values = json.dataset.value;

  return Object.entries(tidIndex)
    .sort(([, a], [, b]) => a - b)
    .map(([key, idx]) => {
      const [yearStr, monthStr] = key.split("M");
      return {
        year: parseInt(yearStr),
        month: parseInt(monthStr),
        value: values[idx],
      };
    })
    .filter((d) => d.value != null && !isNaN(d.value));
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/ssb.ts src/lib/cpi-calc.ts __tests__/lib/
git commit -m "feat: add SSB API client for KPI data and CPI calculation"
```

---

## Task 5: API Routes

**Files:**
- Create: `src/app/api/products/search/route.ts`, `src/app/api/products/[ean]/route.ts`, `src/app/api/products/[ean]/prices/route.ts`, `src/app/api/cpi/route.ts`, `src/app/api/trending/route.ts`

- [ ] **Step 1: Create search API route**

Create `src/app/api/products/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchProducts as kassalSearch } from "@/lib/kassal";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const chain = searchParams.get("chain");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!q) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  // Search local DB first
  const offset = (page - 1) * limit;
  const products = await prisma.product.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
    },
    include: {
      prices: {
        orderBy: { date: "desc" },
        take: 1,
        ...(chain ? { where: { chain } } : {}),
      },
    },
    skip: offset,
    take: limit,
    orderBy: { name: "asc" },
  });

  // If no local results, proxy to Kassalapp API and store
  if (products.length === 0) {
    try {
      const kassalResult = await kassalSearch(q, page, limit);
      // Store discovered products in DB for future queries
      for (const kp of kassalResult.data) {
        if (kp.ean) {
          await prisma.product.upsert({
            where: { ean: kp.ean },
            update: { name: kp.name, brand: kp.brand, vendor: kp.vendor, imageUrl: kp.image },
            create: {
              ean: kp.ean,
              name: kp.name,
              brand: kp.brand,
              vendor: kp.vendor,
              imageUrl: kp.image,
            },
          });
        }
      }

      return NextResponse.json({
        products: kassalResult.data.map((kp) => ({
          ean: kp.ean,
          name: kp.name,
          brand: kp.brand,
          vendor: kp.vendor,
          imageUrl: kp.image,
          currentPrice: kp.current_price?.price ?? null,
          chain: kp.current_price?.store?.name ?? null,
        })),
        source: "kassal",
        page,
        limit,
      });
    } catch {
      return NextResponse.json({ products: [], source: "none", page, limit });
    }
  }

  return NextResponse.json({
    products: products.map((p) => ({
      ean: p.ean,
      name: p.name,
      brand: p.brand,
      vendor: p.vendor,
      imageUrl: p.imageUrl,
      currentPrice: p.prices[0] ? Number(p.prices[0].price) : null,
      chain: p.prices[0]?.chain ?? null,
    })),
    source: "db",
    page,
    limit,
  });
}
```

- [ ] **Step 2: Create product detail API route**

Create `src/app/api/products/[ean]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProductByEan } from "@/lib/kassal";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ean: string }> }
) {
  const { ean } = await params;

  let product = await prisma.product.findUnique({
    where: { ean },
    include: {
      prices: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  // Fallback to Kassalapp if not in DB
  if (!product) {
    try {
      const kassalResult = await getProductByEan(ean);
      const kp = kassalResult.data;
      product = await prisma.product.create({
        data: {
          ean: kp.ean,
          name: kp.name,
          brand: kp.brand,
          vendor: kp.vendor,
          imageUrl: kp.image,
        },
        include: { prices: { orderBy: { date: "desc" }, take: 1 } },
      });
    } catch {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
  }

  // Get latest price per chain
  const latestPrices = await prisma.price.findMany({
    where: { productId: product.id },
    orderBy: { date: "desc" },
    distinct: ["chain"],
  });

  return NextResponse.json({
    ean: product.ean,
    name: product.name,
    brand: product.brand,
    vendor: product.vendor,
    imageUrl: product.imageUrl,
    latestPrices: latestPrices.map((p) => ({
      chain: p.chain,
      price: Number(p.price),
      date: p.date,
    })),
  });
}
```

- [ ] **Step 3: Create price history API route**

Create `src/app/api/products/[ean]/prices/route.ts`:

```typescript
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
    where: {
      productId: product.id,
      date: { gte: since },
    },
    orderBy: { date: "asc" },
  });

  // Get CPI data for the same period
  const cpiData = await prisma.cpiData.findMany({
    where: {
      OR: [
        { year: { gt: since.getFullYear() } },
        {
          year: since.getFullYear(),
          month: { gte: since.getMonth() + 1 },
        },
      ],
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  // Calculate CPI reference line from earliest price
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
    ean,
    period,
    prices: prices.map((p) => ({
      chain: p.chain,
      price: Number(p.price),
      date: p.date,
    })),
    cpiLine,
  });
}
```

- [ ] **Step 4: Create CPI API route**

Create `src/app/api/cpi/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const cpiData = await prisma.cpiData.findMany({
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  return NextResponse.json({
    data: cpiData.map((c) => ({
      year: c.year,
      month: c.month,
      value: c.value,
    })),
  });
}
```

- [ ] **Step 5: Create trending API route**

Create `src/app/api/trending/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { subDays } from "date-fns";

export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);

  // Get products with biggest price change in last 30 days
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

  // Get latest CPI
  const latestCpi = await prisma.cpiData.findFirst({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Count products
  const productCount = await prisma.product.count();

  return NextResponse.json({
    trending: recentPrices.map((p) => ({
      ean: p.ean,
      name: p.name,
      brand: p.brand,
      imageUrl: p.image_url,
      currentPrice: p.current_price,
      oldPrice: p.old_price,
      change: p.change,
    })),
    stats: {
      latestCpi: latestCpi ? { year: latestCpi.year, month: latestCpi.month, value: latestCpi.value } : null,
      productCount,
    },
  });
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/
git commit -m "feat: add API routes for search, product, prices, CPI, trending"
```

---

## Task 6: Cron Jobs

**Files:**
- Create: `src/app/api/cron/fetch-prices/route.ts`, `src/app/api/cron/fetch-cpi/route.ts`

- [ ] **Step 1: Create price fetching cron**

Create `src/app/api/cron/fetch-prices/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPricesBulk } from "@/lib/kassal";
import { normalizeChain } from "@/lib/chains";

export async function POST(request: NextRequest) {
  // Verify Vercel Cron secret
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({ select: { id: true, ean: true } });
  const eans = products.map((p) => p.ean);
  const eanToId = Object.fromEntries(products.map((p) => [p.ean, p.id]));

  let totalSaved = 0;
  // Process in batches of 100
  for (let i = 0; i < eans.length; i += 100) {
    const batch = eans.slice(i, i + 100);
    try {
      const result = await getPricesBulk(batch);
      for (const item of result.data) {
        const productId = eanToId[item.ean];
        if (!productId) continue;

        for (const priceEntry of item.prices) {
          const chain = normalizeChain(priceEntry.store.name);
          const date = new Date(priceEntry.date);

          await prisma.price.upsert({
            where: {
              productId_chain_date: { productId, chain, date },
            },
            update: { price: priceEntry.price },
            create: { productId, chain, price: priceEntry.price, date },
          });
          totalSaved++;
        }
      }
    } catch (error) {
      console.error(`Batch ${i}-${i + 100} failed:`, error);
    }

    // Rate limit: 60 req/min, wait 1.1s between batch calls
    if (i + 100 < eans.length) {
      await new Promise((r) => setTimeout(r, 1100));
    }
  }

  return NextResponse.json({ success: true, productsFetched: products.length, pricesSaved: totalSaved });
}
```

- [ ] **Step 2: Create CPI fetching cron**

Create `src/app/api/cron/fetch-cpi/route.ts`:

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/cron/
git commit -m "feat: add cron jobs for daily price fetching and monthly CPI update"
```

---

## Task 7: Shared UI Components

**Files:**
- Create: `src/components/nav.tsx`, `src/components/search-bar.tsx`, `src/components/stat-card.tsx`, `src/components/product-card.tsx`, `src/components/store-prices.tsx`, `src/components/trending-list.tsx`, `src/app/layout.tsx`

- [ ] **Step 1: Create nav component**

Create `src/components/nav.tsx`:

```tsx
import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white">
          HvaKosta.no
        </Link>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Hjem
          </Link>
          <Link href="/inflasjon" className="hover:text-white transition-colors">
            Inflasjon
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create search bar component**

Create `src/components/search-bar.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/sok?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-gray-500">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk etter et produkt..."
          className="bg-transparent flex-1 text-white placeholder-gray-500 outline-none text-sm"
        />
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Create stat card component**

Create `src/components/stat-card.tsx`:

```tsx
interface StatCardProps {
  label: string;
  value: string;
  color?: "red" | "green" | "white";
}

export function StatCard({ label, value, color = "white" }: StatCardProps) {
  const colorClass = {
    red: "text-red-500",
    green: "text-green-500",
    white: "text-white",
  }[color];

  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold mt-1 ${colorClass}`}>{value}</div>
    </div>
  );
}
```

- [ ] **Step 4: Create product card component**

Create `src/components/product-card.tsx`:

```tsx
import Link from "next/link";

interface ProductCardProps {
  ean: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  chain: string | null;
}

export function ProductCard({ ean, name, brand, imageUrl, currentPrice, chain }: ProductCardProps) {
  return (
    <Link
      href={`/produkt/${ean}`}
      className="bg-surface border border-border rounded-xl p-4 hover:border-gray-600 transition-colors block"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-surface-hover rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl">📦</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {brand && <div className="text-xs text-gray-500 uppercase">{brand}</div>}
          <div className="text-white font-medium text-sm truncate">{name}</div>
          <div className="flex items-baseline gap-2 mt-1">
            {currentPrice != null && (
              <span className="text-white font-bold">{currentPrice.toFixed(2)} kr</span>
            )}
            {chain && <span className="text-xs text-gray-500">{chain}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Create store prices component**

Create `src/components/store-prices.tsx`:

```tsx
interface StorePrice {
  chain: string;
  price: number;
  date: string;
}

const CHAIN_COLORS: Record<string, string> = {
  Kiwi: "bg-green-500",
  Meny: "bg-purple-500",
  "Rema 1000": "bg-blue-500",
  Spar: "bg-yellow-500",
  Joker: "bg-orange-500",
  Oda: "bg-cyan-500",
  Bunnpris: "bg-red-500",
  "Coop Extra": "bg-pink-500",
  "Coop Mega": "bg-pink-600",
  "Coop Obs": "bg-pink-700",
  "Coop Prix": "bg-pink-400",
};

export function StorePrices({ prices }: { prices: StorePrice[] }) {
  const sorted = [...prices].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0]?.price;

  return (
    <div className="bg-surface rounded-xl p-5">
      <h3 className="text-white font-semibold mb-3">Pris i butikker nå</h3>
      <div className="flex flex-col gap-2">
        {sorted.map((p) => (
          <div
            key={p.chain}
            className="flex items-center justify-between bg-surface-hover px-3 py-2.5 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white ${CHAIN_COLORS[p.chain] || "bg-gray-500"}`}
              >
                {p.chain[0]}
              </div>
              <span className="text-gray-300 text-sm">{p.chain}</span>
            </div>
            <span
              className={`text-base font-semibold ${p.price === cheapest ? "text-green-500" : "text-white"}`}
            >
              {p.price.toFixed(2)} kr
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create trending list component**

Create `src/components/trending-list.tsx`:

```tsx
import Link from "next/link";

interface TrendingItem {
  ean: string;
  name: string;
  change: number;
}

export function TrendingList({ items }: { items: TrendingItem[] }) {
  return (
    <div className="bg-surface rounded-xl p-5">
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
        Prisendringer siste 30 dager
      </h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <Link
            key={item.ean}
            href={`/produkt/${item.ean}`}
            className="flex items-center justify-between text-sm hover:bg-surface-hover px-2 py-1.5 rounded-md transition-colors"
          >
            <span className="text-gray-300">{item.name}</span>
            <span className={item.change > 0 ? "text-red-500" : "text-green-500"}>
              {item.change > 0 ? "+" : ""}
              {item.change.toFixed(2)} kr
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HvaKosta.no — Prissporing for dagligvarer",
  description: "Se hva ting koster — og hva de kostet før. Sammenlign matpriser mot inflasjon.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" className="dark">
      <body className={`${inter.className} bg-background text-white min-h-screen`}>
        <Nav />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/components/ src/app/layout.tsx
git commit -m "feat: add shared UI components — nav, search, stat card, product card, store prices, trending"
```

---

## Task 8: Price Chart Component

**Files:**
- Create: `src/components/price-chart.tsx`

- [ ] **Step 1: Create the price chart with Recharts**

Create `src/components/price-chart.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";

interface PricePoint {
  chain: string;
  price: number;
  date: string;
}

interface CpiPoint {
  year: number;
  month: number;
  price: number;
}

interface PriceChartProps {
  ean: string;
  initialPeriod?: string;
}

const PERIODS = [
  { key: "1m", label: "1M" },
  { key: "6m", label: "6M" },
  { key: "1y", label: "1Å" },
  { key: "max", label: "Maks" },
];

export function PriceChart({ ean, initialPeriod = "1y" }: PriceChartProps) {
  const [period, setPeriod] = useState(initialPeriod);
  const [data, setData] = useState<{ prices: PricePoint[]; cpiLine: CpiPoint[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchData(p: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${ean}/prices?period=${p}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchData(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePeriodChange(p: string) {
    setPeriod(p);
    fetchData(p);
  }

  if (!data || loading) {
    return (
      <div className="bg-surface rounded-xl p-5 h-80 flex items-center justify-center">
        <span className="text-gray-500">Laster prishistorikk...</span>
      </div>
    );
  }

  // Merge price data and CPI into chart-friendly format, grouped by date
  const chartMap = new Map<string, { date: string; price: number | null; kpi: number | null }>();

  for (const p of data.prices) {
    const dateKey = typeof p.date === "string" ? p.date.slice(0, 10) : format(new Date(p.date), "yyyy-MM-dd");
    if (!chartMap.has(dateKey) || (chartMap.get(dateKey)!.price ?? 0) < p.price) {
      chartMap.set(dateKey, { date: dateKey, price: Number(p.price), kpi: chartMap.get(dateKey)?.kpi ?? null });
    }
  }

  for (const c of data.cpiLine) {
    const dateKey = `${c.year}-${String(c.month).padStart(2, "0")}-15`;
    const existing = chartMap.get(dateKey);
    if (existing) {
      existing.kpi = c.price;
    } else {
      chartMap.set(dateKey, { date: dateKey, price: null, kpi: c.price });
    }
  }

  const chartData = Array.from(chartMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="bg-surface rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Prishistorikk</h3>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePeriodChange(p.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                period === p.key
                  ? "bg-blue-500 text-white"
                  : "bg-surface-hover text-gray-500 hover:text-gray-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            tick={{ fill: "#555", fontSize: 11 }}
            tickFormatter={(d) => format(parseISO(d), "MMM yy", { locale: nb })}
            axisLine={{ stroke: "#1a1a1a" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#555", fontSize: 11 }}
            tickFormatter={(v) => `${v} kr`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "#fff" }}
            labelFormatter={(d) => format(parseISO(d as string), "d. MMMM yyyy", { locale: nb })}
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)} kr`,
              name === "price" ? "Pris" : "KPI-justert",
            ]}
          />
          <Legend
            formatter={(value) => (value === "price" ? "Pris" : "KPI-justert")}
            wrapperStyle={{ color: "#888", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="kpi"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/price-chart.tsx
git commit -m "feat: add interactive price chart component with KPI overlay"
```

---

## Task 9: Pages — Homepage, Search, Product, Inflation

**Files:**
- Create: `src/app/page.tsx`, `src/app/sok/page.tsx`, `src/app/produkt/[ean]/page.tsx`, `src/app/inflasjon/page.tsx`

- [ ] **Step 1: Create dashboard homepage**

Create `src/app/page.tsx`:

```tsx
import { SearchBar } from "@/components/search-bar";
import { StatCard } from "@/components/stat-card";
import { TrendingList } from "@/components/trending-list";

async function getTrending() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/trending`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const trendingData = await getTrending();

  return (
    <div className="space-y-6">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-3xl font-bold mb-2">HvaKosta.no</h1>
        <p className="text-gray-500 text-sm mb-6">
          Se hva ting koster — og hva de kostet før
        </p>
        <div className="max-w-lg mx-auto">
          <SearchBar />
        </div>
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {["Grandiosa", "Melk", "Kvikk Lunsj", "Norvegia", "Smør"].map((term) => (
            <a
              key={term}
              href={`/sok?q=${encodeURIComponent(term)}`}
              className="bg-surface-hover border border-border px-3 py-1.5 rounded-full text-xs text-gray-400 hover:text-white transition-colors"
            >
              {term}
            </a>
          ))}
        </div>
      </div>

      {trendingData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="KPI siste måned"
              value={
                trendingData.stats.latestCpi
                  ? `${Number(trendingData.stats.latestCpi.value).toFixed(1)}`
                  : "—"
              }
              color="red"
            />
            <StatCard
              label="Mest økt (30d)"
              value={
                trendingData.trending[0]
                  ? `${trendingData.trending[0].name} +${trendingData.trending[0].change.toFixed(0)} kr`
                  : "—"
              }
            />
            <StatCard
              label="Produkter"
              value={trendingData.stats.productCount.toLocaleString("no-NO")}
              color="green"
            />
          </div>
          <TrendingList items={trendingData.trending} />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create search results page**

Create `src/app/sok/page.tsx`:

```tsx
import { SearchBar } from "@/components/search-bar";
import { ProductCard } from "@/components/product-card";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1");

  if (!query) {
    return (
      <div className="pt-8">
        <SearchBar />
        <p className="text-gray-500 text-center mt-8">Skriv inn et produktnavn for å søke.</p>
      </div>
    );
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=20`,
    { cache: "no-store" }
  );
  const data = await res.json();

  return (
    <div className="space-y-6">
      <SearchBar defaultValue={query} />
      <p className="text-sm text-gray-500">
        Søkeresultater for &ldquo;{query}&rdquo;
      </p>
      {data.products.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Ingen produkter funnet for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.products.map((p: any) => (
            <ProductCard key={p.ean} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create product detail page**

Create `src/app/produkt/[ean]/page.tsx`:

```tsx
import { PriceChart } from "@/components/price-chart";
import { StorePrices } from "@/components/store-prices";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ ean: string }>;
}

async function getProduct(ean: string) {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products/${ean}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { ean } = await params;
  const product = await getProduct(ean);

  if (!product) notFound();

  const cheapest = product.latestPrices.length > 0
    ? Math.min(...product.latestPrices.map((p: any) => Number(p.price)))
    : null;

  return (
    <div className="space-y-6">
      {/* Product header */}
      <div className="flex gap-6">
        <div className="w-28 h-28 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-4xl">📦</span>
          )}
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">
            {[product.vendor, product.brand].filter(Boolean).join(" / ")}
          </div>
          <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          {cheapest != null && (
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-2xl font-bold text-white">
                {cheapest.toFixed(2)} kr
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Price chart */}
      <PriceChart ean={ean} />

      {/* Store prices */}
      {product.latestPrices.length > 0 && (
        <StorePrices
          prices={product.latestPrices.map((p: any) => ({
            chain: p.chain,
            price: Number(p.price),
            date: p.date,
          }))}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create inflation overview page**

Create `src/app/inflasjon/page.tsx`:

```tsx
import { prisma } from "@/lib/db";

export default async function InflationPage() {
  const cpiData = await prisma.cpiData.findMany({
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inflasjon i Norge</h1>
      <p className="text-gray-500 text-sm">
        Konsumprisindeksen (KPI) fra SSB — viser generell prisutvikling over tid.
      </p>

      <div className="bg-surface rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">KPI-utvikling</h3>
        {cpiData.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            Ingen KPI-data tilgjengelig ennå. Kjør CPI cron-jobben for å hente data.
          </p>
        ) : (
          <div className="text-gray-400 text-sm">
            <p>Siste KPI: {Number(cpiData[cpiData.length - 1].value).toFixed(1)} ({cpiData[cpiData.length - 1].year}-{String(cpiData[cpiData.length - 1].month).padStart(2, "0")})</p>
            <p className="mt-1 text-gray-600">Fullstendig graf kommer snart.</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "feat: add all pages — homepage, search, product detail, inflation overview"
```

---

## Task 10: Seed Script & Final Polish

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

- [ ] **Step 1: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { fetchCpiData } from "../src/lib/ssb";
import { searchProducts, getPricesBulk } from "../src/lib/kassal";
import { normalizeChain } from "../src/lib/chains";

const prisma = new PrismaClient();

const SEED_QUERIES = ["melk", "brød", "ost", "pizza", "kjøtt", "fisk", "yoghurt", "juice", "smør", "egg"];

async function seedProducts() {
  console.log("Seeding products from Kassalapp...");
  let totalProducts = 0;
  const allEans: string[] = [];

  for (const query of SEED_QUERIES) {
    try {
      const result = await searchProducts(query, 1, 50);
      for (const kp of result.data) {
        if (!kp.ean) continue;
        await prisma.product.upsert({
          where: { ean: kp.ean },
          update: { name: kp.name, brand: kp.brand, vendor: kp.vendor, imageUrl: kp.image },
          create: { ean: kp.ean, name: kp.name, brand: kp.brand, vendor: kp.vendor, imageUrl: kp.image },
        });
        allEans.push(kp.ean);
        totalProducts++;
      }
      // Rate limit
      await new Promise((r) => setTimeout(r, 1100));
    } catch (e) {
      console.error(`Failed to seed "${query}":`, e);
    }
  }
  console.log(`Seeded ${totalProducts} products.`);

  // Fetch price history in bulk
  console.log("Fetching price history...");
  const products = await prisma.product.findMany({ select: { id: true, ean: true } });
  const eanToId = Object.fromEntries(products.map((p) => [p.ean, p.id]));
  let priceCount = 0;

  for (let i = 0; i < allEans.length; i += 100) {
    const batch = allEans.slice(i, i + 100);
    try {
      const result = await getPricesBulk(batch, 90);
      for (const item of result.data) {
        const productId = eanToId[item.ean];
        if (!productId) continue;
        for (const pe of item.prices) {
          const chain = normalizeChain(pe.store.name);
          await prisma.price.upsert({
            where: { productId_chain_date: { productId, chain, date: new Date(pe.date) } },
            update: { price: pe.price },
            create: { productId, chain, price: pe.price, date: new Date(pe.date) },
          });
          priceCount++;
        }
      }
      await new Promise((r) => setTimeout(r, 1100));
    } catch (e) {
      console.error(`Price batch failed:`, e);
    }
  }
  console.log(`Seeded ${priceCount} price entries.`);
}

async function seedCpi() {
  console.log("Seeding CPI data from SSB...");
  const cpiData = await fetchCpiData(2020);
  let cpiCount = 0;
  for (const entry of cpiData) {
    await prisma.cpiData.upsert({
      where: { year_month: { year: entry.year, month: entry.month } },
      update: { value: entry.value },
      create: { year: entry.year, month: entry.month, value: entry.value },
    });
    cpiCount++;
  }
  console.log(`Seeded ${cpiCount} CPI entries.`);
}

async function main() {
  await seedProducts();
  await seedCpi();
  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add seed config to package.json**

Add to `package.json`:

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

And add `tsx` as a dev dependency:

```bash
npm install -D tsx
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```

- [ ] **Step 4: Test the full app locally**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Homepage loads with search bar and stat cards
- Search works (tries Kassalapp API for fresh products)
- Product pages show price chart
- Inflation page shows CPI data

**Note:** `/kategori/[slug]` page is deferred from MVP. Kassalapp API does not currently provide category data, so this page would have limited value until we build our own category taxonomy.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: add seed script, finalize HvaKosta MVP"
```
