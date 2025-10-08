import React, { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../logo.svg';
import './NavBar.css';
import { useTheme } from '../theme/ThemeProvider.jsx';

const NavBar = ({ showAdminLink = true }) => {
  const { theme, cycleMode } = useTheme();
  const [anim, setAnim] = useState(false);
  const navLinks = useMemo(() => ([
    { to: '/', label: 'Home' },
    { to: '/track', label: 'Track Shipment' },
    { to: '/contact', label: 'Contact' },
  ]), []);
  const onToggle = () => {
    setAnim(true);
    cycleMode();
    setTimeout(() => setAnim(false), 400);
  };
  return (
    <nav className="nav">
      <div className="nav__inner">
        <div className="nav__left">
          <Link to="/" className="brand">
            <img src={logo} alt="Logo" className="brand__logo" />
            <span className="brand__name">SHREE CARGO SURAT</span>
          </Link>
        </div>
        <ul className="nav__center">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
                end={to === '/'}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="nav__right">
          {showAdminLink && (
            <Link to="/admin" className="btn btn--ghost">Admin Login</Link>
          )}
          <button
            aria-label="Toggle theme"
            title={`Theme: ${theme}`}
            className={`btn theme-toggle ${anim ? 'is-animating' : ''}`}
            onClick={onToggle}
          >
            {theme === 'light' ? (
              // Sun icon
              <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" fill="currentColor"/>
                <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              // Moon icon
              <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
