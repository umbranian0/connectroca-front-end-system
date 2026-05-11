import { request } from './httpClient';
import { normalizeStrapiCollection } from '../utils/strapi';
import { runtimeConfig } from '../config/runtimeConfig';

const USERS_ENDPOINT = runtimeConfig.endpoints.users;

export async function fetchUsers(token) {
  const payload = await request(USERS_ENDPOINT, {
    token,
  });

  return normalizeStrapiCollection(payload);
}

export async function updateUser(userData, token) {
  if (!userData || typeof userData !== 'object') {
    throw new Error('User data is required to update account data.');
  }

  return request(`${USERS_ENDPOINT}/me`, {
    method: 'PUT',
    token,
    body: userData,
  });
}
