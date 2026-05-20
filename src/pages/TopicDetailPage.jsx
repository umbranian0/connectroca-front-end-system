import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchComments, fetchPosts, fetchTopics } from '../api/conectraApi';
import { createPost } from '../api/formsApi';
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
  const { token, isAuthenticated } = useAuth();
  const { t, locale } = useI18n();
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [replyStatus, setReplyStatus] = useState({ isSubmitting: false, error: '', success: '' });
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

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (!replyContent.trim()) {
      setReplyStatus({ isSubmitting: false, error: t('topicDetail.replyRequired'), success: '' });
      return;
    }

    if (!isAuthenticated) {
      setReplyStatus({ isSubmitting: false, error: t('topicDetail.replyLoginRequired'), success: '' });
      return;
    }

    setReplyStatus({ isSubmitting: true, error: '', success: '' });

    try {
      const topicRelationId = String(getEntityId(topic) ?? topicId ?? '');
      await createPost(
        {
          content: replyContent,
          topicId: topicRelationId,
          postDate: new Date().toISOString(),
        },
        token,
      );
      setReplyContent('');
      setReplyStatus({ isSubmitting: false, error: '', success: t('topicDetail.replySuccess') });
      await loadThread();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('topicDetail.replyError');
      setReplyStatus({ isSubmitting: false, error: message, success: '' });
    }
  };

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

      <section className="reply-form">
        <form onSubmit={handleReplySubmit}>
          <label htmlFor="topic-reply" className="form-label">
            {t('topicDetail.replyLabel')}
          </label>
          <textarea
            id="topic-reply"
            value={replyContent}
            onChange={(event) => setReplyContent(event.target.value)}
            rows={4}
            placeholder={t('topicDetail.replyPlaceholder')}
            disabled={!isAuthenticated || replyStatus.isSubmitting}
          />

          {replyStatus.error ? <p className="status-error">{replyStatus.error}</p> : null}
          {replyStatus.success ? <p className="status-message">{replyStatus.success}</p> : null}

          <button
            type="submit"
            className="button button-primary"
            disabled={!isAuthenticated || replyStatus.isSubmitting}
          >
            {replyStatus.isSubmitting ? t('topicDetail.replySending') : t('topicDetail.replySubmit')}
          </button>

          {!isAuthenticated ? (
            <p className="status-message">{t('topicDetail.replyLoginHint')}</p>
          ) : null}
        </form>
      </section>

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
