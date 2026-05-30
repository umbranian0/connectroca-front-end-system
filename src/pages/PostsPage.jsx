import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../api/conectraApi';
import { useAuth } from '../features/auth/useAuth';
import { useI18n } from '../features/i18n/useI18n';
import { formatRelativeTime, getEntityId, getRelationOne, getUserDisplayName } from '../utils/strapi';

function PostsPage() {
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextPosts = await fetchPosts(token);
      setPosts(nextPosts);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('posts.loadError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  return (
    <section className="page-section posts-page">
      <header className="panel-title-row">
        <div>
          <h1>{t('posts.title')}</h1>
          <p>{t('posts.subtitle')}</p>
        </div>

        <div className="button-row">
          <button type="button" className="button button-secondary" onClick={loadPosts}>
            {t('common.refresh')}
          </button>
          <Link className="button button-primary" to="/posts/new">
            {t('posts.createButton')}
          </Link>
        </div>
      </header>

      {isLoading ? <p className="status-message">{t('posts.loading')}</p> : null}
      {error ? <p className="status-error">{error}</p> : null}
      {!isLoading && !error && posts.length === 0 ? (
        <p className="status-message">{t('posts.noPosts')}</p>
      ) : null}

      {!isLoading && !error && posts.length > 0 ? (
        <ul className="post-list">
          {posts.map((post) => {
            const postId = String(getEntityId(post) ?? '');
            const author = getRelationOne(post, 'author');
            const topic = getRelationOne(post, 'topic');
            const excerpt = post.content ? `${post.content.slice(0, 220)}${post.content.length > 220 ? '…' : ''}` : t('posts.noContent');

            return (
              <li key={postId || excerpt} className="post-card">
                <div className="post-card-header">
                  <div>
                    <strong>{topic?.title ?? t('posts.noTopic')}</strong>
                    <p>{excerpt}</p>
                  </div>
                  <div className="post-card-actions">
                    <Link className="button button-secondary" to={`/posts/${postId}/edit`}>
                      {t('posts.editButton')}
                    </Link>
                  </div>
                </div>

                <div className="post-card-meta">
                  <span>{getUserDisplayName(author, t('format.communityMember'))}</span>
                  <span>{topic?.title ? `${t('posts.topicLabel')}: ${topic.title}` : t('posts.noTopic')}</span>
                  <span>{formatRelativeTime(post.postDate ?? post.createdAt, locale, t('format.justNow'))}</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

export default PostsPage;
