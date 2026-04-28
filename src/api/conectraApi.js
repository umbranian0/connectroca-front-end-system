import { request } from './httpClient';
import { normalizeStrapiCollection, normalizeStrapiSingle } from '../utils/strapi';

const ENDPOINTS = {
  profiles: import.meta.env.VITE_STRAPI_PROFILES_ENDPOINT ?? '/api/profiles',
  areas: import.meta.env.VITE_STRAPI_AREAS_ENDPOINT ?? '/api/areas',
  groups: import.meta.env.VITE_STRAPI_GROUPS_ENDPOINT ?? '/api/groups',
  groupMembers: import.meta.env.VITE_STRAPI_GROUP_MEMBERS_ENDPOINT ?? '/api/group-members',
  userAreas: import.meta.env.VITE_STRAPI_USER_AREAS_ENDPOINT ?? '/api/user-areas',
  materials: import.meta.env.VITE_STRAPI_MATERIALS_ENDPOINT ?? '/api/materials',
  topics: import.meta.env.VITE_STRAPI_TOPICS_ENDPOINT ?? '/api/topics',
  posts: import.meta.env.VITE_STRAPI_POSTS_ENDPOINT ?? '/api/posts',
  comments: import.meta.env.VITE_STRAPI_COMMENTS_ENDPOINT ?? '/api/comments',
  likes: import.meta.env.VITE_STRAPI_LIKES_ENDPOINT ?? '/api/likes',
};

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
  const payload = await request(withPopulate(endpoint), { token });
  return normalizeStrapiCollection(payload);
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
