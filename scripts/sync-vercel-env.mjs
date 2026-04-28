#!/usr/bin/env node

import { readFileSync } from 'node:fs';

function parseEnvTemplate(content) {
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    result[key] = value;
  }

  return result;
}

function resolvePlaceholders(value) {
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, envName) => {
    const resolved = process.env[envName];

    if (resolved === undefined) {
      throw new Error(`Missing required environment variable: ${envName}`);
    }

    return resolved;
  });
}

function buildEnvVarsFromTemplate(templatePath) {
  const fileContent = readFileSync(templatePath, 'utf8');
  const parsed = parseEnvTemplate(fileContent);
  const resolved = {};

  for (const [key, value] of Object.entries(parsed)) {
    resolved[key] = resolvePlaceholders(value);
  }

  return resolved;
}

function buildVercelApiUrl(projectId, teamId) {
  const base = `https://api.vercel.com/v10/projects/${projectId}/env`;
  const query = new URLSearchParams({ upsert: 'true' });

  if (teamId) {
    query.set('teamId', teamId);
  }

  return `${base}?${query.toString()}`;
}

async function upsertEnvVar({ token, projectId, teamId, key, value }) {
  const response = await fetch(buildVercelApiUrl(projectId, teamId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      value,
      target: ['production', 'preview'],
      type: 'plain',
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Vercel env sync failed for ${key} (${response.status}): ${details}`);
  }
}

async function main() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID || '';
  const templatePath = process.argv[2] ?? 'cloud/vercel.env.template';

  if (!token) {
    throw new Error('VERCEL_TOKEN is required.');
  }

  if (!projectId) {
    throw new Error('VERCEL_PROJECT_ID is required.');
  }

  const envVars = buildEnvVarsFromTemplate(templatePath);

  for (const [key, value] of Object.entries(envVars)) {
    await upsertEnvVar({ token, projectId, teamId, key, value });
  }

  console.log(`Synced ${Object.keys(envVars).length} env vars to Vercel project "${projectId}".`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
