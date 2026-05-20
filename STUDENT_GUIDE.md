# ConnectTroca Frontend - Student Guide (Docker Required)

## Objective

Run the frontend reproducibly using Docker and validate integration with the updated backend access model.

## 1) First run on a new computer

```powershell
cd "C:\Users\vasil\Documents\Aulas\projeto integrado 2\frontend_conectra"
Copy-Item .env.example .env
docker compose up --build -d
```

Open:

- `http://localhost:5173`

## 2) Backend required for local integration

Start backend in parallel from the backend repository:

```powershell
cd "C:\Users\vasil\Documents\Aulas\projeto integrado 2\backend_conectra\connectroca-back-end-system"
Copy-Item .env.example .env   # first run only
docker compose up --build -d
```

Check backend:

- `http://localhost:1337/api/health`
- `http://localhost:1337/documentation`

## 3) Switch backend target (single change)

Edit `.env`:

- `VITE_BACKEND_TARGET=local` -> frontend localhost (Docker) + backend localhost Strapi
- `VITE_BACKEND_TARGET=development` -> frontend localhost (Docker) + backend Heroku development Strapi

Keep this empty unless you need hard override:

- `VITE_STRAPI_URL=`

After changing `.env`, restart frontend:

```powershell
docker compose up --build -d
```

## 4) Quick validation

1. Check container status:

```powershell
docker compose ps
```

2. Open `/login`.
3. Verify header API base URL.
4. Login and open dashboard/forum/materials.
5. Confirm protected data is scoped to logged-in user.

## 5) Daily commands

Logs:

```powershell
docker compose logs -f frontend
```

Stop:

```powershell
docker compose down
```

Rebuild/start:

```powershell
docker compose up --build -d
```

## 6) Common issues

- API errors: check `VITE_BACKEND_TARGET` and `VITE_STRAPI_URL`.
- Backend not ready: verify `http://localhost:1337/api/health` returns `200`.
- Auth/visibility mismatches: ensure backend branch with relation fixes is running.
- 404 on deployed routes: verify `vercel.json` rewrite to `/index.html`.

## 7) Config location

- Runtime resolution logic: `src/config/runtimeConfig.js`
- Deployment env checklist: `DEPLOYMENT_ENVIRONMENT.md`
- Vercel template: `.env.vercel.example`
