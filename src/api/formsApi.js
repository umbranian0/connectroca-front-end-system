import { request } from './httpClient';
import { normalizeStrapiSingle } from '../utils/strapi';

const USERS_ENDPOINT = import.meta.env.VITE_STRAPI_USERS_ENDPOINT ?? '/api/users';
const POSTS_ENDPOINT = import.meta.env.VITE_STRAPI_POSTS_ENDPOINT ?? '/api/posts';
const GROUPS_ENDPOINT = import.meta.env.VITE_STRAPI_GROUPS_ENDPOINT ?? '/api/groups';

function toOptionalInteger(value) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function createAccount(payload, token) {
  const body = {
    username: payload.username.trim(),
    email: payload.email.trim(),
    password: payload.password,
  };

  const response = await request(USERS_ENDPOINT, {
    method: 'POST',
    token,
    body,
  });

  if (response?.data) {
    return normalizeStrapiSingle(response);
  }

  return response?.user ?? response;
}

export async function createPost(payload, token) {
  const topicId = toOptionalInteger(payload.topicId);

  const data = {
    content: payload.content.trim(),
    postDate: payload.postDate,
  };

  if (topicId) {
    data.topic = topicId;
  }

  const response = await request(POSTS_ENDPOINT, {
    method: 'POST',
    token,
    body: { data },
  });

  return normalizeStrapiSingle(response);
}

export async function createGroup(payload, token) {
  const memberLimit = toOptionalInteger(payload.memberLimit);

  const data = {
    name: payload.name.trim(),
    description: payload.description.trim(),
    status: payload.status,
  };

  if (memberLimit) {
    data.memberLimit = memberLimit;
  }

  if (payload.location.trim()) {
    data.location = payload.location.trim();
  }

  if (payload.schedule.trim()) {
    data.schedule = payload.schedule.trim();
  }

  const response = await request(GROUPS_ENDPOINT, {
    method: 'POST',
    token,
    body: { data },
  });

  return normalizeStrapiSingle(response);
}
