import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMaterials } from '../api/conectraApi';
import { useAuth } from '../features/auth/useAuth';
import { useI18n } from '../features/i18n/useI18n';
import {
  formatRelativeTime,
  getEntityId,
  getRelationOne,
  getUserDisplayName,
  toNumber,
} from '../utils/strapi';

function getTypeBadge(type, t) {
  if (type === 'video') {
    return t('materials.typeVideo');
  }

  if (type === 'link') {
    return t('materials.typeLink');
  }

  return t('materials.typeDoc');
}

function MaterialsPage() {
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [materials, setMaterials] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const filterOptions = useMemo(
    () => [
      { key: 'all', label: t('materials.filterAll') },
      { key: 'doc', label: t('materials.filterDocs') },
      { key: 'video', label: t('materials.filterVideos') },
      { key: 'link', label: t('materials.filterLinks') },
    ],
    [t],
  );

  const loadMaterials = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextMaterials = await fetchMaterials(token);
      setMaterials(nextMaterials);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('materials.loadError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    void loadMaterials();
  }, [loadMaterials]);

  const filteredMaterials = useMemo(() => {
    const copy = [...materials].sort(
      (a, b) =>
        new Date(b.publicationDate ?? b.createdAt ?? 0).getTime() -
        new Date(a.publicationDate ?? a.createdAt ?? 0).getTime(),
    );

    if (activeFilter === 'all') {
      return copy;
    }

    return copy.filter((material) => material.type === activeFilter);
  }, [activeFilter, materials]);

  return (
    <section className="page-section materials-page">
      <header className="panel-title-row">
        <div>
          <h1>{t('materials.title')}</h1>
          <p>{t('materials.subtitle')}</p>
        </div>

        <button type="button" className="button button-secondary" onClick={loadMaterials}>
          {t('common.refresh')}
        </button>
      </header>

      <div className="chip-row">
        {filterOptions.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={activeFilter === filter.key ? 'chip chip-active' : 'chip'}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? <p className="status-message">{t('materials.loading')}</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!isLoading && !error && filteredMaterials.length === 0 ? (
        <p className="status-message">{t('materials.noMaterials')}</p>
      ) : null}

      {!isLoading && !error && filteredMaterials.length > 0 ? (
        <ul className="material-list">
          {filteredMaterials.map((material) => {
            const author = getRelationOne(material, 'author');

            return (
              <li key={getEntityId(material) ?? material.title} className="material-card">
                <div className="material-card-top">
                  <span className="material-icon">{getTypeBadge(material.type, t)}</span>
                </div>

                <div className="material-card-bottom">
                  <div>
                    <strong>{material.title ?? t('materials.untitled')}</strong>
                    <p>
                      {getUserDisplayName(author, t('format.communityMember'))} ·{' '}
                      {formatRelativeTime(material.publicationDate ?? material.createdAt, locale, t('format.justNow'))}
                    </p>
                  </div>

                  <div className="material-meta">
                    <span>
                      {toNumber(material.views, 0)} {t('materials.views')}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

export default MaterialsPage;
