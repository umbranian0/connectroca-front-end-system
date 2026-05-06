import { request } from './httpClient';
import { runtimeConfig } from '../config/runtimeConfig';

const AUTH_ENDPOINT = runtimeConfig.endpoints.auth;
const REGISTER_ENDPOINT = runtimeConfig.endpoints.register;
const USERS_ENDPOINT = runtimeConfig.endpoints.users;
const FORGOT_PASSWORD_ENDPOINT = runtimeConfig.endpoints.forgotPassword;

function normalizeCredentials(credentials) {
  return {
    username: credentials.username.trim(),
    email: credentials.email.trim(),
    password: credentials.password,
  };
}

function asMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

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
  const body = normalizeCredentials(credentials);

  try {
    const payload = await request(REGISTER_ENDPOINT, {
      method: 'POST',
      body,
    });

    return payload?.user ?? payload;
  } catch (error) {
    const canTryUsersEndpoint = Boolean(token);
    const isPermissionError = error instanceof Error && 'status' in error && error.status === 403;

    if (canTryUsersEndpoint && isPermissionError) {
      return request(USERS_ENDPOINT, {
        method: 'POST',
        token,
        body,
      });
    }

    throw new Error(
      isPermissionError
        ? 'Registration is blocked by backend permissions. Enable public Register in Strapi Users & Permissions.'
        : asMessage(error, 'Unable to create account.'),
    );
  }
}

export async function requestPasswordReset(email) {
  if (!email) {
    throw new Error('Email is required.');
  }

  try {
    return await request(FORGOT_PASSWORD_ENDPOINT, {
      method: 'POST',
      body: { email },
    });
  } catch (error) {
    const isPermissionError = error instanceof Error && 'status' in error && error.status === 403;

    throw new Error(
      isPermissionError
        ? 'Password reset is blocked by backend permissions. Enable public Forgot Password in Strapi Users & Permissions.'
        : asMessage(error, 'Unable to process password reset request.'),
    );
  }
}

export async function fetchCurrentUser(token) {
  return request('/api/users/me', { token });
}
