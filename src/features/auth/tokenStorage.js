import { AUTH_STORAGE_KEY } from './constants';

function canUseBrowserStorage() {
  return typeof window !== 'undefined';
}

function readStorageItem(storage, key) {
  try {
    return storage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writeStorageItem(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode/quota/security policies).
  }
}

function removeStorageItem(storage, key) {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function getSessionToken() {
  if (!canUseBrowserStorage()) {
    return '';
  }

  return readStorageItem(window.sessionStorage, AUTH_STORAGE_KEY);
}

function getLegacyLocalToken() {
  if (!canUseBrowserStorage()) {
    return '';
  }

  return readStorageItem(window.localStorage, AUTH_STORAGE_KEY);
}

function removeLegacyLocalToken() {
  if (!canUseBrowserStorage()) {
    return;
  }

  removeStorageItem(window.localStorage, AUTH_STORAGE_KEY);
}

export function getStoredAuthToken() {
  if (!canUseBrowserStorage()) {
    return '';
  }

  const sessionToken = getSessionToken();
  if (sessionToken) {
    return sessionToken;
  }

  const legacyToken = getLegacyLocalToken();
  if (!legacyToken) {
    return '';
  }

  // One-time migration: move old localStorage token into session storage.
  writeStorageItem(window.sessionStorage, AUTH_STORAGE_KEY, legacyToken);
  removeLegacyLocalToken();
  return legacyToken;
}

export function setStoredAuthToken(nextToken) {
  if (!canUseBrowserStorage()) {
    return;
  }

  const tokenValue = String(nextToken ?? '').trim();

  if (!tokenValue) {
    clearStoredAuthToken();
    return;
  }

  writeStorageItem(window.sessionStorage, AUTH_STORAGE_KEY, tokenValue);
  removeLegacyLocalToken();
}

export function clearStoredAuthToken() {
  if (!canUseBrowserStorage()) {
    return;
  }

  removeStorageItem(window.sessionStorage, AUTH_STORAGE_KEY);
  removeLegacyLocalToken();
}
