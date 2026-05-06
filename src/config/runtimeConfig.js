const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

const BACKEND_TARGET_LOCAL = 'local';
const BACKEND_TARGET_DEVELOPMENT = 'development';

const DEFAULT_STRAPI_URLS = Object.freeze({
  [BACKEND_TARGET_LOCAL]: 'http://localhost:1337',
  [BACKEND_TARGET_DEVELOPMENT]: 'https://connectra-backend-system-f4a977a741b9.herokuapp.com',
});

const DEFAULT_STRAPI_ENDPOINTS = Object.freeze({
  auth: '/api/auth/local',
  register: '/api/auth/local/register',
  forgotPassword: '/api/auth/forgot-password',
  users: '/api/users',
  profiles: '/api/profiles',
  areas: '/api/areas',
  groups: '/api/groups',
  groupMembers: '/api/group-members',
  userAreas: '/api/user-areas',
  materials: '/api/materials',
  topics: '/api/topics',
  posts: '/api/posts',
  comments: '/api/comments',
  likes: '/api/likes',
  activities: '/api/topics',
});

function readEnv(name, fallback = '') {
  const value = import.meta.env[name];

  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim();
}

function normalizeBackendTarget(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (['local', 'localhost'].includes(normalized)) {
    return BACKEND_TARGET_LOCAL;
  }

  if (['develop', 'development', 'dev', 'heroku'].includes(normalized)) {
    return BACKEND_TARGET_DEVELOPMENT;
  }

  return '';
}

function inferTargetFromHostname() {
  if (typeof window === 'undefined') {
    return BACKEND_TARGET_LOCAL;
  }

  return LOCAL_HOSTNAMES.has(window.location.hostname)
    ? BACKEND_TARGET_LOCAL
    : BACKEND_TARGET_DEVELOPMENT;
}

function resolveBackendTarget() {
  const explicitTarget = normalizeBackendTarget(readEnv('VITE_BACKEND_TARGET'));
  if (explicitTarget) {
    return explicitTarget;
  }

  const legacyRuntimeMode = normalizeBackendTarget(readEnv('VITE_RUNTIME_MODE'));
  if (legacyRuntimeMode) {
    return legacyRuntimeMode;
  }

  return inferTargetFromHostname();
}

function resolveLocalStrapiUrl() {
  return (
    readEnv('VITE_STRAPI_URL_LOCAL') ||
    DEFAULT_STRAPI_URLS[BACKEND_TARGET_LOCAL]
  );
}

function resolveDevelopmentStrapiUrl() {
  return (
    readEnv('VITE_STRAPI_URL_DEVELOPMENT') ||
    readEnv('VITE_STRAPI_URL_DEVELOP') ||
    DEFAULT_STRAPI_URLS[BACKEND_TARGET_DEVELOPMENT]
  );
}

function resolveDefaultStrapiUrl(target) {
  if (target === BACKEND_TARGET_DEVELOPMENT) {
    return resolveDevelopmentStrapiUrl();
  }

  return resolveLocalStrapiUrl();
}

function normalizeBrowserBaseUrl(rawBaseUrl) {
  const trimmedBaseUrl = String(rawBaseUrl ?? '').trim();
  if (!trimmedBaseUrl) {
    return '';
  }

  const strippedBaseUrl = trimmedBaseUrl.replace(/\/$/, '');

  if (typeof window === 'undefined') {
    return strippedBaseUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(strippedBaseUrl);
  } catch {
    return strippedBaseUrl;
  }

  const isLocalBrowser = LOCAL_HOSTNAMES.has(window.location.hostname);
  const usesDockerHostAlias = parsedUrl.hostname === 'host.docker.internal';

  if (isLocalBrowser && usesDockerHostAlias) {
    parsedUrl.hostname = 'localhost';
    return parsedUrl.toString().replace(/\/$/, '');
  }

  return strippedBaseUrl;
}

function resolveStrapiBaseUrl(target) {
  const explicitBaseUrl = readEnv('VITE_STRAPI_URL');
  const selectedBaseUrl = explicitBaseUrl || resolveDefaultStrapiUrl(target);
  return normalizeBrowserBaseUrl(selectedBaseUrl);
}

function normalizeEndpointPath(rawPath, fallback) {
  const resolved = String(rawPath ?? '').trim() || fallback;

  if (/^https?:\/\//i.test(resolved)) {
    return resolved;
  }

  return resolved.startsWith('/') ? resolved : `/${resolved}`;
}

function resolveEndpoint(envName, fallback) {
  return normalizeEndpointPath(readEnv(envName), fallback);
}

const backendTarget = resolveBackendTarget();
const strapiBaseUrl = resolveStrapiBaseUrl(backendTarget);

export const runtimeConfig = Object.freeze({
  backendTarget,
  strapiBaseUrl,
  endpoints: Object.freeze({
    auth: resolveEndpoint('VITE_STRAPI_AUTH_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.auth),
    register: resolveEndpoint('VITE_STRAPI_REGISTER_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.register),
    forgotPassword: resolveEndpoint(
      'VITE_STRAPI_FORGOT_PASSWORD_ENDPOINT',
      DEFAULT_STRAPI_ENDPOINTS.forgotPassword,
    ),
    users: resolveEndpoint('VITE_STRAPI_USERS_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.users),
    profiles: resolveEndpoint('VITE_STRAPI_PROFILES_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.profiles),
    areas: resolveEndpoint('VITE_STRAPI_AREAS_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.areas),
    groups: resolveEndpoint('VITE_STRAPI_GROUPS_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.groups),
    groupMembers: resolveEndpoint(
      'VITE_STRAPI_GROUP_MEMBERS_ENDPOINT',
      DEFAULT_STRAPI_ENDPOINTS.groupMembers,
    ),
    userAreas: resolveEndpoint(
      'VITE_STRAPI_USER_AREAS_ENDPOINT',
      DEFAULT_STRAPI_ENDPOINTS.userAreas,
    ),
    materials: resolveEndpoint('VITE_STRAPI_MATERIALS_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.materials),
    topics: resolveEndpoint('VITE_STRAPI_TOPICS_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.topics),
    posts: resolveEndpoint('VITE_STRAPI_POSTS_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.posts),
    comments: resolveEndpoint('VITE_STRAPI_COMMENTS_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.comments),
    likes: resolveEndpoint('VITE_STRAPI_LIKES_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.likes),
    activities: resolveEndpoint('VITE_STRAPI_ACTIVITIES_ENDPOINT', DEFAULT_STRAPI_ENDPOINTS.activities),
  }),
  branding: Object.freeze({
    logoName: readEnv('VITE_STRAPI_LOGO_NAME', 'connectroca_logo'),
    logoUrl: readEnv('VITE_STRAPI_LOGO_URL'),
    logoId: readEnv('VITE_STRAPI_LOGO_ID'),
  }),
});

export function getStrapiBaseUrlFromConfig() {
  return runtimeConfig.strapiBaseUrl;
}
