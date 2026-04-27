import { useCallback, useEffect, useState } from 'react';
import { fetchActivities } from '../api/activitiesApi';
import PageContainer from '../components/PageContainer';
import { useAuth } from '../features/auth/useAuth';
import {
  formatDateTime,
  getActivityDescription,
  getActivityKey,
  getActivityTitle,
} from '../utils/strapi';

function ActivitiesPage() {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextActivities = await fetchActivities(token);
      setActivities(nextActivities);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load activities from Strapi.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  return (
    <PageContainer
      title="Activities"
      description="Index page backed by the Strapi activities collection."
      actions={
        <button type="button" className="button button-secondary" onClick={loadActivities}>
          Refresh
        </button>
      }
    >
      {isLoading ? <p className="status-message">Loading activities...</p> : null}
      {!isLoading && error ? <p className="status-error">{error}</p> : null}

      {!isLoading && !error && activities.length === 0 ? (
        <p className="status-message">
          No activities were returned. Verify `VITE_STRAPI_ACTIVITIES_ENDPOINT` and Strapi permissions.
        </p>
      ) : null}

      {!isLoading && !error && activities.length > 0 ? (
        <ul className="entity-list">
          {activities.map((activity) => (
            <li key={getActivityKey(activity)} className="entity-card">
              <h2>{getActivityTitle(activity)}</h2>
              <p>{getActivityDescription(activity)}</p>
              <span className="meta-copy">{formatDateTime(activity.updatedAt ?? activity.createdAt ?? activity.date)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </PageContainer>
  );
}

export default ActivitiesPage;
