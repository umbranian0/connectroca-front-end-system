const STORAGE_KEY = 'connectra_posts';

function getSavedPosts() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read posts from localStorage', error);
    return [];
  }
}

function savePosts(posts) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to write posts to localStorage', error);
  }
}

function generatePostId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function fetchPosts() {
  return getSavedPosts().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchPostById(postId) {
  return getSavedPosts().find((post) => post.id === postId) ?? null;
}

export async function createPost(postData) {
  const posts = getSavedPosts();
  const newPost = {
    id: generatePostId(),
    title: postData.title,
    body: postData.body,
    author: postData.author,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  savePosts([newPost, ...posts]);
  return newPost;
}

export async function updatePost(postId, updates) {
  const posts = getSavedPosts();
  const nextPosts = posts.map((post) => {
    if (post.id !== postId) {
      return post;
    }

    return {
      ...post,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  });

  savePosts(nextPosts);
  return nextPosts.find((post) => post.id === postId) ?? null;
}

export async function deletePost(postId) {
  const posts = getSavedPosts();
  const nextPosts = posts.filter((post) => post.id !== postId);
  savePosts(nextPosts);
}
