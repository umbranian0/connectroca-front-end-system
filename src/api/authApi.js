import { request } from './httpClient';

const AUTH_ENDPOINT = import.meta.env.VITE_STRAPI_AUTH_ENDPOINT ?? '/api/auth/local';
const USERS_ENDPOINT = import.meta.env.VITE_STRAPI_USERS_ENDPOINT ?? '/api/users';
const FORGOT_PASSWORD_ENDPOINT =
  import.meta.env.VITE_STRAPI_FORGOT_PASSWORD_ENDPOINT ?? '/api/auth/forgot-password';

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

export async function registerUserAccount(credentials, token) {
  return request(USERS_ENDPOINT, {
    method: 'POST',
    token,
    body: credentials,
  });
}

export async function requestPasswordReset(email) {
  if (!email) {
    throw new Error('Email is required.');
  }

  return request(FORGOT_PASSWORD_ENDPOINT, {
    method: 'POST',
    body: { email },
  });
}

export async function fetchCurrentUser(token) {
  return request('/api/users/me', { token });
}
