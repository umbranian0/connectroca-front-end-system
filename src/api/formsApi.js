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

  // Enviamos APENAS o conteúdo puro da mensagem
  const data = {
    content: payload.content.trim(),
  };

  // E associamos apenas o ID do tópico
  if (topicId) {
    data.topic = topicId;
  }

  const response = await request(POSTS_ENDPOINT, {
    method: 'POST',
    token, // O token aqui já deveria ser usado pelo Strapi para saber quem é você!
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
