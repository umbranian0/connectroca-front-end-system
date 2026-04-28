import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAreas, fetchLikes, fetchPosts, fetchTopics } from '../api/conectraApi';
import { useAuth } from '../features/auth/useAuth';
import { useI18n } from '../features/i18n/useI18n';
import {
  formatRelativeTime,
  getAreaLabel,
  getEntityId,
  getRelationOne,
  getUserDisplayName,
  toNumber,
} from '../utils/strapi';

function ForumPage() {
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [areas, setAreas] = useState([]);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadForum = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [nextAreas, nextTopics, nextPosts, nextLikes] = await Promise.all([
        fetchAreas(token),
        fetchTopics(token),
        fetchPosts(token),
        fetchLikes(token),
      ]);

      setAreas(nextAreas);
      setTopics(nextTopics);
      setPosts(nextPosts);
      setLikes(nextLikes);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('forum.loadError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    void loadForum();
  }, [loadForum]);

  const filteredTopics = useMemo(() => {
    return topics
      .filter((topic) => {
        const area = getRelationOne(topic, 'area');
        const areaId = String(getEntityId(area) ?? '');

        if (selectedArea !== 'all' && areaId !== selectedArea) {
          return false;
        }

        if (!searchTerm.trim()) {
          return true;
        }

        const normalizedSearch = searchTerm.toLowerCase();
        return (
          (topic.title ?? '').toLowerCase().includes(normalizedSearch) ||
          (topic.description ?? '').toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => {
        const pinSort = Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));

        if (pinSort !== 0) {
          return pinSort;
        }

        const aDate = new Date(a.creationDate ?? a.createdAt ?? 0).getTime();
        const bDate = new Date(b.creationDate ?? b.createdAt ?? 0).getTime();
        return bDate - aDate;
      });
  }, [searchTerm, selectedArea, topics]);

  const postTopicMap = useMemo(() => {
    const map = new Map();

    posts.forEach((post) => {
      const topic = getRelationOne(post, 'topic');
      const topicId = String(getEntityId(topic) ?? '');

      if (!topicId) {
        return;
      }

      const current = map.get(topicId) ?? 0;
      map.set(topicId, current + 1);
    });

    return map;
  }, [posts]);

  const likesTopicMap = useMemo(() => {
    const map = new Map();

    likes.forEach((like) => {
      const post = getRelationOne(like, 'post');
      const topic = post ? getRelationOne(post, 'topic') : null;
      const topicId = String(getEntityId(topic) ?? '');

      if (!topicId) {
        return;
      }

      const current = map.get(topicId) ?? 0;
      map.set(topicId, current + 1);
    });

    return map;
  }, [likes]);

  return (
    <section className="page-section forum-page">
      <header className="panel-title-row">
        <div>
          <h1>{t('forum.title')}</h1>
          <p>{t('forum.subtitle')}</p>
        </div>
        <button type="button" className="button button-secondary" onClick={loadForum}>
          {t('common.refresh')}
        </button>
      </header>

      <label className="search-field" htmlFor="forum-search">
        <span>S</span>
        <input
          id="forum-search"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={t('forum.searchPlaceholder')}
        />
      </label>

      <div className="chip-row">
        <button
          type="button"
          className={selectedArea === 'all' ? 'chip chip-active' : 'chip'}
          onClick={() => setSelectedArea('all')}
        >
          {t('forum.all')}
        </button>

        {areas.map((area) => {
          const areaId = String(getEntityId(area));

          return (
            <button
              key={areaId}
              type="button"
              className={selectedArea === areaId ? 'chip chip-active' : 'chip'}
              onClick={() => setSelectedArea(areaId)}
            >
              {area.name ?? t('forum.areaFallback')}
            </button>
          );
        })}
      </div>

      {isLoading ? <p className="status-message">{t('forum.loading')}</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!isLoading && !error && filteredTopics.length === 0 ? (
        <p className="status-message">{t('forum.noResults')}</p>
      ) : null}

      {!isLoading && !error && filteredTopics.length > 0 ? (
        <ul className="topic-list">
          {filteredTopics.map((topic) => {
            const topicId = String(getEntityId(topic) ?? '');
            const creator = getRelationOne(topic, 'creator');
            const area = getRelationOne(topic, 'area');
            const replies = postTopicMap.get(topicId) ?? 0;
            const topicLikes = likesTopicMap.get(topicId) ?? 0;

            return (
              <li key={topicId || topic.title} className="topic-card">
                <div className="topic-card-header">
                  <strong>{topic.title ?? t('forum.untitledTopic')}</strong>
                  {topic.isPinned ? <span className="topic-pin">{t('forum.pinned')}</span> : null}
                </div>

                <p>{topic.description ?? t('forum.noDescription')}</p>

                <div className="topic-meta">
                  <span>{getUserDisplayName(creator, t('format.communityMember'))}</span>
                  <span>{getAreaLabel(area, t('format.generalArea'))}</span>
                  <span>
                    {toNumber(topic.views, 0)} {t('forum.views')}
                  </span>
                  <span>
                    {replies} {t('forum.replies')}
                  </span>
                  <span>
                    {topicLikes} {t('forum.likes')}
                  </span>
                  <span>{formatRelativeTime(topic.creationDate ?? topic.createdAt, locale, t('format.justNow'))}</span>
                </div>

                <Link className="button button-secondary" to={`/forum/topic/${topicId}`}>
                  {t('forum.openThread')}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

export default ForumPage;
