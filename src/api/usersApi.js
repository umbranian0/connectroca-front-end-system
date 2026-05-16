import { request } from './httpClient';
import { normalizeStrapiCollection } from '../utils/strapi';

const USERS_ENDPOINT = import.meta.env.VITE_STRAPI_USERS_ENDPOINT ?? '/api/users';

export async function fetchUsers(token) {
  const payload = await request(USERS_ENDPOINT, {
    token,
  });

  return normalizeStrapiCollection(payload);
}

export async function fetchUserById(id, token) {
  const payload = await request(`${USERS_ENDPOINT}/${id}`, {
    token,
  });

  return payload;
}