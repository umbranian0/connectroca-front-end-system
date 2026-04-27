import { Link } from 'react-router-dom';
import { getStrapiBaseUrl } from '../api/httpClient';

function AppHeader({ userName, onLogout }) {
  return (
    <header className="app-header">
      <div>
        <Link to="/activities" className="app-brand">
          Conectra Frontend
        </Link>
        <p className="app-subtitle">Connected to {getStrapiBaseUrl()}</p>
      </div>

      <div className="header-actions">
        <span className="welcome-copy">Hi, {userName}</span>
        <button type="button" className="button button-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
