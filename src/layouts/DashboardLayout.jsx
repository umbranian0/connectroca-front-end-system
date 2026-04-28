import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import AppNav from '../components/AppNav';
import { useAuth } from '../features/auth/useAuth';
import { useI18n } from '../features/i18n/useI18n';

const THEME_STORAGE_KEY = 'connectra_theme';

function getStoredTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const userName = useMemo(
    () => user?.username ?? user?.email ?? t('header.guestUser'),
    [t, user?.email, user?.username],
  );

  return (
    <div className="layout-shell">
      <AppHeader
        userName={userName}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        isDarkTheme={theme === 'dark'}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />

      <div className="layout-body">
        <aside className="sidebar-nav">
          <AppNav />
        </aside>

        <main className="page-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
