import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchGroups,
  fetchMaterials,
  fetchPosts,
  fetchProfiles,
  fetchTopics,
} from '../api/conectraApi';
import StatCard from '../components/StatCard';
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

const ACTIVITY_COLORS = ['#f39c12', '#c6bc52', '#171154', '#6f6f77'];
const POPULAR_COLORS = ['#f55f67', '#e952a5', '#f7a100'];

function DashboardPage() {
  const { token, user } = useAuth();
  const { t, locale } = useI18n();
  const [profiles, setProfiles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [topics, setTopics] = useState([]);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fallbackProfile = useMemo(
    () => ({
      displayName: t('dashboard.fallbackProfileName'),
      course: t('dashboard.fallbackCourse'),
      level: 5,
      points: 240,
    }),
    [t],
  );

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [nextProfiles, nextMaterials, nextTopics, nextGroups, nextPosts] = await Promise.all([
        fetchProfiles(token),
        fetchMaterials(token),
        fetchTopics(token),
        fetchGroups(token),
        fetchPosts(token),
      ]);

      setProfiles(nextProfiles);
      setMaterials(nextMaterials);
      setTopics(nextTopics);
      setGroups(nextGroups);
      setPosts(nextPosts);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('dashboard.loadError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeProfile = useMemo(() => {
    const currentUserProfile = profiles.find((profile) => {
      const profileUser = getRelationOne(profile, 'user');
      return getEntityId(profileUser) === user?.id;
    });

    return currentUserProfile ?? profiles[0] ?? fallbackProfile;
  }, [fallbackProfile, profiles, user?.id]);

  const level = Math.max(toNumber(activeProfile?.level, 5), 1);
  const points = Math.max(toNumber(activeProfile?.points, 240), 0);
  const target = level * 80;
  const progressPercentage = Math.min((points / target) * 100, 100);
  const remainingPoints = Math.max(target - points, 0);

  const recentActivities = useMemo(() => {
    const items = [];

    posts.forEach((post) => {
      const topic = getRelationOne(post, 'topic');
      const author = getRelationOne(post, 'author');

      items.push({
        id: `post-${getEntityId(post)}`,
        label: t('dashboard.commentedOnTopic', {
          user: getUserDisplayName(author, t('format.communityMember')),
          topic: topic?.title ?? t('dashboard.defaultTopicLower'),
        }),
        time: post.postDate ?? post.createdAt,
      });
    });

    topics.forEach((topic) => {
      const creator = getRelationOne(topic, 'creator');
      const area = getRelationOne(topic, 'area');

      items.push({
        id: `topic-${getEntityId(topic)}`,
        label: t('dashboard.createdTopicInArea', {
          user: getUserDisplayName(creator, t('format.communityMember')),
          area: getAreaLabel(area, t('format.generalArea')),
        }),
        time: topic.creationDate ?? topic.createdAt,
      });
    });

    materials.forEach((material) => {
      const author = getRelationOne(material, 'author');

      items.push({
        id: `material-${getEntityId(material)}`,
        label: t('dashboard.sharedMaterial', {
          user: getUserDisplayName(author, t('format.communityMember')),
          material: material.title ?? t('dashboard.fallbackMaterialName'),
        }),
        time: material.publicationDate ?? material.createdAt,
      });
    });

    return items
      .sort((a, b) => new Date(b.time ?? 0).getTime() - new Date(a.time ?? 0).getTime())
      .slice(0, 4);
  }, [materials, posts, t, topics]);

  const popularTopics = useMemo(() => {
    const sorted = [...topics].sort((a, b) => toNumber(b.views) - toNumber(a.views));
    return sorted.slice(0, 3);
  }, [topics]);

  return (
    <section className="page-section dashboard-page">
      <header className="hero-card">
        <div>
          <h1>{activeProfile.displayName ?? fallbackProfile.displayName}</h1>
          <p>{activeProfile.course ?? fallbackProfile.course}</p>
          <strong>
            {t('dashboard.level')} {level}
          </strong>
        </div>

        <div className="progress-block">
          <div className="progress-labels">
            <span>
              {points}/{target} {t('dashboard.points')}
            </span>
            <span>
              {remainingPoints} {t('dashboard.remaining')}
            </span>
          </div>
          <div className="progress-track">
            <div style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard icon="T" value={topics.length} label={t('dashboard.topics')} />
        <StatCard icon="M" value={materials.length} label={t('dashboard.materials')} />
        <StatCard icon="G" value={groups.length} label={t('dashboard.groups')} />
        <StatCard icon="P" value={points} label={t('dashboard.points')} />
      </div>

      <div className="content-grid">
        <article className="content-panel">
          <div className="panel-title-row">
            <h2>{t('dashboard.recentActivity')}</h2>
            <button type="button" className="button button-secondary" onClick={loadDashboard}>
              {t('common.refresh')}
            </button>
          </div>

          {isLoading ? <p className="status-message">{t('common.loading')}</p> : null}
          {error ? <p className="status-error">{error}</p> : null}

          {!isLoading && !error && recentActivities.length === 0 ? (
            <p className="status-message">{t('dashboard.noRecentActivity')}</p>
          ) : null}

          {!isLoading && !error && recentActivities.length > 0 ? (
            <ul className="activity-list">
              {recentActivities.map((item, index) => (
                <li
                  key={item.id}
                  className="activity-item"
                  style={{ backgroundColor: ACTIVITY_COLORS[index % ACTIVITY_COLORS.length] }}
                >
                  <span>{item.label}</span>
                  <small>{formatRelativeTime(item.time, locale, t('format.justNow'))}</small>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="content-panel">
          <h2>{t('dashboard.popular')}</h2>

          {popularTopics.length === 0 ? (
            <p className="status-message">{t('dashboard.noPopular')}</p>
          ) : (
            <ul className="popular-list">
              {popularTopics.map((topic, index) => (
                <li
                  key={getEntityId(topic) ?? topic.title}
                  className="popular-card"
                  style={{ backgroundColor: POPULAR_COLORS[index % POPULAR_COLORS.length] }}
                >
                  <div>
                    <strong>{topic.title ?? t('dashboard.fallbackTopicTitle')}</strong>
                    <small>
                      {toNumber(topic.views, 0)} {t('dashboard.views')}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <div className="panel-footer-actions">
        <Link to="/chatbot" className="button button-primary">
          {t('dashboard.openChatBot')}
        </Link>
        <Link to="/forum" className="button button-secondary">
          {t('dashboard.browseForum')}
        </Link>
      </div>
    </section>
  );
}

export default DashboardPage;
