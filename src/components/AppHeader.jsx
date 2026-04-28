import { Link } from 'react-router-dom';
import { getStrapiBaseUrl } from '../api/httpClient';
import { useI18n } from '../features/i18n/useI18n';

function AppHeader({ userName, isAuthenticated, onLogout, isDarkTheme, onToggleTheme }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="app-header">
      <div className="brand-wrap">
        <Link to="/" className="app-brand">
          <span className="brand-mark">CT</span>
          <span>
            <strong>ConnectTroca</strong>
            <small>{t('header.brandTagline')}</small>
          </span>
        </Link>
      </div>

      <div className="header-actions">
        <div className="language-switch" aria-label={t('header.language')}>
          <button
            type="button"
            className={language === 'pt' ? 'language-button language-button-active' : 'language-button'}
            onClick={() => setLanguage('pt')}
          >
            PT
          </button>
          <button
            type="button"
            className={language === 'en' ? 'language-button language-button-active' : 'language-button'}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          title={isDarkTheme ? t('header.themeToLight') : t('header.themeToDark')}
          aria-label={isDarkTheme ? t('header.themeToLight') : t('header.themeToDark')}
        >
          {isDarkTheme ? 'L' : 'D'}
        </button>

        {isAuthenticated ? (
          <>
            <span className="welcome-copy">{userName}</span>
            <button type="button" className="button button-secondary" onClick={onLogout}>
              {t('header.logout')}
            </button>
          </>
        ) : (
          <Link to="/login" className="button button-primary">
            {t('header.login')}
          </Link>
        )}
      </div>

      <p className="app-subtitle">
        {t('header.apiLabel')}: {getStrapiBaseUrl()}
      </p>
    </header>
  );
}

export default AppHeader;
