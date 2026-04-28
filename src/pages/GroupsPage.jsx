import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchGroupMembers, fetchGroups } from '../api/conectraApi';
import { useAuth } from '../features/auth/useAuth';
import { useI18n } from '../features/i18n/useI18n';
import {
  getAreaLabel,
  getEntityId,
  getRelationOne,
  getUserDisplayName,
  toNumber,
} from '../utils/strapi';

function GroupsPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [groups, setGroups] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [nextGroups, nextMemberships] = await Promise.all([
        fetchGroups(token),
        fetchGroupMembers(token),
      ]);

      setGroups(nextGroups);
      setMemberships(nextMemberships);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('groups.loadError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t, token]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const groupMembersMap = useMemo(() => {
    const map = new Map();

    memberships.forEach((membership) => {
      const group = getRelationOne(membership, 'group');
      const groupId = String(getEntityId(group) ?? '');

      if (!groupId) {
        return;
      }

      const current = map.get(groupId) ?? [];
      current.push(membership);
      map.set(groupId, current);
    });

    return map;
  }, [memberships]);

  const memberGroupIds = useMemo(() => {
    const ids = new Set();

    memberships.forEach((membership) => {
      const membershipUser = getRelationOne(membership, 'user');
      const membershipGroup = getRelationOne(membership, 'group');

      if (membershipUser?.id === user?.id) {
        ids.add(String(getEntityId(membershipGroup) ?? ''));
      }
    });

    return ids;
  }, [memberships, user?.id]);

  return (
    <section className="page-section groups-page">
      <header className="panel-title-row">
        <div>
          <h1>{t('groups.title')}</h1>
          <p>{t('groups.subtitle')}</p>
        </div>

        <button type="button" className="button button-primary">
          + {t('groups.newGroup')}
        </button>
      </header>

      {isLoading ? <p className="status-message">{t('groups.loading')}</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!isLoading && !error && groups.length === 0 ? (
        <p className="status-message">{t('groups.noGroups')}</p>
      ) : null}

      {!isLoading && !error && groups.length > 0 ? (
        <ul className="group-card-list">
          {groups.map((group, index) => {
            const groupId = String(getEntityId(group) ?? '');
            const area = getRelationOne(group, 'area');
            const creator = getRelationOne(group, 'creator');
            const memberList = groupMembersMap.get(groupId) ?? [];
            const memberLimit = Math.max(toNumber(group.memberLimit, 30), 1);
            const occupancy = Math.min((memberList.length / memberLimit) * 100, 100);
            const isMember = memberGroupIds.has(groupId);

            return (
              <li key={groupId || group.name} className="group-card" style={{ '--card-index': index }}>
                <div className="group-card-banner">
                  <strong>{group.name ?? t('groups.unnamedGroup')}</strong>
                  <span>{isMember ? t('groups.alreadyMember') : t('groups.joinGroup')}</span>
                </div>

                <div className="group-card-body">
                  <p>{group.description ?? t('groups.noDescription')}</p>
                  <p>{getAreaLabel(area, t('format.generalArea'))}</p>
                  <p>
                    {memberList.length}/{memberLimit} {t('groups.members')}
                  </p>
                  <p>{group.schedule ?? t('groups.scheduleTbd')}</p>
                  <p>{group.location ?? t('groups.locationTbd')}</p>
                  <p>{getUserDisplayName(creator, t('format.communityMember'))}</p>

                  <div className="group-progress-track">
                    <div style={{ width: `${occupancy}%` }} />
                  </div>

                  <div className="group-actions">
                    <Link to={`/groups/${groupId}/chat`} className="button button-secondary">
                      {t('groups.chat')}
                    </Link>
                    <Link to={`/groups/${groupId}/members`} className="button button-secondary">
                      {t('groups.membersPage')}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <section className="manage-panel">
        <h2>{t('groups.yourGroups')}</h2>
        <ul>
          {groups.slice(0, 5).map((group) => (
            <li key={`manage-${getEntityId(group) ?? group.name}`}>
              <span>{group.name ?? t('groups.unnamedGroup')}</span>
              <div className="manage-actions">
                <button type="button" className="button button-secondary">
                  {t('groups.edit')}
                </button>
                <button type="button" className="button button-danger">
                  {t('groups.delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

export default GroupsPage;
