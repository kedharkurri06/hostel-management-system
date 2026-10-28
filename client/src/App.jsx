import React, { useState, useEffect, useCallback } from 'react';
import api from './services/api';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { SunIcon, MoonIcon, MenuIcon, XIcon, UtensilsIcon, WrenchIcon, UsersIcon, BellIcon, DashboardIcon } from './components/common/Icons';
import StatsOverview from './components/dashboard/StatsOverview';
import FoodMenu from './features/menu/FoodMenu';
import ComplaintsTracker from './features/complaints/ComplaintsTracker';
import WardenDirectory from './features/wardens/WardenDirectory';
import NoticeBoard from './features/notices/NoticeBoard';
import AdminDashboard from './features/admin/AdminDashboard';
import GatePassTracker from './features/gatepasses/GatePassTracker';
import StudentDashboard from './features/student/StudentDashboard';
import ComplaintModal from './features/complaints/ComplaintModal';
import UpdateComplaintModal from './features/complaints/UpdateComplaintModal';
import EditMealModal from './features/menu/EditMealModal';
import NoticeModal from './features/notices/NoticeModal';
import AuthModal from './components/common/AuthModal';
import ToastContainer from './components/common/ToastContainer';

export const App = () => {
  const { role, user, isAuthenticated, isWarden, isStudent, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Active tab initialization based on auth role
  const [activeTab, setActiveTab] = useState(() => {
    if (!isAuthenticated) return 'menu';
    return isWarden ? 'admin' : 'studentDashboard';
  });
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Backend state
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    emergency: 0,
    resolutionRate: 0
  });
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Modals state
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Update complaint modal state
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Edit meal modal state
  const [editingMeal, setEditingMeal] = useState(null);
  const [isEditMealModalOpen, setIsEditMealModalOpen] = useState(false);

  // Refresh complaints and stats only when authenticated
  const fetchComplaintsAndStats = useCallback(async () => {
    if (!isAuthenticated) {
      setComplaints([]);
      setStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        emergency: 0,
        resolutionRate: 0
      });
      return;
    }

    try {
      setLoadingComplaints(true);
      const [compRes, statsRes] = await Promise.all([
        api.complaints.getAll({ limit: 100 }),
        api.dashboard.getStats()
      ]);

      if (compRes.success && compRes.data) {
        setComplaints(compRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load complaints or stats:', err.message);
    } finally {
      setLoadingComplaints(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchComplaintsAndStats();
  }, [fetchComplaintsAndStats]);

  // Adjust activeTab when auth state or role changes
  useEffect(() => {
    if (!isAuthenticated) {
      const publicTabs = ['menu', 'notices', 'wardens'];
      if (!publicTabs.includes(activeTab)) {
        setActiveTab('menu');
      }
    } else if (isStudent) {
      const studentTabs = ['studentDashboard', 'gatepasses', 'complaints', 'menu', 'notices', 'wardens'];
      if (!studentTabs.includes(activeTab)) {
        setActiveTab('studentDashboard');
      }
    } else if (isWarden) {
      const wardenTabs = ['admin', 'gatepasses', 'complaints', 'menu', 'notices', 'wardens'];
      if (!wardenTabs.includes(activeTab)) {
        setActiveTab('admin');
      }
    }
  }, [isAuthenticated, isStudent, isWarden, activeTab]);

  // Mobile drawer keyboard accessibility & scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  // Close sidebar on tab change (mobile)
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const handleSelectFilter = (filterKey) => {
    setSelectedFilter(filterKey);
    setActiveTab('complaints');
    setSidebarOpen(false);
  };

  const handleOpenComplaintModal = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsComplaintModalOpen(true);
  };

  const handleOpenNoticeModal = () => {
    setIsNoticeModalOpen(true);
  };

  const handleOpenUpdateComplaintModal = (complaint) => {
    setEditingComplaint(complaint);
    setIsUpdateModalOpen(true);
  };

  const handleOpenEditMeal = (day, mealKey, mealData, menuId) => {
    setEditingMeal({ day, mealKey, mealData, menuId });
    setIsEditMealModalOpen(true);
  };

  const handleLoginSuccess = (userRole) => {
    if (userRole === 'warden') {
      setActiveTab('admin');
    } else {
      setActiveTab('studentDashboard');
    }
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    setActiveTab('menu');
  };

  // Prevent flash of protected UI during initial authentication check
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--background)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--muted-foreground)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏨</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}>
            HostelHub Portal
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Verifying secure session...</div>
        </div>
      </div>
    );
  }

  // Construct Role-based navigation items
  let navItems = [];
  if (!isAuthenticated) {
    // Visitor on Public Landing Page: ONLY Mess Menu, Published Notices, and Warden Contacts
    navItems = [
      { id: 'menu', label: 'Food Menu', icon: <UtensilsIcon /> },
      { id: 'notices', label: 'Notice Board', icon: <BellIcon /> },
      { id: 'wardens', label: 'Warden Contacts', icon: <UsersIcon /> }
    ];
  } else if (isStudent) {
    // Authenticated Student: Student Dashboard, Gate Passes, Complaints, Menu, Notices, Warden Contacts
    navItems = [
      { id: 'studentDashboard', label: 'My Dashboard', icon: <DashboardIcon /> },
      {
        id: 'gatepasses',
        label: 'Gate Passes',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )
      },
      { id: 'complaints', label: 'My Complaints', icon: <WrenchIcon />, badge: stats.pending || 0 },
      { id: 'menu', label: 'Food Menu', icon: <UtensilsIcon /> },
      { id: 'notices', label: 'Notice Board', icon: <BellIcon /> },
      { id: 'wardens', label: 'Warden Contacts', icon: <UsersIcon /> }
    ];
  } else if (isWarden) {
    // Authenticated Warden: Operations Portal, Gate Pass Approvals, Complaints, Menu, Notices, Wardens
    navItems = [
      { id: 'admin', label: 'Warden Portal', icon: <DashboardIcon /> },
      {
        id: 'gatepasses',
        label: 'Gate Passes',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        )
      },
      { id: 'complaints', label: 'Complaints Queue', icon: <WrenchIcon />, badge: stats.pending || 0 },
      { id: 'menu', label: 'Food Menu', icon: <UtensilsIcon /> },
      { id: 'notices', label: 'Notice Board', icon: <BellIcon /> },
      { id: 'wardens', label: 'Warden Contacts', icon: <UsersIcon /> }
    ];
  }

  // Page title map
  const pageTitles = {
    menu: 'Food Menu & Mess Timings',
    notices: 'Notice Board',
    wardens: 'Warden Contacts Directory',
    complaints: isWarden ? 'Room Complaints Queue' : 'My Room Complaints',
    gatepasses: isWarden ? 'Gate Pass Approvals & Log' : 'My Gate Passes',
    admin: 'Warden Operations Portal',
    studentDashboard: 'Student Resident Dashboard'
  };

  return (
    <div className="app-shell">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div
          className="sidebar-brand"
          onClick={() => handleTabChange(isAuthenticated ? (isWarden ? 'admin' : 'studentDashboard') : 'menu')}
        >
          <div className="sidebar-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
              <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <h1>Hostel<span>Hub</span></h1>
            <p>Campus Residence Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}

          {/* Quick Actions (only visible to authenticated users) */}
          {isAuthenticated && (
            <>
              <div className="sidebar-nav-label">Quick Actions</div>
              <button
                onClick={handleOpenComplaintModal}
                className="sidebar-nav-item"
                style={{ color: 'var(--primary)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>File Complaint</span>
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {isAuthenticated ? (
            <div style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius)',
              background: 'var(--sidebar-accent)',
              border: '1px solid var(--sidebar-border)',
              fontSize: '0.78rem'
            }}>
              <div style={{ color: 'var(--sidebar-foreground)', fontWeight: 700 }}>
                {user?.name}
              </div>
              <div style={{ color: 'var(--sidebar-accent-foreground)', fontSize: '0.72rem' }}>
                {user?.studentId ? `ID: ${user.studentId}` : (user?.username || user?.role)}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
            >
              Sign In to Portal
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="top-header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Navigation"
            >
              {sidebarOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
            <h2 className="top-header-title">{pageTitles[activeTab] || 'Portal'}</h2>
          </div>

          <div className="top-header-right">
            {/* Auth status & actions */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
                  <span className="top-header-user-text" style={{
                    fontSize: '0.85rem',
                    color: 'var(--sidebar-primary)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-sans)',
                    maxWidth: '130px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={user?.name}>
                    {user?.name?.split(' ')[0]} {user?.studentId ? `(${user.studentId})` : ''}
                  </span>
                  <span className="badge" style={{
                    background: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.1rem 0.4rem'
                  }}>
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  title="Sign out"
                  style={{ color: 'var(--destructive)', fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                Sign In
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-icon"
              aria-label="Toggle Theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </header>

        {/* Emergency Info Banner */}
        <div className="emergency-banner">
          <div className="emergency-banner-info">
            Warden Office Hours: 9:00 AM - 6:00 PM | Emergency Helpline: 080-23456789
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* Global Metrics Bar: ONLY for Warden on Portal or Complaints */}
          {isAuthenticated && (isWarden && (activeTab === 'admin' || activeTab === 'complaints')) && (
            <StatsOverview
              stats={stats}
              onSelectFilter={handleSelectFilter}
            />
          )}

          {/* Main Content Area */}
          <main id="mainContent">
            {/* Public Visitor & Student & Warden: Food Menu */}
            {activeTab === 'menu' && (
              <FoodMenu onOpenEditMeal={handleOpenEditMeal} />
            )}

            {/* Public Visitor & Student & Warden: Notice Board */}
            {activeTab === 'notices' && (
              <NoticeBoard onOpenNoticeModal={handleOpenNoticeModal} />
            )}

            {/* Public Visitor & Student & Warden: Warden Directory */}
            {activeTab === 'wardens' && (
              <WardenDirectory />
            )}

            {/* Student Protected: Student Dashboard */}
            {activeTab === 'studentDashboard' && isStudent && (
              <StudentDashboard
                complaints={complaints}
                onNavigate={handleTabChange}
                onOpenComplaintModal={handleOpenComplaintModal}
              />
            )}

            {/* Student & Warden Protected: Complaints Tracker */}
            {activeTab === 'complaints' && isAuthenticated && (
              <ComplaintsTracker
                complaints={complaints}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
                onOpenComplaintModal={handleOpenComplaintModal}
                onOpenUpdateComplaintModal={handleOpenUpdateComplaintModal}
                loading={loadingComplaints}
              />
            )}

            {/* Student & Warden Protected: Gate Pass Tracker */}
            {activeTab === 'gatepasses' && isAuthenticated && (
              <GatePassTracker />
            )}

            {/* Warden Protected: Warden Portal */}
            {activeTab === 'admin' && isWarden && (
              <AdminDashboard
                stats={stats}
                complaints={complaints}
                onSetComplaintFilter={handleSelectFilter}
                onOpenUpdateComplaintModal={handleOpenUpdateComplaintModal}
                onNavigate={handleTabChange}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onComplaintCreated={fetchComplaintsAndStats}
      />

      <UpdateComplaintModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setEditingComplaint(null);
        }}
        complaint={editingComplaint}
        onComplaintUpdated={fetchComplaintsAndStats}
      />

      <EditMealModal
        isOpen={isEditMealModalOpen}
        onClose={() => {
          setIsEditMealModalOpen(false);
          setEditingMeal(null);
        }}
        day={editingMeal?.day}
        mealKey={editingMeal?.mealKey}
        mealData={editingMeal?.mealData}
        menuId={editingMeal?.menuId}
        onUpdated={() => {
          // FoodMenu internally handles refetch
        }}
      />

      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onNoticeCreated={() => {
          // NoticeBoard internally handles refetch
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default App;
