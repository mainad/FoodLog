# QuickFood MVP

This is a mobile-first Next.js app (Tailwind) to log foods quickly using USDA FoodData Central,
with browser-only voice input that auto-splits a single spoken line into multiple food entries.

## Features
- Browser SpeechRecognition (no cloud speech required)
- Auto-split voice entries like: "one banana, two cups oat milk, thirty grams almonds"
- USDA FoodData Central search & details proxied via Next.js API routes (keeps API key secret)
- LocalStorage persistence (no account required)
- Goal wizard (onboarding) to compute daily calorie/macro targets
- Horizontal progress bars vs goals
- Delete any entry
- History chart (last 14 days)

## Setup (locally)
1. Install dependencies:
```bash
npm install
```
2. Add your FoodData Central API key:
Create a `.env.local` file at the project root with:
```
FDC_API_KEY=YOUR_KEY_HERE
```
3. Run locally:
```
npm run dev
```

## Deploy to Vercel
1. Push this repo to GitHub.
2. On Vercel, import the GitHub repo.
3. In Project Settings → Environment Variables, add `FDC_API_KEY`.
4. Deploy.

Notes:
- Speech recognition works best on Chrome/Edge/Android browsers. iOS Safari currently does not support the Web Speech API.
- This is an MVP — nutrient-scaling logic uses USDA food details heuristics; you can improve handling for branded products and labelNutrients.

