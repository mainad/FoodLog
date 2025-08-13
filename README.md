# QuickFood (Fixed)

Mobile-first Next.js app for ultra-fast food logging with USDA FoodData Central.
- Browser-only speech input (Web Speech API)
- Auto-split spoken entry by commas/“and”
- Inline **editable goals** in the top panel
- Correct calories/macros via robust USDA parsing
- Delete entries
- 14‑day history chart
- Tailwind styling

## Local Setup
1. Install deps
```bash
npm install
```
2. Add your USDA key
Create `.env.local` in the project root:
```
FDC_API_KEY=YOUR_USDA_FDC_API_KEY
```
3. Run
```
npm run dev
```

## Deploy to Vercel
1. Push to GitHub.
2. On Vercel, import repo and add env var `FDC_API_KEY` (Production & Preview).
3. Deploy.

## Notes
- Best in Chrome/Edge/Android; iOS Safari lacks Web Speech API.
- Some branded items report nutrients via `labelNutrients`; we handle that fallback.
