# Conectra Frontend Prototype

React + Vite frontend prototype prepared to connect with a Strapi backend.

## Implemented Prototype Scope

- Login page using Strapi local auth (`/api/auth/local`)
- Logout action with token cleanup
- Protected `Users` index page (`/api/users`)
- Protected `Activities` index page (`/api/activities` by default)
- Basic folder architecture for modular growth

## Folder Structure

```text
src/
  api/                 # HTTP client and Strapi API modules
  app/                 # top-level app composition and routing
  components/          # reusable UI and routing components
  features/auth/       # auth context and hooks
  layouts/             # authenticated shell/layout
  pages/               # route pages
  styles/              # global styles
  utils/               # Strapi normalization helpers
```

## Environment Variables

Create a local `.env` file from `.env.example`.

- `VITE_STRAPI_URL`: Strapi base URL
- `VITE_STRAPI_AUTH_ENDPOINT`: auth endpoint (default `/api/auth/local`)
- `VITE_STRAPI_USERS_ENDPOINT`: users endpoint (default `/api/users`)
- `VITE_STRAPI_ACTIVITIES_ENDPOINT`: activities endpoint (default `/api/activities`)

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Strapi Configuration Notes

For this prototype to work, Strapi must allow:

- `auth/local` login
- authenticated access to `/api/users` (or custom users endpoint)
- access to the configured activities endpoint

If your content type uses another route, set `VITE_STRAPI_ACTIVITIES_ENDPOINT` accordingly.
