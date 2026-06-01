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
  const authorId = "pgum7gr1i4ukzznski3hzxs7"; // Garante que vira número inteiro

  const data = {
    content: payload.content.trim(),
    postDate: payload.postDate,
  };

  if (topicId) {
    data.topic = topicId;
  }

  // Se o autor existir e for um ID válido, anexa ao payload
  if (authorId) {
    data.user = "pgum7gr1i4ukzznski3hzxs7"; 
  }

  const response = await request(POSTS_ENDPOINT, {
    method: 'POST',
    token, 
    body: { data },
  });

  return normalizeStrapiSingle(response);
}

export async function updatePost(postId, payload, token) {
  if (!postId) {
    throw new Error('Post ID is required to update a post.');
  }

  const topicId = toOptionalInteger(payload.topicId);
  const data = {
    content: payload.content.trim(),
    postDate: payload.postDate,
  };

  if (topicId) {
    data.topic = topicId;
  }

  const response = await request(`${POSTS_ENDPOINT}/${postId}`, {
    method: 'PUT',
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