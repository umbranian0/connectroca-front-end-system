const LOCAL_STRAPI_URL = 'http://localhost:1337';
const DEVELOP_STRAPI_URL = 'https://connectra-backend-system-f4a977a741b9.herokuapp.com';

function getBrowserModeFallback() {
  if (typeof window === 'undefined') {
    return 'local';
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'local' : 'develop';
}

function resolveConfiguredMode() {
  const mode = (import.meta.env.VITE_RUNTIME_MODE ?? '').toString().trim().toLowerCase();

  if (mode === 'local' || mode === 'develop') {
    return mode;
  }

  return getBrowserModeFallback();
}

function resolveDefaultStrapiUrl(mode) {
  const localUrl = (import.meta.env.VITE_STRAPI_URL_LOCAL ?? LOCAL_STRAPI_URL).toString().trim();
  const developUrl = (import.meta.env.VITE_STRAPI_URL_DEVELOP ?? DEVELOP_STRAPI_URL)
    .toString()
    .trim();

  if (mode === 'develop') {
    return developUrl || DEVELOP_STRAPI_URL;
  }

  return localUrl || LOCAL_STRAPI_URL;
}

function normalizeBrowserBaseUrl(rawBaseUrl) {
  const configuredBaseUrl = typeof rawBaseUrl === 'string' ? rawBaseUrl.trim() : '';
  const runtimeMode = resolveConfiguredMode();
  const baseUrl = (configuredBaseUrl || resolveDefaultStrapiUrl(runtimeMode)).replace(/\/$/, '');

  if (typeof window === 'undefined') {
    return baseUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    return baseUrl;
  }

  const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const usesDockerHostAlias = parsedUrl.hostname === 'host.docker.internal';

  if (isLocalBrowser && usesDockerHostAlias) {
    parsedUrl.hostname = 'localhost';
    return parsedUrl.toString().replace(/\/$/, '');
  }

  return baseUrl;
}

export function getStrapiBaseUrl() {
  return normalizeBrowserBaseUrl(import.meta.env.VITE_STRAPI_URL);
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getStrapiBaseUrl()}${normalizedPath}`;
}

function extractErrorMessage(payload, fallback) {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload?.error?.message === 'string') {
    return payload.error.message;
  }

  if (typeof payload?.message === 'string') {
    return payload.message;
  }

  return fallback;
}

export async function request(path, options = {}) {
  const { method = 'GET', body, token, headers = {} } = options;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  let payload = null;

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(payload, `Request failed with status ${response.status}.`);
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
