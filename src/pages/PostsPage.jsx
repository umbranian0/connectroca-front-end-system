import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPosts, deletePost } from '../api/postsApi';
import { useI18n } from '../features/i18n/useI18n';
import { formatRelativeTime } from '../utils/strapi';

function PostsPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextPosts = await fetchPosts();
      setPosts(nextPosts);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('posts.loadError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) {
      return posts;
    }

    const normalized = searchTerm.toLowerCase();
    return posts.filter(
      (post) =>
        (post.title ?? '').toLowerCase().includes(normalized) ||
        (post.body ?? '').toLowerCase().includes(normalized),
    );
  }, [posts, searchTerm]);

  const handleDelete = async (postId) => {
    if (!window.confirm(t('posts.deleteConfirm'))) {
      return;
    }

    try {
      await deletePost(postId);
      await loadPosts();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('posts.deleteError');
      setError(message);
    }
  };

  return (
    <section className="page-section posts-page">
      <header className="panel-title-row">
        <div>
          <h1>{t('posts.title')}</h1>
          <p>{t('posts.subtitle')}</p>
        </div>

        <div className="panel-actions">
          <button type="button" className="button button-secondary" onClick={loadPosts}>
            {t('common.refresh')}
          </button>
          <button type="button" className="button button-primary" onClick={() => navigate('/posts/new')}>
            + {t('posts.newPost')}
          </button>
        </div>
      </header>

      <label className="search-field" htmlFor="posts-search">
        <span>S</span>
        <input
          id="posts-search"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={t('posts.searchPlaceholder')}
        />
      </label>

      {isLoading ? <p className="status-message">{t('posts.loading')}</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!isLoading && !error && filteredPosts.length === 0 ? (
        <p className="status-message">{t('posts.noPosts')}</p>
      ) : null}

      {!isLoading && !error && filteredPosts.length > 0 ? (
        <ul className="post-list">
          {filteredPosts.map((post) => (
            <li key={post.id} className="post-card">
              <div className="post-card-top">
                <div>
                  <strong>{post.title}</strong>
                  <p>{post.author}</p>
                </div>
                <span>{formatRelativeTime(post.createdAt, locale, t('format.justNow'))}</span>
              </div>

              <p>{post.body}</p>

              <div className="post-card-actions">
                <Link to={`/posts/${post.id}/edit`} className="button button-secondary">
                  {t('posts.editPost')}
                </Link>
                <button type="button" className="button button-secondary" onClick={() => handleDelete(post.id)}>
                  {t('posts.deletePost')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export default PostsPage;
