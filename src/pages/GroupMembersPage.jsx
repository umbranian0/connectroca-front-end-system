import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchGroupMembers, fetchGroups } from '../api/conectraApi';
import { useAuth } from '../features/auth/useAuth';
import { getEntityId, getRelationOne, getUserDisplayName } from '../utils/strapi';

function GroupMembersPage() {
  const { groupId } = useParams();
  const { token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMembers = useCallback(async () => {
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
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load group participants.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const group = useMemo(
    () => groups.find((entry) => String(getEntityId(entry)) === String(groupId)) ?? null,
    [groupId, groups],
  );

  const members = useMemo(() => {
    return memberships
      .filter((membership) => {
        const relationGroup = getRelationOne(membership, 'group');
        return String(getEntityId(relationGroup)) === String(groupId);
      })
      .map((membership) => ({
        id: getEntityId(membership),
        role: membership.role ?? 'member',
        user: getRelationOne(membership, 'user'),
      }));
  }, [groupId, memberships]);

  return (
    <section className="page-section group-members-page">
      <header className="panel-title-row">
        <div>
          <h1>{group?.name ?? 'Participantes'}</h1>
          <p>Lista de membros do grupo</p>
        </div>

        <Link to={`/groups/${groupId}/chat`} className="button button-secondary">
          Back to chat
        </Link>
      </header>

      {isLoading ? <p className="status-message">Loading participants...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!isLoading && !error && members.length === 0 ? (
        <p className="status-message">No group members were returned.</p>
      ) : null}

      {!isLoading && !error && members.length > 0 ? (
        <ul className="member-list">
          {members.map((member) => (
            <li key={member.id ?? getUserDisplayName(member.user)}>
              <span className="member-avatar" aria-hidden="true">
                ??
              </span>
              <strong>{getUserDisplayName(member.user)}</strong>
              <small>{member.role}</small>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="panel-footer-actions">
        <button type="button" className="button button-danger">
          Sair do Grupo
        </button>
      </div>
    </section>
  );
}

export default GroupMembersPage;
