# Post Creation Patterns - Connectra Frontend System

## Frontend API Pattern: createPost() with Author/Topic Relationships

### Location: `src/api/formsApi.js` (Lines 18-41)

```javascript
export async function createPost(payload, token) {
  const topicId = toOptionalInteger(payload.topicId);
  const authorId = toOptionalInteger(payload.authorId); // Garante que vira número inteiro

  const data = {
    content: payload.content.trim(),
    postDate: payload.postDate,
  };

  if (topicId) {
    data.topic = topicId;
  }

  // Se o autor existir e for um ID válido, anexa ao payload
  if (authorId) {
    data.author = authorId; 
  }

  const response = await request(POSTS_ENDPOINT, {
    method: 'POST',
    token, 
    body: { data },
  });

  return normalizeStrapiSingle(response);
}
```

**Key Points:**
- Converts relationship IDs to integers before sending
- Uses conditional logic to only include relationships if they exist
- Wraps payload in `{ data }` object for Strapi
- Relationships are passed as direct IDs: `topic: topicId` and `author: authorId`

---

## Usage Pattern: GroupChatPage.jsx (Lines 95-104)

```javascript
const createdPost = await createPost(
  {
    content: messageText.trim(),
    topicId: activeTopic?.id,
    postDate: new Date().toISOString(),
  },
  token,
);

setPosts((currentPosts) => [...currentPosts, createdPost]);
```

**Key Points:**
- Calls `createPost` with object containing `content`, `topicId`, and `postDate`
- Returns new post object which is immediately added to state
- Post object contains full relationship data after response normalization

---

## Fetching Posts with Relationships: conectraApi.js (Lines 1-90)

```javascript
function withPopulate(endpoint) {
  if (endpoint.includes('populate=')) {
    return endpoint;
  }
  const join = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${join}populate=*`;
}

export function fetchPosts(token) {
  return fetchCollection(ENDPOINTS.posts, token);
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
```

**Key Points:**
- All fetch functions automatically append `populate=*` to fetch all relationships
- Uses `normalizeStrapiCollection()` to transform Strapi format to frontend format
- Handles soft failures for invalid user filters

---

## Related Relationship Pattern: joinGroup() (conectraApi.js, Lines 117-130)

```javascript
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
```

**Pattern Similarities with createPost:**
- Creates many-to-many relationship via dedicated endpoint (`/api/group-members`)
- Wraps data in `{ data }` object
- Converts IDs to numbers explicitly
- Returns normalized response

---

## Backend Model Definition: Entity Relationships (from ERD)

### Post Model
```
**Post**
- post_id (PK)
- content
- data_post (postDate)
- autor_id (FK) → User
- topic_id (FK) → Topic
```

### Topic Model
```
**Topic**
- topic_id (PK)
- titulo (title)
- descricao (description)
- data_criacao (createdAt)
- criador_id (FK) → User
- area_id (FK) → Area
```

### GroupMember (Many-to-Many)
```
**GroupMember**
- group_id (FK)
- user_id (FK)
- role (member/admin)
- data_entrada (joinedAt)
```

---

## GraphQL Test Pattern (From tests/api/plugins/graphql/crud.test.api.js)

### Creating Post with GraphQL
```graphql
mutation createPost($data: PostInput!) {
  createPost(data: $data) {
    data {
      documentId
      attributes {
        name
        bigint
        nullable
        category
      }
    }
  }
}
```

### Variables
```javascript
{
  data: {
    name: 'post 1',
    bigint: 1316130638171,
    nullable: 'value',
    category: 'BLOG'
  }
}
```

---

## Strapi REST API Endpoint Pattern

### Create Post
```
POST /api/posts
Content-Type: application/json
Authorization: Bearer {token}

{
  "data": {
    "content": "Post content here",
    "postDate": "2024-01-15T10:30:00Z",
    "topic": 5,
    "author": 3
  }
}
```

### Fetch Posts with Relationships
```
GET /api/posts?populate=*
Authorization: Bearer {token}
```

---

## Frontend Response Normalization (from normalizeStrapiSingle utility)

Posts fetched from API have structure:
```javascript
{
  data: {
    id: 1,
    attributes: {
      content: "...",
      postDate: "...",
      topic: { data: { id: 5, attributes: {...} } },
      author: { data: { id: 3, attributes: {...} } },
      createdAt: "...",
      updatedAt: "..."
    }
  }
}
```

Normalized format expected by frontend:
```javascript
{
  id: 1,
  documentId: "abc123",
  content: "...",
  postDate: "...",
  topic: { id: 5, ... },
  author: { id: 3, ... },
  createdAt: "...",
  updatedAt: "..."
}
```

---

## Update Post Pattern (formsApi.js, Lines 45-62)

```javascript
export async function updatePost(postId, payload, token) {
  if (!postId) {
    throw new Error('Post ID is required to update a post.');
  }

  const topicId = toOptionalInteger(payload.topicId);
  const data = {
    content: payload.content.trim(),
    postDate: payload.postDate,
  };

  if (topicId) {
    data.topic = topicId;
  }

  const response = await request(`${POSTS_ENDPOINT}/${postId}`, {
    method: 'PUT',
    token,
    body: { data },
  });

  return normalizeStrapiSingle(response);
}
```

**Key Points:**
- Uses PUT method for updates
- Includes ID in URL: `/api/posts/{postId}`
- Topic relationship can be updated
- Same response normalization as create

---

## Form Examples Page Usage (FormExamplesPage.jsx, Lines 220-230)

```javascript
const created = await createPost(
  {
    content: postForm.content,
    topicId: postForm.topicId,
    postDate: finalPostDate,
  },
  token,
);

setPostStatus({
  isSubmitting: false,
  error: '',
  success: 'Post created in Strapi.',
  preview: toPreview(created),
});

setPostForm(POST_INITIAL_STATE);
```

---

## Configuration: Runtime Endpoints (runtimeConfig.js)

```javascript
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

// Default value from .env.example:
// VITE_STRAPI_POSTS_ENDPOINT=/api/posts
```

---

## Helper Function: toOptionalInteger (formsApi.js)

```javascript
function toOptionalInteger(value) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
```

**Purpose:** Safely converts relationship IDs to integers, returning null if invalid

---

## Summary of Patterns

### Creating Posts with Relationships
1. **Collect data** from form/UI (content, dates, IDs)
2. **Convert IDs to numbers** using `toOptionalInteger()`
3. **Wrap in Strapi format**: `{ data: { content, postDate, topic, author } }`
4. **Send POST** to `/api/posts` with token
5. **Normalize response** using `normalizeStrapiSingle()`
6. **Update frontend state** with result

### Relationship IDs in Requests
- Pass as direct numeric values: `topic: 5` (not object)
- Include only if valid (conditional checks)
- Convert from strings to integers explicitly

### Fetching with Relationships
- Append `populate=*` to all fetch endpoints
- Strapi returns nested relationship objects
- Frontend normalizes structure for UI consumption

### Backend Relationship Types
- **One-to-Many**: Post → User (author), Post → Topic
- **Many-to-Many**: GroupMember (user + group)
- **One-to-Many**: Topic → Area
