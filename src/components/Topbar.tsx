// src/components/Topbar.tsx
import React, { type JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';

// ✅ Use Vite import, not hard-coded /assets path
import beeLogo from '../assets/bee_logo.png';

/** We still keep this in case you later want conditional UI from /me */
async function getMeSafe(): Promise<{ isHost: boolean; kycStatus?: string } | null> {
  try {
    const API = import.meta.env.VITE_API_BASE as string;
    const token = localStorage.getItem('token');
    if (!token) return null;
    const r = await fetch(`${API}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'omit',
    });
    if (r.status === 401) return null;
    if (!r.ok) return null;
    const data = await r.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

type NavItem = {
  to: string;
  id: string;
  label: string;
  requiresAuth?: boolean;
};

export default function Topbar({ onOpenLogin }: { onOpenLogin?: () => void }): JSX.Element {
  const [, setMe] = React.useState<{ isHost: boolean; kycStatus?: string } | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const loc = useLocation();

  React.useEffect(() => {
    getMeSafe().then(setMe);
  }, [loc.pathname]);

  const navItems: NavItem[] = [
    { to: '/', id: 'home', label: 'Home' },
    // ✅ Events requires login
    { to: '/events', id: 'events', label: 'Events', requiresAuth: true },
    { to: '/creators', id: 'creators', label: 'Creators' },
    { to: '/studios', id: 'studios', label: 'Studios' },
    { to: '/campaigns', id: 'campaigns', label: 'Campaigns' },
    { to: '/media', id: 'media', label: 'Media' },
  ];

  const currentSection = React.useMemo(() => {
    const seg = loc.pathname.split('/')[1] || 'home';
    return seg === '' ? 'home' : seg;
  }, [loc.pathname]);

  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const showLogout = isAuthenticated;

  function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  // Small helper to gate nav items (like Events) behind login
  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: NavItem,
    isMobile?: boolean,
  ) {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      // Close mobile menu if open
      if (isMobile) setMobileOpen(false);
      onOpenLogin?.();
    } else if (isMobile) {
      setMobileOpen(false);
    }
  }

  return (
    <header className="be-header">
      <div className="be-container">
        {/* Logo */}
        <Link to="/" className="be-logo">
          <img src={beeLogo} alt="Bee Echoo" className="be-logoImg" />
        </Link>

        {/* Desktop nav */}
        <nav className="be-nav">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={`be-navItem ${currentSection === item.id ? 'is-active' : ''}`}
              onClick={(e) => handleNavClick(e, item, false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="be-actions">
          {isAuthenticated ? (
            <Link to="/profile" className="be-cta">
              Profile
            </Link>
          ) : (
            <button className="be-cta" onClick={onOpenLogin}>
              Login
            </button>
          )}

          {showLogout && (
            <button className="be-logout" onClick={logout}>
              Logout
            </button>
          )}

          {/* Mobile toggle */}
          <button
            className="be-mobileBtn"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="be-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" />
              </svg>
            ) : (
              <svg className="be-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="be-mobileNav">
          <div className="be-mobileList">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className={`be-mobileItem ${currentSection === item.id ? 'is-active' : ''}`}
                onClick={(e) => handleNavClick(e, item, true)}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="be-mobileCTA"
                onClick={() => setMobileOpen(false)}
              >
                Profile
              </Link>
            ) : (
              <button
                className="be-mobileCTA"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenLogin?.();
                }}
              >
                Login
              </button>
            )}

            {showLogout && (
              <button
                className="be-mobileLogout"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Consistent BeeEchoo styling */}
      <style>{`
        :root {
          --be-primary: #F6B100;
          --be-primary-soft: #FEF3C7;
          --be-primary-hover: #FACC15;
          --be-bg: #FFFFFF;
          --be-text: #111827;
          --be-subtext: #6B7280;
          --be-border: #E5E7EB;
        }

        /* --- HEADER --- */
        .be-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--be-bg);
          border-bottom: 2px solid #FBBF24;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        }

        .be-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          padding: 0 16px;
          max-width: 1120px;
          margin: 0 auto;
        }

        /* --- LOGO --- */
        .be-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: inherit;
        }

        .be-logoMark {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }

        .be-logoImg {
          width: 180px;
          height: 104px;
          object-fit: contain;
        }

        .be-logoText {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .be-brand {
          font-size: 18px;
          font-weight: 700;
          color: var(--be-text);
        }

        .be-tag {
          font-size: 11px;
          color: var(--be-subtext);
          margin-top: 2px;
        }

        /* --- NAVIGATION --- */
        .be-nav {
          display: none;
          align-items: center;
          gap: 6px;
        }

        .be-navItem {
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 14px;
          text-decoration: none;
          color: var(--be-text);
          transition: background 0.15s ease, color 0.15s ease;
        }

        .be-navItem:hover {
          background: rgba(251,191,36,0.12);
        }

        .be-navItem.is-active {
          background: var(--be-primary);
          color: #111827;
          font-weight: 600;
        }

        /* --- ACTIONS --- */
        .be-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .be-icon {
          width: 20px;
          height: 20px;
          color: var(--be-text);
        }

        .be-cta {
          display: none;
          height: 40px;
          padding: 0 14px;
          border-radius: 999px;
          text-decoration: none;
          background: var(--be-primary);
          color: #111827;
          font-weight: 600;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
          font-size: 14px;
        }

        .be-cta:hover {
          background: var(--be-primary-hover);
        }

        .be-logout {
          display: none;
          height: 40px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid var(--be-border);
          background: #F9FAFB;
          color: var(--be-subtext);
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
        }

        .be-logout:hover {
          background: #F3F4F6;
          color: #B45309;
        }

        /* --- MOBILE TOGGLE --- */
        .be-mobileBtn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          background: #FFFFFF;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .be-mobileBtn:hover {
          background: var(--be-primary-soft);
        }

        /* --- MOBILE NAV --- */
        .be-mobileNav {
          border-top: 1px solid var(--be-border);
          padding: 10px 16px 14px;
          background: #FFFFFF;
        }

        .be-mobileList {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .be-mobileItem {
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: var(--be-text);
          font-size: 14px;
        }

        .be-mobileItem:hover {
          background: rgba(251,191,36,0.12);
        }

        .be-mobileItem.is-active {
          background: var(--be-primary);
          color: #111827;
          font-weight: 600;
        }

        .be-mobileCTA {
          margin-top: 6px;
          padding: 10px 12px;
          border-radius: 999px;
          text-align: center;
          text-decoration: none;
          background: var(--be-primary);
          color: #111827;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .be-mobileCTA:hover {
          background: var(--be-primary-hover);
        }

        .be-mobileLogout {
          margin-top: 6px;
          padding: 10px 12px;
          border-radius: 10px;
          border: none;
          background: transparent;
          text-align: left;
          color: var(--be-subtext);
          cursor: pointer;
          font-size: 14px;
        }

        .be-mobileLogout:hover {
          color: #B45309;
        }

        /* --- DESKTOP RESPONSIVE --- */
        @media (min-width: 1024px) {
          .be-nav {
            display: flex;
          }
          .be-cta,
          .be-logout {
            display: inline-flex;
            align-items: center;
          }
          .be-mobileBtn {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
