import { getStrapiBaseUrl, request } from './httpClient';
import { runtimeConfig } from '../config/runtimeConfig';

const LOCAL_LOGO_PATH = '/assets/connectroca_logo.png';
const DEFAULT_LOGO_NAME = 'connectroca_logo';
const DEFAULT_SEARCH_SIZE = 50;

let cachedLogoUrl = '';
let pendingLogoRequest = null;

function normalizeMediaUrl(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${getStrapiBaseUrl()}${normalizedPath}`;
}

function pickMediaUrl(fileEntry) {
  if (!fileEntry || typeof fileEntry !== 'object') {
    return '';
  }

  const preferredUrl =
    fileEntry.formats?.medium?.url ??
    fileEntry.formats?.small?.url ??
    fileEntry.formats?.thumbnail?.url ??
    fileEntry.url;

  return normalizeMediaUrl(preferredUrl);
}

function toArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (payload && typeof payload === 'object') {
    return [payload];
  }

  return [];
}

function getLogoNameHint() {
  const configuredName = runtimeConfig.branding.logoName.toString().trim();
  return configuredName || DEFAULT_LOGO_NAME;
}

function findMatchingLogo(files, logoNameHint) {
  if (!Array.isArray(files) || !logoNameHint) {
    return null;
  }

  const normalizedHint = logoNameHint.toLowerCase();

  return (
    files.find((fileEntry) => {
      if (!fileEntry || typeof fileEntry !== 'object') {
        return false;
      }

      const name = (fileEntry.name ?? '').toString().toLowerCase();
      const alternativeText = (fileEntry.alternativeText ?? '').toString().toLowerCase();
      const caption = (fileEntry.caption ?? '').toString().toLowerCase();

      return (
        name.includes(normalizedHint) ||
        alternativeText.includes(normalizedHint) ||
        caption.includes(normalizedHint)
      );
    }) ?? null
  );
}

async function findLogoById(fileId) {
  if (!fileId) {
    return '';
  }

  const payload = await request(`/api/upload/files/${encodeURIComponent(fileId)}`);
  return pickMediaUrl(payload);
}

async function findLogoByFilteredQuery(logoNameHint) {
  const query = new URLSearchParams({
    'filters[name][$containsi]': logoNameHint,
    sort: 'updatedAt:desc',
    limit: '1',
  });

  const payload = await request(`/api/upload/files?${query.toString()}`);
  const files = toArray(payload);
  const match = files[0] ?? null;
  return pickMediaUrl(match);
}

async function findLogoByClientSideScan(logoNameHint) {
  const query = new URLSearchParams({
    sort: 'updatedAt:desc',
    limit: String(DEFAULT_SEARCH_SIZE),
  });

  const payload = await request(`/api/upload/files?${query.toString()}`);
  const files = toArray(payload);
  const match = findMatchingLogo(files, logoNameHint);
  return pickMediaUrl(match);
}

async function resolveLogoFromStrapi() {
  const directLogoUrl = normalizeMediaUrl(runtimeConfig.branding.logoUrl);
  if (directLogoUrl) {
    return directLogoUrl;
  }

  const fileId = runtimeConfig.branding.logoId.toString().trim();
  if (fileId) {
    const byIdUrl = await findLogoById(fileId);
    if (byIdUrl) {
      return byIdUrl;
    }
  }

  const logoNameHint = getLogoNameHint();

  try {
    const filteredUrl = await findLogoByFilteredQuery(logoNameHint);
    if (filteredUrl) {
      return filteredUrl;
    }
  } catch {
    // Fallback to a broader scan when filters are unavailable in the upload endpoint.
  }

  return findLogoByClientSideScan(logoNameHint);
}

export function getLocalLogoUrl() {
  return LOCAL_LOGO_PATH;
}

export async function getBrandLogoUrl() {
  if (cachedLogoUrl) {
    return cachedLogoUrl;
  }

  if (!pendingLogoRequest) {
    pendingLogoRequest = resolveLogoFromStrapi()
      .then((logoUrl) => {
        cachedLogoUrl = logoUrl || LOCAL_LOGO_PATH;
        return cachedLogoUrl;
      })
      .catch(() => {
        cachedLogoUrl = LOCAL_LOGO_PATH;
        return cachedLogoUrl;
      })
      .finally(() => {
        pendingLogoRequest = null;
      });
  }

  return pendingLogoRequest;
}
