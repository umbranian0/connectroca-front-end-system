import { NavLink } from 'react-router-dom';
import { useI18n } from '../features/i18n/useI18n';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home', icon: 'H' },
  { to: '/forum', labelKey: 'nav.forum', icon: 'F' },
  { to: '/materials', labelKey: 'nav.materials', icon: 'M' },
  { to: '/groups', labelKey: 'nav.groups', icon: 'G' },
  { to: '/examples/forms', labelKey: 'nav.examples', icon: 'X' },
  { to: '/profile', labelKey: 'nav.profile', icon: 'P' },
];

function NavItem({ item }) {
  const { t } = useI18n();

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
    >
      <span className="nav-icon" aria-hidden="true">
        {item.icon}
      </span>
      <span>{t(item.labelKey)}</span>
    </NavLink>
  );
}

function AppNav() {
  return (
    <>
      <nav className="app-nav app-nav-desktop" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      <nav className="app-nav app-nav-mobile" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => (
          <NavItem key={`mobile-${item.to}`} item={item} />
        ))}
      </nav>
    </>
  );
}

export default AppNav;
