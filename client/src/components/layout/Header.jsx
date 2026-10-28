import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SunIcon, MoonIcon, UtensilsIcon, WrenchIcon, UsersIcon, BellIcon, DashboardIcon } from '../common/Icons';

export const Header = ({
  activeTab,
  onTabChange,
  pendingCount = 0,
  onOpenFileComplaint,
  onOpenAuthModal
}) => {
  const { theme, toggleTheme } = useTheme();
  const { role, toggleRole, user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'menu', label: 'Food Menu', icon: <UtensilsIcon /> },
    { id: 'complaints', label: 'Room Complaints', icon: <WrenchIcon />, badge: pendingCount },
    { id: 'wardens', label: 'Warden Contacts', icon: <UsersIcon /> },
    { id: 'notices', label: 'Notice Board', icon: <BellIcon /> }
  ];

  if (role === 'warden') {
    navItems.push({ id: 'admin', label: 'Warden Portal', icon: <DashboardIcon /> });
  }

  return (
    <header className="glass-card">
      <div className="header-top">
        {/* Brand Logo */}
        <div className="brand-title" onClick={() => onTabChange('menu')}>
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
              <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              Hostel<span style={{ color: 'var(--accent-primary)' }}>Hub</span>
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Campus Residence Portal
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="nav-links">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  position: 'relative',
                  padding: '0.55rem 1rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge > 0 && <span className="badge-count">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenFileComplaint}
            className="btn btn-primary"
            style={{ fontSize: '0.88rem' }}
          >
            + File Complaint
          </button>

          {/* Role Toggle */}
          <button
            onClick={toggleRole}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
            title="Switch between Student and Warden View"
          >
            <span style={{ textTransform: 'capitalize' }}>
              {role === 'student' ? 'Student View' : 'Warden View'}
            </span>
          </button>

          {/* Auth Button */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                {user?.name?.split(' ')[0]} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                title="Sign out"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
            >
              Sign In
            </button>
          )}

          {/* Dark/Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '0.55rem', borderRadius: '50%' }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      {/* Emergency Helpline Banner */}
      <div style={{
        marginTop: '1rem',
        padding: '0.4rem 1rem',
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.25)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        fontSize: '0.8rem'
      }}>
      </div>
    </header>
  );
};

export default Header;