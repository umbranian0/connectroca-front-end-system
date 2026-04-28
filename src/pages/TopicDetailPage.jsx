import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchComments, fetchPosts, fetchTopics } from '../api/conectraApi';
import { useAuth } from '../features/auth/useAuth';
import { useI18n } from '../features/i18n/useI18n';
import {
  formatRelativeTime,
  getAreaLabel,
  getEntityId,
  getRelationOne,
  getUserDisplayName,
} from '../utils/strapi';

function TopicDetailPage() {
  const { topicId } = useParams();
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadThread = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [nextTopics, nextPosts, nextComments] = await Promise.all([
        fetchTopics(token),
        fetchPosts(token),
        fetchComments(token),
      ]);

      setTopics(nextTopics);
      setPosts(nextPosts);
      setComments(nextComments);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('topicDetail.loadError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  const topic = useMemo(() => {
    return (
      topics.find((entry) => String(getEntityId(entry)) === String(topicId)) ??
      topics.find((entry) => String(entry.documentId) === String(topicId)) ??
      null
    );
  }, [topicId, topics]);

  const topicPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const relationTopic = getRelationOne(post, 'topic');
        return String(getEntityId(relationTopic)) === String(getEntityId(topic) ?? topicId);
      })
      .sort(
        (a, b) =>
          new Date(a.postDate ?? a.createdAt ?? 0).getTime() -
          new Date(b.postDate ?? b.createdAt ?? 0).getTime(),
      );
  }, [posts, topic, topicId]);

  const commentsByPost = useMemo(() => {
    const map = new Map();

    comments.forEach((comment) => {
      const post = getRelationOne(comment, 'post');
      const postKey = String(getEntityId(post) ?? '');

      if (!postKey) {
        return;
      }

      const current = map.get(postKey) ?? [];
      current.push(comment);
      map.set(postKey, current);
    });

    return map;
  }, [comments]);

  if (isLoading) {
    return (
      <section className="page-section">
        <p className="status-message">{t('topicDetail.loading')}</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-section">
        <p className="status-error">{error}</p>
      </section>
    );
  }

  if (!topic) {
    return (
      <section className="page-section">
        <p className="status-message">{t('topicDetail.notFound')}</p>
        <Link to="/forum" className="button button-secondary">
          {t('topicDetail.backToForum')}
        </Link>
      </section>
    );
  }

  const area = getRelationOne(topic, 'area');
  const creator = getRelationOne(topic, 'creator');

  return (
    <section className="page-section topic-detail-page">
      <header className="topic-detail-header">
        <div>
          <h1>{topic.title ?? t('topicDetail.detailsFallback')}</h1>
          <p>
            {getAreaLabel(area, t('format.generalArea'))} ·{' '}
            {getUserDisplayName(creator, t('format.communityMember'))} ·{' '}
            {formatRelativeTime(topic.creationDate ?? topic.createdAt, locale, t('format.justNow'))}
          </p>
        </div>

        <Link to="/forum" className="button button-secondary">
          {t('common.back')}
        </Link>
      </header>

      <article className="topic-opening-post">
        <p>{topic.description ?? t('topicDetail.noDescription')}</p>
      </article>

      <ul className="thread-list">
        {topicPosts.length === 0 ? (
          <li className="thread-item">
            <p className="status-message">{t('topicDetail.noReplies')}</p>
          </li>
        ) : (
          topicPosts.map((post) => {
            const postId = String(getEntityId(post) ?? '');
            const author = getRelationOne(post, 'author');
            const postComments = commentsByPost.get(postId) ?? [];

            return (
              <li key={postId || post.content} className="thread-item">
                <div className="thread-author">
                  <strong>{getUserDisplayName(author, t('format.communityMember'))}</strong>
                  <span>{formatRelativeTime(post.postDate ?? post.createdAt, locale, t('format.justNow'))}</span>
                </div>

                <p>{post.content ?? t('topicDetail.noContent')}</p>

                {postComments.length > 0 ? (
                  <ul className="thread-comment-list">
                    {postComments.map((comment) => {
                      const commentAuthor = getRelationOne(comment, 'author');

                      return (
                        <li key={getEntityId(comment) ?? comment.content}>
                          <strong>{getUserDisplayName(commentAuthor, t('format.communityMember'))}:</strong>{' '}
                          {comment.content}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}

export default TopicDetailPage;
