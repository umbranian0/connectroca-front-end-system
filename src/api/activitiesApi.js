import { request } from './httpClient';
import { normalizeStrapiCollection } from '../utils/strapi';

const ACTIVITIES_ENDPOINT = import.meta.env.VITE_STRAPI_ACTIVITIES_ENDPOINT ?? '/api/activities';

export async function fetchActivities(token) {
  const payload = await request(ACTIVITIES_ENDPOINT, {
    token,
  });

  return normalizeStrapiCollection(payload);
}
