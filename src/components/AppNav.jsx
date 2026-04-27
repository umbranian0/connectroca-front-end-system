import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/activities', label: 'Activities' },
  { to: '/users', label: 'Users' },
];

function AppNav() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link-active' : 'nav-link'
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AppNav;
