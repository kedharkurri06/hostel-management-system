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
import ComplaintModal from './features/complaints/ComplaintModal';
import UpdateComplaintModal from './features/complaints/UpdateComplaintModal';
import EditMealModal from './features/menu/EditMealModal';
import NoticeModal from './features/notices/NoticeModal';
import AuthModal from './components/common/AuthModal';
import ToastContainer from './components/common/ToastContainer';

export const App = () => {
  const { role, toggleRole, user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('menu');
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
  const [loadingComplaints, setLoadingComplaints] = useState(true);

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

  // Refresh complaints and stats from MongoDB
  const fetchComplaintsAndStats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchComplaintsAndStats();
  }, [fetchComplaintsAndStats]);

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

  // Nav items
  const navItems = [
    { id: 'menu', label: 'Food Menu', icon: <UtensilsIcon /> },
    { id: 'complaints', label: 'Complaints', icon: <WrenchIcon />, badge: stats.pending || 0 },
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
    { id: 'wardens', label: 'Warden Contacts', icon: <UsersIcon /> },
    { id: 'notices', label: 'Notice Board', icon: <BellIcon /> }
  ];

  if (role === 'warden') {
    navItems.push({ id: 'admin', label: 'Warden Portal', icon: <DashboardIcon /> });
  }

  // Page title map
  const pageTitles = {
    menu: 'Food Menu',
    complaints: 'Room Complaints',
    gatepasses: 'Gate Passes',
    wardens: 'Warden Contacts',
    notices: 'Notice Board',
    admin: 'Warden Portal'
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
        <div className="sidebar-brand" onClick={() => handleTabChange('menu')}>
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
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* Role Toggle */}
          <button
            onClick={toggleRole}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
            title="Switch between Student and Warden View"
          >
            <span style={{ textTransform: 'capitalize' }}>
              {role === 'student' ? '👨‍🎓 Student View' : '🛡️ Warden View'}
            </span>
          </button>
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
            <h2 className="top-header-title">{pageTitles[activeTab] || 'Dashboard'}</h2>
          </div>

          <div className="top-header-right">
            {/* Auth */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--sidebar-primary)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)'
                }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <span className="badge" style={{
                  background: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                  fontSize: '0.65rem'
                }}>
                  {user?.role}
                </span>
                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm"
                  title="Sign out"
                  style={{ color: 'var(--destructive)', fontSize: '0.78rem' }}
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

        {/* Emergency Helpline Banner */}
        <div className="emergency-banner">
          <div className="emergency-banner-text">
            🛡️ <span>24/7 Hostel Emergency SOS Desk: <strong>+91 94112 00999</strong></span>
          </div>
          <div className="emergency-banner-info">
            Warden Office Hours: 9:00 AM - 6:00 PM | Electrical &amp; Plumbing On-Call
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {/* Global Metrics Bar */}
          <StatsOverview
            stats={stats}
            onSelectFilter={handleSelectFilter}
          />

          {/* Main Content Area */}
          <main id="mainContent">
            {activeTab === 'menu' && (
              <FoodMenu onOpenEditMeal={handleOpenEditMeal} />
            )}

            {activeTab === 'complaints' && (
              <ComplaintsTracker
                complaints={complaints}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
                onOpenComplaintModal={handleOpenComplaintModal}
                onOpenUpdateComplaintModal={handleOpenUpdateComplaintModal}
                loading={loadingComplaints}
              />
            )}

            {activeTab === 'wardens' && (
              <WardenDirectory />
            )}

            {activeTab === 'gatepasses' && (
              <GatePassTracker />
            )}

            {activeTab === 'notices' && (
              <NoticeBoard onOpenNoticeModal={handleOpenNoticeModal} />
            )}

            {activeTab === 'admin' && role === 'warden' && (
              <AdminDashboard
                stats={stats}
                complaints={complaints}
                onSetComplaintFilter={handleSelectFilter}
                onOpenUpdateComplaintModal={handleOpenUpdateComplaintModal}
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
          // FoodMenu internally fetches, or we can trigger re-render
        }}
      />

      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onNoticeCreated={() => {
          // NoticeBoard will refresh
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default App;
