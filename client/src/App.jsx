import React, { useState, useEffect, useCallback } from 'react';
import api from './services/api';
import { useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import StatsOverview from './components/dashboard/StatsOverview';
import FoodMenu from './features/menu/FoodMenu';
import ComplaintsTracker from './features/complaints/ComplaintsTracker';
import WardenDirectory from './features/wardens/WardenDirectory';
import NoticeBoard from './features/notices/NoticeBoard';
import AdminDashboard from './features/admin/AdminDashboard';
import ComplaintModal from './features/complaints/ComplaintModal';
import UpdateComplaintModal from './features/complaints/UpdateComplaintModal';
import EditMealModal from './features/menu/EditMealModal';
import NoticeModal from './features/notices/NoticeModal';
import AuthModal from './components/common/AuthModal';
import ToastContainer from './components/common/ToastContainer';

export const App = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedFilter, setSelectedFilter] = useState('All');

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

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Filter setter from stats cards
  const handleSelectFilter = (filterKey) => {
    setSelectedFilter(filterKey);
    setActiveTab('complaints');
  };

  // Modal open handlers
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

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={stats.pending || 0}
        onOpenFileComplaint={handleOpenComplaintModal}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

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
