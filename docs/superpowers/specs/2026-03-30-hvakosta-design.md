# HvaKosta.no — Design Spec

## Overview

HvaKosta.no er en norsk nettside for å tracke matpriser over tid og sammenligne prisutvikling mot inflasjon (KPI). Brukere kan søke etter dagligvareprodukter, se prishistorikk, og forstå hvordan priser utvikler seg sammenlignet med generell inflasjon.

Ingen innlogging — ren "søk og se"-opplevelse.

## Tech Stack

- **Framework:** Next.js 14+ med App Router, TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Vercel Postgres eller Supabase)
- **Grafer:** Recharts for prishistorikk
- **Hosting:** Vercel
- **Datakilder:** Kassalapp API + SSB API (KPI)

## Datakilder

### Kassalapp API (kassal.app)
- Gratis hobby-tier, 60 req/min
- Bearer token auth (API-nøkkel fra kassal.app/profil/api)
- Dekker: Norgesgruppen (Meny, Kiwi, Joker, Spar), Oda, Bunnpris, Havaristen, Holdbart.no, Engrosnett.no
- Endepunkter vi bruker:
  - `GET /api/v1/products` — søk med fuzzy matching, filtrering på leverandør/merke
  - `GET /api/v1/products/ean/{ean}` — oppslag på EAN
  - `POST /api/v1/products/prices-bulk` — prishistorikk for opptil 100 EAN, 30-90 dager
  - `GET /api/v1/physical-stores` — butikkliste med kjede-filtrering
- **Viktig begrensning:** Prishistorikk fra API går kun 30-90 dager tilbake. Vi lagrer priser daglig i egen database for å bygge opp lengre historikk over tid.

### SSB API (Statistisk Sentralbyrå)
- Gratis, åpent API
- Konsumprisindeks (KPI) — oppdateres månedlig
- Brukes som referanselinje i prisgrafer

## Database Schema

### products
| Kolonne    | Type         | Beskrivelse                    |
|------------|--------------|--------------------------------|
| id         | SERIAL PK    | Intern ID                      |
| ean        | VARCHAR(13)  | EAN-kode (unik)               |
| name       | TEXT         | Produktnavn                    |
| brand      | TEXT         | Merke (f.eks. Grandiosa)       |
| vendor     | TEXT         | Leverandør (f.eks. Orkla)      |
| image_url  | TEXT         | Produktbilde-URL               |
| category   | TEXT         | Kategori (om tilgjengelig)     |
| created_at | TIMESTAMPTZ  | Første gang registrert         |
| updated_at | TIMESTAMPTZ  | Sist oppdatert                 |

### prices
| Kolonne    | Type         | Beskrivelse                    |
|------------|--------------|--------------------------------|
| id         | SERIAL PK    | Intern ID                      |
| product_id | INT FK       | Referanse til products          |
| chain      | TEXT         | Normalisert kjedenavn (Kiwi, Meny, Rema 1000, etc.) |
| price      | DECIMAL(10,2)| Pris i NOK                     |
| date       | DATE         | Dato for prisregistrering      |
| created_at | TIMESTAMPTZ  | Tidspunkt for innhenting       |

**Unik constraint:** (product_id, chain, date) — én pris per produkt per kjede per dag.

Kjedenavn normaliseres ved innhenting: Kassalapp returnerer butikknavn som "Kiwi Majorstuen" — vi ekstraherer kjeden ("Kiwi") og lagrer kun den. Mapping: Kiwi, Meny, Joker, Spar, Oda, Bunnpris, Rema 1000, Coop.

### cpi_data
| Kolonne    | Type         | Beskrivelse                    |
|------------|--------------|--------------------------------|
| id         | SERIAL PK    | Intern ID                      |
| year       | INT          | År                             |
| month      | INT          | Måned (1-12)                   |
| value      | DECIMAL(10,2)| KPI-verdi                      |

**Unik constraint:** (year, month) — én KPI-verdi per måned.

### Indexes

- `products(ean)` — UNIQUE index for EAN-oppslag
- `products(name)` — GIN index med `tsvector` for full-text search
- `prices(product_id, date)` — for prishistorikk-queries
- `cpi_data(year, month)` — UNIQUE index

## Sidestruktur

### `/` — Forsiden (Dashboard-stil)
- Søkefelt i toppen
- KPI-stat-kort: gjeldende KPI, mest økte produkt (siste 30 dager), antall produkter i databasen
- Liste: "Prisøkninger denne uken" — produkter med størst prisendring
- Populære søk som chips

### `/sok?q={query}` — Søkeresultater
- Produktkort med bilde, navn, gjeldende pris, prisendring
- Filtrering på butikkjede
- Paginering

### `/produkt/[ean]` — Produktside
- Produktheader: bilde, navn, merke, leverandør, gjeldende pris
- Prisendring med KPI-sammenligning: "Produktet steg X%, KPI var Y%"
- Prisgraf (Recharts): blå linje = pris, oransje stiplet linje = KPI-justert referanse (starter på produktets tidligste pris og skaleres med månedlig KPI-endring relativt til startmåneden)
- Tidsperiode-velger: 1M, 6M, 1Å, Maks
- Butikkpriser: liste over gjeldende pris per butikkjede, billigst markert i grønt

### `/kategori/[slug]` — Kategoriside
- Produktliste for en kategori
- Gjennomsnittlig prisendring for kategorien vs KPI

### `/inflasjon` — Inflasjonsside
- Generell KPI-utvikling over tid (graf)
- Topp 10 produkter som har steget mest vs KPI
- Topp 10 produkter som har steget minst / gått ned

## Data Seeding og Cron-strategi

### Initial seeding
Ved oppstart kjøres et seed-script som:
1. Søker gjennom Kassalapp API med brede kategorisøk (paginated)
2. Lagrer alle produkter i `products`-tabellen
3. Henter prishistorikk via `prices-bulk` (100 EAN per kall) for alle seedede produkter
4. Henter historisk KPI-data fra SSB

### Daglig prisinnhenting
Cron-jobben henter priser for **alle produkter i databasen**. Med `prices-bulk` (100 EAN per kall) og 60 req/min:
- 6000 produkter = 60 kall = 1 minutt
- 60 000 produkter = 600 kall = 10 minutter
- Vercel Cron har 60s timeout på Hobby — vi deler opp i batches med flere cron-invocations om nødvendig

### Nye produkter
Når en bruker søker etter noe som ikke finnes i DB, proxy-er vi søket til Kassalapp API, lagrer produktet i DB, og starter prisinnhenting fra neste cron-kjøring.

## Dataflyt

1. **Daglig cron-jobb (Vercel Cron):**
   - Henter priser for alle produkter i DB via `prices-bulk`
   - Lagrer nye priser i `prices`-tabellen (INSERT ON CONFLICT DO NOTHING)
   - Oppdaterer `products`-tabellen med ny info
   - Rate limit: holder oss under 60 req/min
   - Autentisering: verifiserer `CRON_SECRET` header fra Vercel

2. **Månedlig KPI-oppdatering:**
   - Henter ny KPI-data fra SSB API
   - Lagrer i `cpi_data`-tabellen

3. **Brukerforespørsel:**
   - Søk: query mot `products`-tabellen (med full-text search)
   - Produktside: henter produkt + prishistorikk fra DB + KPI-data
   - Forsiden: henter siste prisendringer + KPI-stats fra DB

## Visuelt Design

- **Mørkt tema** (dark mode som standard)
- Dashboard-forside med stat-kort og trending
- Produktsider med prisgraf (blå pris, oransje KPI-linje)
- Butikkpriser med fargekodede kjede-ikoner
- Billigst pris markert i grønt
- Responsive design (mobil-først)

## API Routes (Next.js)

- `GET /api/products/search?q={query}&chain={chain}&page={1}&limit={20}` — søk i produkter (full-text search i egen DB, fallback til Kassalapp API for ukjente produkter)
- `GET /api/products/[ean]` — produktdetaljer med priser
- `GET /api/products/[ean]/prices?period={1m|6m|1y|max}` — prishistorikk
- `GET /api/cpi` — KPI-data
- `GET /api/trending` — siste prisendringer for forsiden
- `POST /api/cron/fetch-prices` — daglig prisinnhenting (Vercel Cron)
- `POST /api/cron/fetch-cpi` — månedlig KPI-innhenting

## Feilhåndtering

- Kassalapp API nede: vis cached data fra egen DB, vis "Priser kan være utdaterte"
- SSB API nede: bruk sist kjente KPI-verdi
- Produkt ikke funnet: vis søkeforslag
- Rate limit nådd: backoff og retry i cron-jobb

## Fremtidige muligheter (utenfor MVP)

- Prisvarsler (e-post når pris på favorittprodukt endres)
- Sammenligning av to produkter
- Handleliste med totalpris over tid
- PWA / mobilapp
