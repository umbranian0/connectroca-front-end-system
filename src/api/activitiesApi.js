import { request } from './httpClient';
import { normalizeStrapiCollection } from '../utils/strapi';
import { runtimeConfig } from '../config/runtimeConfig';

const ACTIVITIES_ENDPOINT = runtimeConfig.endpoints.activities;

export async function fetchActivities(token) {
  const payload = await request(ACTIVITIES_ENDPOINT, {
    token,
  });

  return normalizeStrapiCollection(payload);
}
