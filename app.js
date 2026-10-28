// Hostel Hub Management Application - Core JavaScript Engine

(function () {
  // Days Definition
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Application State
  let state = {
    theme: localStorage.getItem('hostel_theme') || 'dark',
    role: localStorage.getItem('hostel_role') || 'student', // 'student' or 'warden'
    activeTab: 'menu', // 'menu', 'complaints', 'wardens', 'notices', 'admin'
    selectedFilter: 'All', // 'All', 'Pending', 'In Progress', 'Resolved', 'Emergency'
    categoryFilter: 'All',
    searchQuery: '',
    selectedDay: DAYS[(new Date().getDay() + 6) % 7], // Current day (Monday = 0)
    
    // Persistent Collections
    menuData: JSON.parse(localStorage.getItem('hostel_menu')) || initialMenu,
    complaints: JSON.parse(localStorage.getItem('hostel_complaints')) || initialComplaints,
    notices: JSON.parse(localStorage.getItem('hostel_notices')) || initialNotices,
    
    // Temporary Edit Modal State
    editingComplaintId: null,
    editingMealKey: null
  };

  // SVG Icons Helpers
  const SVG = {
    utensils: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2v20M14 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2M10 2v10M6 2v10M18 10v12"/></svg>`,
    wrench: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    users: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    bell: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    dashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="15" width="7" height="6"/></svg>`,
    plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    phone: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
  };

  // Toast Notification Trigger
  function addToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      ${type === 'success' ? SVG.check : SVG.info}
      <span style="font-size: 0.88rem; font-weight: 600;">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  // LocalStorage Persist Helpers
  function saveState() {
    localStorage.setItem('hostel_theme', state.theme);
    localStorage.setItem('hostel_role', state.role);
    localStorage.setItem('hostel_menu', JSON.stringify(state.menuData));
    localStorage.setItem('hostel_complaints', JSON.stringify(state.complaints));
    localStorage.setItem('hostel_notices', JSON.stringify(state.notices));
  }

  // DOM Elements Initialization
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    renderNavbar();
    renderStats();
    renderActiveTab();
    setupGlobalEventListeners();
  });

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = state.theme === 'dark' ? SVG.sun : SVG.moon;
    }
  }

  function renderNavbar() {
    const navItems = [
      { id: 'menu', label: 'Food Menu', icon: SVG.utensils },
      { id: 'complaints', label: 'Room Complaints', icon: SVG.wrench, badge: state.complaints.filter(c => c.status === 'Pending').length },
      { id: 'wardens', label: 'Warden Contacts', icon: SVG.users },
      { id: 'notices', label: 'Notice Board', icon: SVG.bell }
    ];

    if (state.role === 'warden') {
      navItems.push({ id: 'admin', label: 'Warden Portal', icon: SVG.dashboard });
    }

    const navContainer = document.getElementById('navbarLinks');
    if (navContainer) {
      navContainer.innerHTML = navItems.map(item => `
        <button
          data-action="switchTab"
          data-tab="${item.id}"
          class="btn ${state.activeTab === item.id ? 'btn-primary' : 'btn-secondary'}"
          style="position: relative; padding: 0.55rem 1rem; font-size: 0.88rem; border-radius: 10px;"
        >
          ${item.icon}
          <span>${item.label}</span>
          ${item.badge > 0 ? `<span class="badge-count">${item.badge}</span>` : ''}
        </button>
      `).join('');
    }

    // Role button update
    const roleBtn = document.getElementById('roleToggleBtn');
    if (roleBtn) {
      roleBtn.innerHTML = `
        <span style="text-transform: capitalize;">
          ${state.role === 'student' ? 'Student View' : 'Warden View'}
        </span>
      `;
    }
  }

  function renderStats() {
    const total = state.complaints.length;
    const pending = state.complaints.filter(c => c.status === 'Pending').length;
    const inProgress = state.complaints.filter(c => c.status === 'In Progress').length;
    const resolved = state.complaints.filter(c => c.status === 'Resolved').length;
    const emergency = state.complaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length;

    const statsContainer = document.getElementById('statsOverviewContainer');
    if (!statsContainer) return;

    let html = '';

    if (emergency > 0) {
      html += `
        <div style="
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(185, 28, 28, 0.4));
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 12px;
          padding: 0.85rem 1.25rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fca5a5;
          box-shadow: 0 4px 20px rgba(220, 38, 38, 0.2);
        ">
          <div>
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #ffffff;">
              🔥 ${emergency} Emergency Complaint${emergency > 1 ? 's' : ''} Require Immediate Attention!
            </h4>
            <p style="margin: 0; font-size: 0.82rem; color: #fca5a5;">
              High-priority issues like major pipe bursts or electrical hazards flagged for urgent dispatch.
            </p>
          </div>
          <button 
            data-action="setComplaintFilter"
            data-filter="Emergency"
            class="btn btn-sm"
            style="background: #ef4444; color: #ffffff; border: none; font-weight: 700;"
          >
            View Urgent
          </button>
        </div>
      `;
    }

    const cards = [
      { title: 'Total Complaints', count: total, color: 'var(--accent-primary)', key: 'All', subtitle: 'Recorded issues' },
      { title: 'Active Pending', count: pending, color: 'var(--accent-warning)', key: 'Pending', subtitle: 'Awaiting assignment' },
      { title: 'In Progress', count: inProgress, color: 'var(--accent-secondary)', key: 'In Progress', subtitle: 'Technician dispatched' },
      { title: 'Resolved', count: resolved, color: 'var(--accent-success)', key: 'Resolved', subtitle: `${total > 0 ? Math.round((resolved / total) * 100) : 0}% resolution rate` }
    ];

    html += `<div class="grid-4">`;
    cards.forEach(c => {
      html += `
        <div 
          class="glass-card"
          data-action="setComplaintFilter"
          data-filter="${c.key}"
          style="padding: 1.25rem; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid ${c.color};"
        >
          <div>
            <span style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 600;">${c.title}</span>
            <h2 style="font-size: 1.8rem; font-weight: 800; margin: 0.2rem 0; color: var(--text-primary);">${c.count}</h2>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${c.subtitle}</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    statsContainer.innerHTML = html;
  }

  function renderActiveTab() {
    const tabs = ['menu', 'complaints', 'wardens', 'notices', 'admin'];
    tabs.forEach(tab => {
      const el = document.getElementById(`tab-${tab}`);
      if (el) {
        if (tab === state.activeTab) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    if (state.activeTab === 'menu') renderFoodMenu();
    if (state.activeTab === 'complaints') renderComplaintsTracker();
    if (state.activeTab === 'wardens') renderWardenDirectory();
    if (state.activeTab === 'notices') renderNoticeBoard();
    if (state.activeTab === 'admin' && state.role === 'warden') renderAdminDashboard();
  }

  // --- RENDER FOOD MENU ---
  function renderFoodMenu() {
    const container = document.getElementById('tab-menu');
    if (!container) return;

    const dayMenu = state.menuData[state.selectedDay] || {};
    const currentDayName = DAYS[(new Date().getDay() + 6) % 7];

    const mealMeta = [
      { key: 'breakfast', label: 'Breakfast', color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))' },
      { key: 'lunch', label: 'Lunch', color: '#06b6d4', gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.05))' },
      { key: 'snacks', label: 'Evening Snacks', color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.05))' },
      { key: 'dinner', label: 'Dinner', color: '#ec4899', gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.05))' }
    ];

    let html = `
      <!-- Header Banner -->
      <div class="glass-card" style="padding: 1.75rem; margin-bottom: 1.75rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(6, 182, 212, 0.12)); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
            <span class="badge" style="background: var(--accent-primary); color: #ffffff;">Hostel Mess Schedule</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Weekly Culinary Rotation</span>
          </div>
          <h2 style="font-size: 1.8rem; font-weight: 800; margin: 0;">Daily Food & Nutrition Menu</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.3rem;">Freshly prepared meals meeting nutritional guidelines for residents.</p>
        </div>

        <div style="background: var(--bg-secondary); padding: 0.85rem 1.25rem; border-radius: 14px; border: 1px solid var(--accent-primary); display: flex; align-items: center; gap: 0.75rem;">
          <div>
            <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--accent-primary); font-weight: 800;">Current Active Schedule</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${currentDayName} (Today)</div>
          </div>
        </div>
      </div>

      <!-- Days Tabs -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.75rem; overflow-x: auto; padding-bottom: 0.5rem;">
        ${DAYS.map(day => {
          const isSelected = state.selectedDay === day;
          const isToday = currentDayName === day;
          return `
            <button
              data-action="selectMenuDay"
              data-day="${day}"
              class="glass-card"
              style="
                padding: 0.75rem 1.25rem;
                border: ${isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)'};
                background: ${isSelected ? 'var(--accent-primary)' : 'var(--bg-card)'};
                color: ${isSelected ? '#ffffff' : 'var(--text-primary)'};
                cursor: pointer;
                border-radius: 12px;
                font-weight: 700;
                font-size: 0.92rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                white-space: nowrap;
              "
            >
              <span>${day}</span>
              ${isToday ? `<span style="font-size: 0.65rem; background: ${isSelected ? '#ffffff' : 'var(--accent-success)'}; color: ${isSelected ? 'var(--accent-primary)' : '#ffffff'}; padding: 0.15rem 0.45rem; border-radius: 999px; font-weight: 800;">TODAY</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Meals Grid -->
      <div class="grid-2" style="margin-bottom: 2rem;">
        ${mealMeta.map(({ key, label, color, gradient }) => {
          const mealData = dayMenu[key] || { time: 'N/A', items: [], type: 'Veg' };
          return `
            <div className="glass-card" style="padding: 1.5rem; background: ${gradient}; border-top: 4px solid ${color};">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <h3 style="margin: 0; font-size: 1.2rem; font-weight: 700;">${label}</h3>
                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.15rem;">${mealData.time}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge" style="background: ${mealData.type.toLowerCase().includes('non-veg') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${mealData.type.toLowerCase().includes('non-veg') ? '#f87171' : '#34d399'}; font-size: 0.7rem;">
                    ${mealData.type}
                  </span>
                  ${state.role === 'warden' ? `
                    <button data-action="openEditMealModal" data-day="${state.selectedDay}" data-meal="${key}" class="btn btn-primary btn-sm" style="font-size: 0.78rem;">
                      Edit Menu
                    </button>
                  ` : ''}
                </div>
              </div>

              <div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${mealData.items.map((item, i) => `
                    <li style="display: flex; align-items: center; gap: 0.6rem; padding: 0.45rem 0; border-bottom: ${i < mealData.items.length - 1 ? '1px solid var(--glass-border)' : 'none'}; font-size: 0.93rem; color: var(--text-primary);">
                      <div style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></div>
                      <span>${item}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Guidelines -->
      <div class="glass-card" style="padding: 1.5rem; background: var(--bg-secondary);">
        <h4 style="margin: 0 0 0.75rem 0; font-size: 1.05rem; font-weight: 700;">Mess Rules & Dining Guidelines</h4>
        <div class="grid-3" style="font-size: 0.85rem; color: var(--text-secondary);">
          <div><strong>Guest Meal Coupons:</strong> Available at Mess Desk till 11:00 AM for Lunch and 6:00 PM for Dinner. ₹120 per guest meal.</div>
          <div><strong>Cleanliness & Recycling:</strong> Please return tray and cutlery to the designated wash counter after finishing your meal.</div>
          <div><strong>Special Dietary Needs:</strong> Students requiring sick diet (Khichdi/Curd Rice) can request the Mess Supervisor 1 hour prior.</div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // --- RENDER COMPLAINTS TRACKER ---
  function renderComplaintsTracker() {
    const container = document.getElementById('tab-complaints');
    if (!container) return;

    const filtered = state.complaints.filter(item => {
      if (state.selectedFilter === 'Pending' && item.status !== 'Pending') return false;
      if (state.selectedFilter === 'In Progress' && item.status !== 'In Progress') return false;
      if (state.selectedFilter === 'Resolved' && item.status !== 'Resolved') return false;
      if (state.selectedFilter === 'Emergency' && item.priority !== 'Emergency') return false;

      if (state.categoryFilter !== 'All' && item.category !== state.categoryFilter) return false;

      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchRoom = item.roomNo.toLowerCase().includes(q);
        const matchName = item.studentName.toLowerCase().includes(q);
        const matchBlock = item.block.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchId && !matchRoom && !matchName && !matchBlock && !matchDesc) return false;
      }

      return true;
    });

    let html = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0;">Room Maintenance & Complaints</h2>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 0.2rem;">Real-time status tracking for AC, plumbing, electrical, and facility issues.</p>
        </div>
        <button data-action="openComplaintModal" class="btn btn-primary">
          ${SVG.plus} Register New Complaint
        </button>
      </div>

      <!-- Filters & Search Bar -->
      <div class="glass-card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${['All', 'Pending', 'In Progress', 'Resolved', 'Emergency'].map(s => {
              const isActive = state.selectedFilter === s;
              const count = s === 'All' ? state.complaints.length : s === 'Emergency' ? state.complaints.filter(c => c.priority === 'Emergency').length : state.complaints.filter(c => c.status === s).length;
              return `
                <button
                  data-action="setComplaintFilter"
                  data-filter="${s}"
                  class="btn ${isActive ? 'btn-primary' : 'btn-secondary'}"
                  style="padding: 0.45rem 0.85rem; font-size: 0.82rem; border-radius: 8px;"
                >
                  <span>${s}</span>
                  <span style="background: ${isActive ? '#ffffff' : 'var(--glass-border)'}; color: ${isActive ? 'var(--accent-primary)' : 'var(--text-secondary)'}; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800;">${count}</span>
                </button>
              `;
            }).join('')}
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; flex: 1; max-width: 500px;">
            <input
              type="text"
              id="complaintSearchInput"
              class="input-field"
              placeholder="Search room no, ticket ID, name..."
              style="font-size: 0.85rem; flex: 1;"
              value="${state.searchQuery}"
            />

            <select
              id="complaintCategorySelect"
              class="select-field"
              style="width: auto; font-size: 0.85rem;"
            >
              <option value="All" ${state.categoryFilter === 'All' ? 'selected' : ''}>All Categories</option>
              <option value="AC" ${state.categoryFilter === 'AC' ? 'selected' : ''}>AC / HVAC</option>
              <option value="Water" ${state.categoryFilter === 'Water' ? 'selected' : ''}>Plumbing / Water</option>
              <option value="Electrical" ${state.categoryFilter === 'Electrical' ? 'selected' : ''}>Electrical</option>
              <option value="Wi-Fi" ${state.categoryFilter === 'Wi-Fi' ? 'selected' : ''}>Wi-Fi / Network</option>
              <option value="Cleanliness" ${state.categoryFilter === 'Cleanliness' ? 'selected' : ''}>Cleanliness</option>
              <option value="Furniture" ${state.categoryFilter === 'Furniture' ? 'selected' : ''}>Furniture</option>
              <option value="Pest Control" ${state.categoryFilter === 'Pest Control' ? 'selected' : ''}>Pest Control</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Complaints Grid -->
      ${filtered.length === 0 ? `
        <div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted);">
          <h3 style="margin: 0; color: var(--text-primary);">No Complaints Found</h3>
          <p style="font-size: 0.9rem; margin-top: 0.3rem;">There are no room complaints matching your selected criteria.</p>
        </div>
      ` : `
        <div class="grid-2">
          ${filtered.map(item => {
            const isEmergency = item.priority === 'Emergency';
            let badgeClass = 'badge-pending';
            if (item.status === 'In Progress') badgeClass = 'badge-in-progress';
            if (item.status === 'Resolved') badgeClass = 'badge-resolved';
            if (isEmergency && item.status !== 'Resolved') badgeClass = 'badge-emergency';

            return `
              <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; ${isEmergency && item.status !== 'Resolved' ? 'border-left: 4px solid #ef4444;' : ''}">
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-size: 0.78rem; font-weight: 800; color: var(--text-muted);">${item.id}</span>
                      <span class="priority-tag priority-${item.priority}">${item.priority}</span>
                    </div>
                    <span class="badge ${badgeClass}">${item.status}</span>
                  </div>

                  <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700;">Room ${item.roomNo} &bull; ${item.block}</h3>
                  <span style="font-size: 0.78rem; color: var(--text-secondary);">Category: <strong>${item.category}</strong></span>

                  <p style="font-size: 0.9rem; color: var(--text-primary); background: var(--bg-secondary); padding: 0.75rem; border-radius: 8px; margin: 0.75rem 0 1rem 0; line-height: 1.45;">
                    ${item.description}
                  </p>

                  <div style="font-size: 0.82rem; color: var(--text-secondary); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
                    <div><span style="color: var(--text-muted);">Resident:</span> <strong>${item.studentName}</strong></div>
                    <div><span style="color: var(--text-muted);">Contact:</span> <strong>${item.phone}</strong></div>
                    <div><span style="color: var(--text-muted);">Time Slot:</span> <strong>${item.visitTimeSlot}</strong></div>
                    <div><span style="color: var(--text-muted);">Filed:</span> <strong>${new Date(item.createdAt).toLocaleDateString()}</strong></div>
                  </div>

                  <div style="padding: 0.75rem; border-radius: 8px; background: rgba(99, 102, 241, 0.08); border: 1px dashed rgba(99, 102, 241, 0.25); font-size: 0.82rem; margin-bottom: 1rem;">
                    <div style="color: var(--accent-primary); font-weight: 700;">Assigned Staff: ${item.assignedTo || 'Pending Dispatch'}</div>
                    ${item.resolutionNotes ? `<div style="color: var(--text-secondary); margin-top: 0.3rem;"><strong>Resolution Note:</strong> ${item.resolutionNotes}</div>` : ''}
                  </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--glass-border); padding-top: 0.85rem;">
                  <a href="tel:${item.phone}" class="btn btn-secondary btn-sm" style="font-size: 0.78rem;">
                    ${SVG.phone} Call Resident
                  </a>
                  ${state.role === 'warden' ? `
                    <button data-action="openUpdateComplaintModal" data-id="${item.id}" class="btn btn-primary btn-sm" style="font-size: 0.78rem;">
                      Update Status
                    </button>
                  ` : `<span style="font-size: 0.75rem; color: var(--text-muted);">Updated by Warden</span>`}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    container.innerHTML = html;
  }

  // --- RENDER WARDEN DIRECTORY ---
  function renderWardenDirectory() {
    const container = document.getElementById('tab-wardens');
    if (!container) return;

    let html = `
      <div style="margin-bottom: 1.75rem;">
        <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0;">Warden & Administration Contacts</h2>
        <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 0.2rem;">Official contact directory for campus wardens, hostel officers, and 24/7 maintenance desks.</p>
      </div>

      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Hostel Wardens Directory</h3>
      <div class="grid-2" style="margin-bottom: 2.5rem;">
        ${initialWardens.map(w => `
          <div class="glass-card" style="padding: 1.5rem; display: flex; gap: 1.25rem; align-items: flex-start;">
            <img src="${w.avatar}" alt="${w.name}" style="width: 76px; height: 76px; border-radius: 16px; object-fit: cover; border: 2px solid var(--accent-primary);" />
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem;">
                <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 0.72rem;">${w.block}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">ID: ${w.id.toUpperCase()}</span>
              </div>
              <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0;">${w.name}</h3>
              <div style="font-size: 0.85rem; color: var(--accent-primary); font-weight: 600; margin-bottom: 0.75rem;">${w.role}</div>
              <div style="font-size: 0.83rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem;">
                <div>📍 ${w.office}</div>
                <div>🕒 ${w.hours}</div>
              </div>
              <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                <a href="tel:${w.phone}" class="btn btn-primary btn-sm" style="font-size: 0.78rem;">${SVG.phone} Call ${w.phone}</a>
                <a href="mailto:${w.email}" class="btn btn-secondary btn-sm" style="font-size: 0.78rem;">Email</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem;">Essential Maintenance & Emergency Technicians</h3>
      <div class="grid-3">
        ${initialStaff.map(st => `
          <div class="glass-card" style="padding: 1.25rem;">
            <h4 style="margin: 0; font-size: 1rem; font-weight: 700;">${st.name}</h4>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${st.designation}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.85rem;">
              Availability: <strong style="color: var(--accent-success);">${st.availability}</strong>
            </div>
            <a href="tel:${st.phone}" class="btn btn-secondary btn-sm" style="width: 100%; justify-content: center; font-size: 0.8rem;">
              ${SVG.phone} Call ${st.phone}
            </a>
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = html;
  }

  // --- RENDER NOTICE BOARD ---
  function renderNoticeBoard() {
    const container = document.getElementById('tab-notices');
    if (!container) return;

    let html = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0;">Hostel Notice Board & Circulars</h2>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 0.2rem;">Official announcements regarding water cleaning, power maintenance, and mess updates.</p>
        </div>
        ${state.role === 'warden' ? `
          <button data-action="openNoticeModal" class="btn btn-primary">
            ${SVG.plus} Post Official Circular
          </button>
        ` : ''}
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${state.notices.map(n => `
          <div class="glass-card" style="padding: 1.5rem; border-left: ${n.priority === 'High' ? '4px solid #ef4444' : '4px solid var(--accent-primary)'};">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 0.72rem;">${n.category}</span>
                ${n.priority === 'High' ? `<span class="badge badge-emergency" style="font-size: 0.68rem;">URGENT NOTICE</span>` : ''}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">📅 ${n.date}</div>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0 0 0.5rem 0;">${n.title}</h3>
            <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">${n.content}</p>
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = html;
  }

  // --- RENDER ADMIN DASHBOARD ---
  function renderAdminDashboard() {
    const container = document.getElementById('tab-admin');
    if (!container) return;

    const total = state.complaints.length;
    const pending = state.complaints.filter(c => c.status === 'Pending');
    const resolved = state.complaints.filter(c => c.status === 'Resolved');
    const emergency = state.complaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved');
    const resolutionRate = total > 0 ? Math.round((resolved.length / total) * 100) : 0;

    let html = `
      <div class="glass-card" style="padding: 1.75rem; margin-bottom: 1.75rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15)); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="badge" style="background: var(--accent-success); color: #ffffff;">Warden Administration Portal</span>
          <h2 style="font-size: 1.8rem; font-weight: 800; margin: 0.4rem 0 0 0;">Hostel Operations & Maintenance Control</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.2rem;">Monitor complaint resolution velocity, dispatch technicians, and manage mess menus.</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 2rem; font-weight: 800; color: var(--accent-success);">${resolutionRate}%</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Overall Resolution Speed</div>
        </div>
      </div>

      <div class="glass-card" style="padding: 1.5rem; margin-bottom: 2rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">Pending Dispatch Queue</h3>
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
          There are currently <strong style="color: var(--accent-warning);">${pending.length} unassigned tickets</strong> and <strong style="color: #ef4444;">${emergency.length} emergency requests</strong> requiring staff assignment.
        </div>
        <button data-action="setComplaintFilter" data-filter="Pending" class="btn btn-primary">
          Dispatch Staff to Pending (${pending.length})
        </button>
      </div>

      <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem;">Unassigned / Active Complaint Queue</h3>
      <div class="glass-card" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--glass-border); color: var(--text-secondary);">
              <th style="padding: 0.85rem 1rem;">Ticket ID</th>
              <th style="padding: 0.85rem 1rem;">Room & Block</th>
              <th style="padding: 0.85rem 1rem;">Category</th>
              <th style="padding: 0.85rem 1rem;">Priority</th>
              <th style="padding: 0.85rem 1rem;">Resident Contact</th>
              <th style="padding: 0.85rem 1rem;">Status</th>
              <th style="padding: 0.85rem 1rem;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.complaints.filter(c => c.status !== 'Resolved').map(c => `
              <tr style="border-bottom: 1px solid var(--glass-border);">
                <td style="padding: 0.85rem 1rem; font-weight: 700;">${c.id}</td>
                <td style="padding: 0.85rem 1rem;">Room ${c.roomNo} (${c.block})</td>
                <td style="padding: 0.85rem 1rem;">${c.category}</td>
                <td style="padding: 0.85rem 1rem;"><span class="priority-tag priority-${c.priority}">${c.priority}</span></td>
                <td style="padding: 0.85rem 1rem;">${c.studentName} (${c.phone})</td>
                <td style="padding: 0.85rem 1rem;"><span class="badge ${c.status === 'Pending' ? 'badge-pending' : 'badge-in-progress'}">${c.status}</span></td>
                <td style="padding: 0.85rem 1rem;">
                  <button data-action="openUpdateComplaintModal" data-id="${c.id}" class="btn btn-secondary btn-sm">Assign & Resolve</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  }

  // Global Action Handlers bound to window
  window.switchTab = function (tabId) {
    state.activeTab = tabId;
    renderNavbar();
    renderActiveTab();
  };

  window.toggleTheme = function () {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveState();
    addToast(`Switched to ${state.theme.toUpperCase()} mode`, 'info');
  };

  window.toggleRole = function () {
    state.role = state.role === 'student' ? 'warden' : 'student';
    renderNavbar();
    renderActiveTab();
    saveState();
    addToast(`Switched to ${state.role.toUpperCase()} View`, 'info');
  };

  window.selectMenuDay = function (day) {
    state.selectedDay = day;
    renderFoodMenu();
  };

  window.setComplaintFilter = function (filterKey) {
    state.activeTab = 'complaints';
    state.selectedFilter = filterKey;
    renderNavbar();
    renderActiveTab();
  };

  window.setCategoryFilter = function (cat) {
    state.categoryFilter = cat;
    renderComplaintsTracker();
  };

  window.setSearchQuery = function (query) {
    state.searchQuery = query;
    renderComplaintsTracker();
  };

  // --- MODALS EVENT LISTENERS ---
  function setupGlobalEventListeners() {
    // Global delegated click listener for data-action elements (CSP-compliant, no inline evals)
    document.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;

      const action = actionEl.getAttribute('data-action');

      switch (action) {
        case 'switchTab': {
          const tab = actionEl.getAttribute('data-tab');
          if (tab) {
            state.activeTab = tab;
            renderNavbar();
            renderActiveTab();
          }
          break;
        }
        case 'toggleRole': {
          state.role = state.role === 'student' ? 'warden' : 'student';
          saveState();
          renderNavbar();
          renderStats();
          renderActiveTab();
          addToast(`Switched view to ${state.role.toUpperCase()}`, 'info');
          break;
        }
        case 'toggleTheme': {
          state.theme = state.theme === 'dark' ? 'light' : 'dark';
          applyTheme();
          saveState();
          break;
        }
        case 'openComplaintModal': {
          openModal('complaintModal');
          break;
        }
        case 'openNoticeModal': {
          openModal('noticeModal');
          break;
        }
        case 'closeModal': {
          const modalId = actionEl.getAttribute('data-modal');
          if (modalId) closeModal(modalId);
          break;
        }
        case 'setComplaintFilter': {
          const filter = actionEl.getAttribute('data-filter');
          if (filter) {
            state.selectedFilter = filter;
            if (state.activeTab !== 'complaints') {
              state.activeTab = 'complaints';
              renderNavbar();
            }
            renderStats();
            renderActiveTab();
          }
          break;
        }
        case 'selectMenuDay': {
          const day = actionEl.getAttribute('data-day');
          if (day) {
            state.selectedDay = day;
            renderFoodMenu();
          }
          break;
        }
        case 'openEditMealModal': {
          const day = actionEl.getAttribute('data-day');
          const mealKey = actionEl.getAttribute('data-meal');
          if (day && mealKey) {
            window.openEditMealModal(day, mealKey);
          }
          break;
        }
        case 'openUpdateComplaintModal': {
          const id = actionEl.getAttribute('data-id');
          if (id) {
            window.openUpdateComplaintModal(id);
          }
          break;
        }
      }
    });

    // Delegated input for search
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'complaintSearchInput') {
        state.searchQuery = e.target.value;
        renderComplaintsTracker();
      }
    });

    // Delegated change for category filter
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'complaintCategorySelect') {
        state.categoryFilter = e.target.value;
        renderComplaintsTracker();
      }
    });

    // Close modal on clicking backdrop
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });

    // New Complaint Form Submit
    const complaintForm = document.getElementById('newComplaintForm');
    if (complaintForm) {
      complaintForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newComplaint = {
          id: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
          studentName: document.getElementById('cmpName').value,
          phone: document.getElementById('cmpPhone').value,
          roomNo: document.getElementById('cmpRoom').value,
          block: document.getElementById('cmpBlock').value,
          category: document.getElementById('cmpCategory').value,
          priority: document.getElementById('cmpPriority').value,
          visitTimeSlot: document.getElementById('cmpTimeSlot').value,
          description: document.getElementById('cmpDesc').value,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          assignedTo: 'Unassigned',
          resolutionNotes: ''
        };

        state.complaints.unshift(newComplaint);
        saveState();
        closeModal('complaintModal');
        complaintForm.reset();
        renderStats();
        renderActiveTab();
        addToast(`Ticket #${newComplaint.id} submitted successfully!`, 'success');
      });
    }

    // Notice Form Submit
    const noticeForm = document.getElementById('newNoticeForm');
    if (noticeForm) {
      noticeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newNotice = {
          id: `n${Date.now()}`,
          title: document.getElementById('noticeTitle').value,
          category: document.getElementById('noticeCategory').value,
          priority: document.getElementById('noticePriority').value,
          content: document.getElementById('noticeContent').value,
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };

        state.notices.unshift(newNotice);
        saveState();
        closeModal('noticeModal');
        noticeForm.reset();
        renderNoticeBoard();
        addToast(`Circular published: "${newNotice.title}"`, 'success');
      });
    }

    // Update Complaint Status Submit
    const updateComplaintForm = document.getElementById('updateComplaintForm');
    if (updateComplaintForm) {
      updateComplaintForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!state.editingComplaintId) return;

        const status = document.getElementById('editCmpStatus').value;
        const assignedTo = document.getElementById('editCmpStaff').value;
        const resolutionNotes = document.getElementById('editCmpNotes').value;

        state.complaints = state.complaints.map(c => {
          if (c.id === state.editingComplaintId) {
            return { ...c, status, assignedTo, resolutionNotes };
          }
          return c;
        });

        saveState();
        closeModal('updateComplaintModal');
        renderStats();
        renderActiveTab();
        addToast(`Ticket #${state.editingComplaintId} status updated to ${status}`, 'success');
      });
    }

    // Edit Meal Form Submit
    const editMealForm = document.getElementById('editMealForm');
    if (editMealForm) {
      editMealForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!state.editingMealKey) return;

        const time = document.getElementById('editMealTime').value;
        const type = document.getElementById('editMealType').value;
        const itemsText = document.getElementById('editMealItems').value;
        const items = itemsText.split(',').map(i => i.trim()).filter(Boolean);

        state.menuData[state.selectedDay][state.editingMealKey] = { time, type, items };
        saveState();
        closeModal('editMealModal');
        renderFoodMenu();
        addToast(`Updated ${state.selectedDay} menu!`, 'success');
      });
    }
  }

  // Modal Open/Close Global Functions
  window.openComplaintModal = function () {
    openModal('complaintModal');
  };

  window.openNoticeModal = function () {
    openModal('noticeModal');
  };

  window.openUpdateComplaintModal = function (ticketId) {
    const item = state.complaints.find(c => c.id === ticketId);
    if (!item) return;

    state.editingComplaintId = ticketId;
    document.getElementById('editTicketTitle').innerText = `Update Ticket #${item.id} (Room ${item.roomNo})`;
    document.getElementById('editCmpStatus').value = item.status;
    document.getElementById('editCmpStaff').value = item.assignedTo || '';
    document.getElementById('editCmpNotes').value = item.resolutionNotes || '';

    openModal('updateComplaintModal');
  };

  window.openEditMealModal = function (day, mealKey) {
    state.editingMealKey = mealKey;
    const meal = state.menuData[day][mealKey];
    document.getElementById('editMealTitle').innerText = `Edit ${day} - ${mealKey.toUpperCase()} Menu`;
    document.getElementById('editMealTime').value = meal.time;
    document.getElementById('editMealType').value = meal.type;
    document.getElementById('editMealItems').value = meal.items.join(', ');

    openModal('editMealModal');
  };

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  };

})();
