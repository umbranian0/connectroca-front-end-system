import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PageContainer from './PageContainer';
import { useAuth } from '../features/auth/useAuth';

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-shell">
        <PageContainer title="Loading session" description="Validating your existing token...">
          <p className="status-message">Please wait.</p>
        </PageContainer>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
