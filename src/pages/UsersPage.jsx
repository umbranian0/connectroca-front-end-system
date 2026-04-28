import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUsers } from '../api/usersApi';
import PageContainer from '../components/PageContainer';
import { useAuth } from '../features/auth/useAuth';
import { getUserDisplayName, getUserRoleLabel } from '../utils/strapi';

function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [requiresLogin, setRequiresLogin] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setRequiresLogin(false);

    try {
      const nextUsers = await fetchUsers(token);
      setUsers(nextUsers);
    } catch (requestError) {
      if (requestError?.status === 401 || requestError?.status === 403) {
        setRequiresLogin(true);
        setUsers([]);
        return;
      }

      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load users from Strapi.';
      setError(message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  return (
    <PageContainer
      title="Users"
      description="Public users page. Login is required only if Strapi endpoint permissions are private."
      actions={
        <button type="button" className="button button-secondary" onClick={loadUsers}>
          Refresh
        </button>
      }
    >
      {isLoading ? <p className="status-message">Loading users...</p> : null}
      {!isLoading && error ? <p className="status-error">{error}</p> : null}

      {!isLoading && requiresLogin ? (
        <p className="status-message">
          Users endpoint requires authentication. <Link to="/login" className="status-inline-link">Login</Link> to continue.
        </p>
      ) : null}

      {!isLoading && !error && !requiresLogin && users.length === 0 ? (
        <p className="status-message">No users were returned by Strapi.</p>
      ) : null}

      {!isLoading && !error && !requiresLogin && users.length > 0 ? (
        <ul className="entity-list">
          {users.map((user) => (
            <li key={user.id ?? user.documentId ?? user.email} className="entity-card">
              <h2>{getUserDisplayName(user)}</h2>
              <p>{user.email ?? 'No email'}</p>
              <span className="meta-copy">Role: {getUserRoleLabel(user)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </PageContainer>
  );
}

export default UsersPage;