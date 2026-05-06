# Deployment Environment Variables (Vercel)

This file is the single source of truth for frontend environment configuration.

## Vercel required configuration

Set these in Vercel Project Settings -> Environment Variables for both `Production` and `Preview`:

| Variable | Required | Example | Notes |
|---|---|---|---|
| `VITE_BACKEND_TARGET` | Yes | `development` | Main switch for backend resolution in deployed frontend. |
| `VITE_STRAPI_URL_DEVELOPMENT` | Yes | `https://connectra-backend-system-f4a977a741b9.herokuapp.com` | Heroku development Strapi base URL. |
| `VITE_RUNTIME_MODE` | No | `develop` | Legacy compatibility alias. |
| `VITE_STRAPI_URL` | No | `https://connectra-backend-system-f4a977a741b9.herokuapp.com` | Optional explicit override of backend API URL. |
| `VITE_STRAPI_AUTH_ENDPOINT` | Yes | `/api/auth/local` | Auth endpoint path. |
| `VITE_STRAPI_REGISTER_ENDPOINT` | Yes | `/api/auth/local/register` | Register endpoint path. |
| `VITE_STRAPI_FORGOT_PASSWORD_ENDPOINT` | Yes | `/api/auth/forgot-password` | Forgot-password endpoint path. |
| `VITE_STRAPI_USERS_ENDPOINT` | Yes | `/api/users` | Users endpoint path. |
| `VITE_STRAPI_PROFILES_ENDPOINT` | Yes | `/api/profiles` | Collection endpoint path. |
| `VITE_STRAPI_AREAS_ENDPOINT` | Yes | `/api/areas` | Collection endpoint path. |
| `VITE_STRAPI_GROUPS_ENDPOINT` | Yes | `/api/groups` | Collection endpoint path. |
| `VITE_STRAPI_GROUP_MEMBERS_ENDPOINT` | Yes | `/api/group-members` | Collection endpoint path. |
| `VITE_STRAPI_USER_AREAS_ENDPOINT` | Yes | `/api/user-areas` | Collection endpoint path. |
| `VITE_STRAPI_MATERIALS_ENDPOINT` | Yes | `/api/materials` | Collection endpoint path. |
| `VITE_STRAPI_TOPICS_ENDPOINT` | Yes | `/api/topics` | Collection endpoint path. |
| `VITE_STRAPI_POSTS_ENDPOINT` | Yes | `/api/posts` | Collection endpoint path. |
| `VITE_STRAPI_COMMENTS_ENDPOINT` | Yes | `/api/comments` | Collection endpoint path. |
| `VITE_STRAPI_LIKES_ENDPOINT` | Yes | `/api/likes` | Collection endpoint path. |
| `VITE_STRAPI_ACTIVITIES_ENDPOINT` | Yes | `/api/topics` | Legacy compatibility endpoint. |

## Vercel optional configuration

| Variable | Required | Example | Notes |
|---|---|---|---|
| `VITE_STRAPI_URL_LOCAL` | No | `http://localhost:1337` | Used when running frontend locally in `local` mode. |
| `VITE_STRAPI_URL_DEVELOP` | No | `https://connectra-backend-system-f4a977a741b9.herokuapp.com` | Legacy alias for development URL. |

## Local profiles

- Full local: use `.env.example`
- Local frontend -> develop backend: use `.env.develop.example`
- Deployed Vercel frontend: use `.env.vercel.example`

## Student local runtime

Students must run the frontend through Docker (`docker compose up --build -d`) and not through host `npm run dev`.

## Resolution order in code

1. `VITE_STRAPI_URL`
2. `VITE_BACKEND_TARGET` (`local` or `development`)
3. `VITE_RUNTIME_MODE` (`local` or `develop`, legacy compatibility)
4. Hostname fallback (`localhost` => local backend; non-localhost => develop backend)

## GitHub Actions prerequisites (frontend repo)

Configure these repository secrets:

- `VERCEL_TOKEN`

Configure these repository variables:

- `VERCEL_PROJECT_ID`
- `VERCEL_ORG_ID`
- `VERCEL_TEAM_ID` (optional if org ID setup already works for your account scope)
- `VERCEL_STRAPI_URL`

Pipeline file: `.github/workflows/frontend-vercel-pipeline.yml`
Template source: `cloud/vercel.env.template`
