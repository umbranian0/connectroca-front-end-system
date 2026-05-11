import { request } from './httpClient';
import { normalizeStrapiCollection, normalizeStrapiSingle } from '../utils/strapi';
import { runtimeConfig } from '../config/runtimeConfig';

const ENDPOINTS = {
  profiles: runtimeConfig.endpoints.profiles,
  areas: runtimeConfig.endpoints.areas,
  groups: runtimeConfig.endpoints.groups,
  groupMembers: runtimeConfig.endpoints.groupMembers,
  userAreas: runtimeConfig.endpoints.userAreas,
  materials: runtimeConfig.endpoints.materials,
  topics: runtimeConfig.endpoints.topics,
  posts: runtimeConfig.endpoints.posts,
  comments: runtimeConfig.endpoints.comments,
  likes: runtimeConfig.endpoints.likes,
};

const SOFT_FAIL_ENDPOINTS = new Set([
  runtimeConfig.endpoints.profiles.split('?')[0],
  runtimeConfig.endpoints.userAreas.split('?')[0],
]);

function getBaseEndpoint(endpoint) {
  return String(endpoint ?? '').split('?')[0];
}

function isInvalidUserFilterError(error) {
  const errorStatus = error?.status ?? null;
  const message = error?.payload?.error?.message ?? error?.message ?? '';
  const key = error?.payload?.error?.details?.key ?? null;

  return errorStatus === 400 && key === 'user' && String(message).includes('Invalid key user');
}

function shouldSoftFail(endpoint, error) {
  return SOFT_FAIL_ENDPOINTS.has(getBaseEndpoint(endpoint)) && isInvalidUserFilterError(error);
}

function withPopulate(endpoint) {
  if (endpoint.includes('populate=')) {
    return endpoint;
  }
  const join = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${join}populate=*`;
}

function withEntityId(endpoint, id) {
  const [basePath, queryString] = endpoint.split('?');
  if (!queryString) {
    return `${basePath}/${id}`;
  }
  return `${basePath}/${id}?${queryString}`;
}

async function fetchCollection(endpoint, token) {
  try {
    const payload = await request(withPopulate(endpoint), { token });
    return normalizeStrapiCollection(payload);
  } catch (error) {
    if (shouldSoftFail(endpoint, error)) {
      return [];
    }

    throw error;
  }
}

export function fetchProfiles(token) {
  return fetchCollection(ENDPOINTS.profiles, token);
}

export function fetchAreas(token) {
  return fetchCollection(ENDPOINTS.areas, token);
}

export function fetchGroups(token) {
  return fetchCollection(ENDPOINTS.groups, token);
}

export function fetchGroupMembers(token) {
  return fetchCollection(ENDPOINTS.groupMembers, token);
}

export function fetchUserAreas(token) {
  return fetchCollection(ENDPOINTS.userAreas, token);
}

export function fetchMaterials(token) {
  return fetchCollection(ENDPOINTS.materials, token);
}

export function fetchTopics(token) {
  return fetchCollection(ENDPOINTS.topics, token);
}

export function fetchPosts(token) {
  return fetchCollection(ENDPOINTS.posts, token);
}

export function fetchComments(token) {
  return fetchCollection(ENDPOINTS.comments, token);
}

export function fetchLikes(token) {
  return fetchCollection(ENDPOINTS.likes, token);
}

export async function joinGroup(token, userId, groupId) {
  const payload = await request(ENDPOINTS.groupMembers, {
    method: 'POST',
    token,
    body: {
      data: {
        user: Number(userId),
        group: Number(groupId),
      },
    },
  });

  return normalizeStrapiSingle(payload);
}

export async function createProfile(profileData, token) {
  const payload = await request(ENDPOINTS.profiles, {
    method: 'POST',
    token,
    body: { data: profileData },
  });

  return normalizeStrapiSingle(payload);
}

export async function updateProfile(profileId, profileData, token) {
  if (!profileId) {
    throw new Error('Profile ID is required to update profile data.');
  }

  const payload = await request(withEntityId(ENDPOINTS.profiles, profileId), {
    method: 'PUT',
    token,
    body: { data: profileData },
  });

  return normalizeStrapiSingle(payload);
}
