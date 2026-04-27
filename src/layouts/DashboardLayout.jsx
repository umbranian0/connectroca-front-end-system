import { Outlet, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppNav from '../components/AppNav';
import { useAuth } from '../features/auth/useAuth';

function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const userName = user?.username ?? user?.email ?? 'User';

  return (
    <div className="app-shell">
      <AppHeader userName={userName} onLogout={handleLogout} />
      <AppNav />

      <main className="page-main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
