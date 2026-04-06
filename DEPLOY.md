# Billigst — Deployment Guide

## Current Status
- ✅ Turso database created and seeded (134 products, 62 236 prices)
- ✅ Schema pushed to Turso
- ✅ `db.turso.ts` ready for production
- ✅ Build passing

## Deploy to Vercel (5 minutes)

### Step 1: Switch to Turso database
```bash
# Replace the local SQLite db.ts with the Turso version
cp src/lib/db.turso.ts src/lib/db.ts
```

### Step 2: Deploy
```bash
npm i -g vercel
vercel
```

### Step 3: Set environment variables
In Vercel dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://billigst-endreli.aws-eu-west-1.turso.io` |
| `TURSO_AUTH_TOKEN` | *(your token)* |
| `KASSAL_API_KEY` | *(your Kassalapp key)* |
| `CRON_SECRET` | *(generate a random string)* |

### Step 4: Redeploy
```bash
vercel --prod
```

### Step 5: Set up custom domain
```bash
vercel domains add billigst.no
```

## Sync Local Data to Turso
When you update local seed data:
```bash
npx tsx prisma/seed-turso.ts
```

## Monthly Costs
| Service | Cost |
|---------|------|
| Vercel Free | 0 kr |
| Turso Free (9 GB, 25M reads) | 0 kr |
| Kassalapp Premium (optional) | 750 kr/mnd |
| Domain (.app) | ~150 kr/år |
| **Minimum total** | **~13 kr/mnd** |
| **With Kassalapp Premium** | **~763 kr/mnd** |

## Android App (Google Play Store)

### Prerequisites
- Android Studio installed (free, works on Windows/Mac/Linux)
- Google Play Developer account ($25 one-time)

### Step 1: Switch to Turso database
```bash
cp src/lib/db.turso.ts src/lib/db.ts
```

### Step 2: Add Android platform
```bash
npx cap add android
npx cap sync
```

### Step 3: Open in Android Studio
```bash
npx cap open android
```

### Step 4: Generate app icons
In Android Studio:
1. Right-click `app/src/main/res` → New → Image Asset
2. Use your 512x512 icon from `public/icons/icon-512.png`
3. Configure foreground + background layers
4. Generate all density variants

### Step 5: Build signed AAB
1. Build → Generate Signed Bundle / APK
2. Create a new keystore (save it securely — you need it for every update!)
3. Choose "Android App Bundle (.aab)"
4. Build release variant

### Step 6: Upload to Google Play Console
1. Go to play.google.com/console
2. Create app → fill in details:
   - App name: **Billigst**
   - Default language: **Norwegian Bokmål**
   - App category: **Shopping**
3. Upload the `.aab` file
4. Fill in store listing:
   - Short description: "Sammenlign dagligvarepriser og finn den billigste handlekurven"
   - Full description: Detailed description of features
   - Screenshots: At least 2 phone screenshots
   - Feature graphic: 1024x500px
5. Privacy policy URL: `https://billigst.no/personvern`
6. Submit for review (1-7 days)

### App Store Listing Checklist
- [ ] App icon (512x512 PNG, no transparency)
- [ ] Feature graphic (1024x500)
- [ ] At least 2 phone screenshots (min 320px, max 3840px)
- [ ] Short description (max 80 chars)
- [ ] Full description (max 4000 chars)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire completed

### Costs
| Item | Cost |
|------|------|
| Google Play Developer | $25 (one-time) |
| Android Studio | Free |

## iOS App (Optional — requires Mac)
```bash
npx cap add ios      # Requires Mac + Xcode
npx cap sync
npx cap open ios
```
Apple Developer: 99 USD/year
