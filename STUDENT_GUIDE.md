# ConnectTroca Frontend - Student Guide

## Objective

Run the frontend in a reproducible way and switch backend target with one variable.

## 1. First run on a new computer

```powershell
cd "C:\Users\vasil\Documents\Aulas\projeto integrado 2\frontend_conectra"
Copy-Item .env.example .env
npm ci
```

## 2. Start frontend (localhost)

```powershell
npm run dev
```

Open: `http://localhost:5173`

## 3. Switch backend target (single change)

Edit `.env`:

- `VITE_BACKEND_TARGET=local` -> frontend localhost + backend localhost
- `VITE_BACKEND_TARGET=development` -> frontend localhost + backend Heroku development

Keep this empty unless you need a hard override:

- `VITE_STRAPI_URL=`

Restart `npm run dev` after changing `.env`.

## 4. Required backend URLs

- Local backend: `http://localhost:1337`
- Development backend (Heroku):
  `https://connectra-backend-system-f4a977a741b9.herokuapp.com`

## 5. Quick validation

1. Open `/login`.
2. Check header API base URL.
3. Login and open dashboard/forum/materials.

## 6. Build check (must pass)

```powershell
npm run build
```

## 7. Docker mode (optional)

```powershell
docker compose up --build -d
```

Stop:

```powershell
docker compose down
```

## 8. Common issues

- API errors: verify `VITE_BACKEND_TARGET` and `VITE_STRAPI_URL`.
- 404 on deployed routes: verify `vercel.json` rewrite to `/index.html`.
- Auth failures: check Strapi permissions for Users/Auth routes.

## 9. Where configuration lives

- Runtime resolution logic: `src/config/runtimeConfig.js`
- Deployment env checklist: `DEPLOYMENT_ENVIRONMENT.md`
- Vercel template: `.env.vercel.example`
