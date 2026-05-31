import { registerUserAccount } from './authApi';
import { request } from './httpClient';
import { normalizeStrapiSingle } from '../utils/strapi';
import { runtimeConfig } from '../config/runtimeConfig';

const POSTS_ENDPOINT = runtimeConfig.endpoints.posts;
const GROUPS_ENDPOINT = runtimeConfig.endpoints.groups;

function toOptionalInteger(value) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function createAccount(payload, token) {
  return registerUserAccount(payload, token);
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
  const creator = toOptionalInteger(payload.creator);
  const area = toOptionalInteger(payload.area);

  const name = payload.name?.trim();
  const description = payload.description?.trim();

  if (!name) {
    throw new Error('Group name is required.');
  }

  if (!description) {
    throw new Error('Group description is required.');
  }

  const data = {
    name,
    description,
    status: payload.status,
  };

  if (memberLimit) {
    data.memberLimit = memberLimit;
  }

  if (creator) {
    data.creator = creator;
  }

  if (area) {
    data.area = area;
  }

  if (payload.location?.trim()) {
    data.location = payload.location.trim();
  }

  if (payload.schedule?.trim()) {
    data.schedule = payload.schedule.trim();
  }

  const response = await request(GROUPS_ENDPOINT, {
    method: 'POST',
    token,
    body: { data },
  });

  return normalizeStrapiSingle(response);
}

