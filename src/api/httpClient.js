import { getStrapiBaseUrlFromConfig, runtimeConfig } from '../config/runtimeConfig';
import { AUTH_EXPIRED_EVENT } from '../features/auth/constants';
import { clearStoredAuthToken, getStoredAuthToken } from '../features/auth/tokenStorage';

export function getStrapiBaseUrl() {
  return getStrapiBaseUrlFromConfig();
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

function getTokenFromStorage() {
  return getStoredAuthToken();
}

function clearStoredToken() {
  clearStoredAuthToken();
}

function normalizePath(path) {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    try {
      const parsed = new URL(path);
      return parsed.pathname;
    } catch {
      return path;
    }
  }

  return path.startsWith('/') ? path : `/${path}`;
}

function isAuthEndpoint(path) {
  const normalized = normalizePath(path);
  const knownAuthEndpoints = new Set([
    runtimeConfig.endpoints.auth,
    runtimeConfig.endpoints.register,
    runtimeConfig.endpoints.forgotPassword,
  ]);

  return knownAuthEndpoints.has(normalized);
}

export async function request(path, options = {}) {
  const { method = 'GET', body, token, headers = {} } = options;
  const resolvedToken = token === undefined ? getTokenFromStorage() : token;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (resolvedToken) {
    requestHeaders.Authorization = `Bearer ${resolvedToken}`;
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
    if (response.status === 401 && resolvedToken && !isAuthEndpoint(path)) {
      clearStoredToken();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      }
    }

    const message = extractErrorMessage(payload, `Request failed with status ${response.status}.`);
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
