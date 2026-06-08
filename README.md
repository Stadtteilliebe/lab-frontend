# Lab Frontend

Clean Next.js / React setup for deployment on Vercel.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build check

```bash
npm run build
```

## Deploy on Vercel

1. Push this clean project to GitHub.
2. Import the repository in Vercel.
3. Framework preset: `Next.js`.
4. Build command: `npm run build`.
5. Output directory: leave empty / default.

## Important

Do not commit:

- `node_modules/`
- `.next/`
- `.vercel/`
- `public/model/`
- `.glb` / `.gltf` files

The previous GitHub error came from `node_modules/@next/swc-darwin-arm64/...`, which means `node_modules` was committed. This package is clean and excludes it.

If you reuse an existing repository with broken history, clean it first:

```bash
git filter-repo --path node_modules --invert-paths
git push --force origin main
```

Easiest option: create a fresh GitHub repo and push this clean folder.
