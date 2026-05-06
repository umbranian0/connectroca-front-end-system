# ConnectTroca Frontend - Reproducible Setup Guide

This frontend runs with React + Vite and connects to Strapi.

Student-first documentation:

- Main setup and workflow: `README.md` (this file)
- Student quick workflow: `STUDENT_GUIDE.md`
- Vercel environment checklist: `DEPLOYMENT_ENVIRONMENT.md`

## 1. Project scope

Frontend repository path:

- `frontend_conectra`

Main runtime behavior is centralized in:

- `src/config/runtimeConfig.js`

You only switch one variable to change backend target:

- `VITE_BACKEND_TARGET=local` (frontend localhost + backend localhost)
- `VITE_BACKEND_TARGET=development` (frontend localhost/Vercel + backend Heroku development)

## 2. Prerequisites

Required:

- Node.js 20.x (or later compatible with `package.json` engines)
- npm 10.x

Optional (recommended for containerized run):

- Docker Desktop

Backend prerequisites:

- Local Strapi available at `http://localhost:1337` for local mode
- Heroku development Strapi available at:
  `https://connectra-backend-system-f4a977a741b9.herokuapp.com`

## 3. First-time setup (same for every student)

```powershell
cd "C:\Users\vasil\Documents\Aulas\projeto integrado 2\frontend_conectra"
Copy-Item .env.example .env
npm ci
```

## 4. Run locally (frontend localhost + backend localhost)

1. Ensure `.env` contains:
   - `VITE_BACKEND_TARGET=local`
   - `VITE_STRAPI_URL=` (empty)
2. Start frontend:

```powershell
npm run dev
```

3. Open:
   - `http://localhost:5173`

## 5. Run locally with Heroku development backend

1. Change only one line in `.env`:
   - `VITE_BACKEND_TARGET=development`
2. Keep:
   - `VITE_STRAPI_URL=` (empty)
3. Restart frontend:

```powershell
npm run dev
```

This mode keeps frontend on localhost and points API calls to Heroku development Strapi.

## 6. Docker workflow (optional)

```powershell
docker compose up --build -d
```

Open:

- `http://localhost:5173`

Stop:

```powershell
docker compose down
```

Logs:

```powershell
docker compose logs -f frontend
```

## 7. Frontend deployment on Vercel (development backend)

Use `.env.vercel.example` as template in Vercel Project Settings -> Environment Variables.

Minimum required deployment values:

- `VITE_BACKEND_TARGET=development`
- `VITE_STRAPI_URL_DEVELOPMENT=https://connectra-backend-system-f4a977a741b9.herokuapp.com`
- `VITE_STRAPI_URL=` (empty, unless explicit override is needed)

Build/output:

- Build command: `npm run build`
- Output directory: `dist`

## 8. Reproducibility checklist

After setup, every student should verify:

1. `npm ci` completes without errors.
2. `npm run build` succeeds.
3. Login page loads at `/login`.
4. API base shown in header matches expected target (`localhost:1337` or Heroku URL).
5. Dashboard/forum/materials render data when backend permissions are correct.

## 9. Troubleshooting

- If API calls fail, check `.env` values:
  - `VITE_BACKEND_TARGET`
  - `VITE_STRAPI_URL` (should usually be empty)
- If routes fail in deploy, verify `vercel.json` SPA rewrite to `/index.html`.
- If auth fails, validate Strapi permissions for auth/users routes.
- If stale config persists, stop dev server and run again.

## 10. Related files

- Runtime config: `src/config/runtimeConfig.js`
- Local env template: `.env.example`
- Local -> Heroku dev template: `.env.develop.example`
- Vercel template: `.env.vercel.example`
