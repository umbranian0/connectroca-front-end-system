function unwrapEntity(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  if (entry.attributes && typeof entry.attributes === 'object') {
    return {
      id: entry.id,
      documentId: entry.documentId ?? entry.attributes.documentId,
      ...entry.attributes,
    };
  }

  return entry;
}

function unwrapRelation(relation) {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation.map((item) => unwrapEntity(item)).filter(Boolean);
  }

  if (Array.isArray(relation?.data)) {
    return relation.data.map((item) => unwrapEntity(item)).filter(Boolean);
  }

  if (relation?.data) {
    return unwrapEntity(relation.data);
  }

  return unwrapEntity(relation);
}

export function normalizeStrapiCollection(payload) {
  if (Array.isArray(payload?.data)) {
    return payload.data.map((item) => unwrapEntity(item)).filter(Boolean);
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => unwrapEntity(item)).filter(Boolean);
  }

  return [];
}

export function normalizeStrapiSingle(payload) {
  if (!payload) {
    return null;
  }

  if (payload.data) {
    return unwrapEntity(payload.data);
  }

  return unwrapEntity(payload);
}

export function getRelationOne(entity, fieldName) {
  return unwrapRelation(entity?.[fieldName]);
}

export function getRelationMany(entity, fieldName) {
  const relation = unwrapRelation(entity?.[fieldName]);
  return Array.isArray(relation) ? relation : relation ? [relation] : [];
}

export function getEntityId(entity) {
  return entity?.id ?? entity?.documentId ?? null;
}

export function getUserDisplayName(user, fallback = 'Community member') {
  if (!user) {
    return fallback;
  }

  const fullName = `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim();

  if (fullName) {
    return fullName;
  }

  return user.username ?? user.email ?? fallback;
}

export function getAreaLabel(area, fallback = 'General') {
  if (!area) {
    return fallback;
  }

  return area.name ?? area.title ?? area.slug ?? fallback;
}

export function formatDateTime(
  input,
  locale,
  fallbackNoDate = 'No date',
  fallbackInvalid = 'Invalid date',
) {
  if (!input) {
    return fallbackNoDate;
  }

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return fallbackInvalid;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatRelativeTime(input, locale, fallback = 'just now') {
  if (!input) {
    return fallback;
  }

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const units = [
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
  ];

  for (const [unit, unitMs] of units) {
    const value = Math.round(diffMs / unitMs);
    if (Math.abs(value) >= 1) {
      return rtf.format(value, unit);
    }
  }

  return fallback;
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
