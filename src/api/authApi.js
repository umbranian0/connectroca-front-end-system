import { request } from './httpClient';

const AUTH_ENDPOINT = import.meta.env.VITE_STRAPI_AUTH_ENDPOINT ?? '/api/auth/local';

export async function loginWithLocalCredentials(credentials) {
  const payload = await request(AUTH_ENDPOINT, {
    method: 'POST',
    body: credentials,
  });

  if (!payload?.jwt) {
    throw new Error('Strapi login did not return a JWT token.');
  }

  return payload;
}

export async function fetchCurrentUser(token) {
  return request('/api/users/me', { token });
}
