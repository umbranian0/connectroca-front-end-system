function pickFirstStringValue(candidate, keys) {
  for (const key of keys) {
    const value = candidate?.[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
}

export function normalizeStrapiCollection(payload) {
  const data = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];

  return data.map((item) => {
    if (item && typeof item === 'object' && item.attributes) {
      return {
        id: item.id,
        ...item.attributes,
      };
    }

    return item;
  });
}

export function getActivityKey(activity) {
  return (
    activity?.id ??
    activity?.documentId ??
    `${getActivityTitle(activity)}-${activity?.createdAt ?? activity?.updatedAt ?? 'na'}`
  );
}

export function getActivityTitle(activity) {
  const title = pickFirstStringValue(activity, ['title', 'name', 'activity', 'headline']);

  if (title) {
    return title;
  }

  if (activity?.id) {
    return `Activity #${activity.id}`;
  }

  return 'Untitled activity';
}

export function getActivityDescription(activity) {
  const description = pickFirstStringValue(activity, [
    'description',
    'content',
    'summary',
    'details',
    'message',
  ]);

  return description || 'No description available for this item.';
}

export function getUserDisplayName(user) {
  const fullName = `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim();

  if (fullName) {
    return fullName;
  }

  return user?.username ?? user?.email ?? `User ${user?.id ?? ''}`.trim();
}

export function getUserRoleLabel(user) {
  if (typeof user?.role === 'string') {
    return user.role;
  }

  if (typeof user?.role?.name === 'string') {
    return user.role.name;
  }

  if (typeof user?.role?.type === 'string') {
    return user.role.type;
  }

  return 'unknown';
}

export function formatDateTime(input) {
  if (!input) {
    return 'No timestamp';
  }

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid timestamp';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
