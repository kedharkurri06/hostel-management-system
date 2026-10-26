import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const mealMeta = [
  { key: 'breakfast', label: 'Breakfast', color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))' },
  { key: 'lunch', label: 'Lunch', color: '#06b6d4', gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.05))' },
  { key: 'snacks', label: 'Evening Snacks', color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.05))' },
  { key: 'dinner', label: 'Dinner', color: '#ec4899', gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.05))' }
];

export const FoodMenu = ({ onOpenEditMeal }) => {
  const { role, hasWardenPrivileges } = useAuth();
  const currentDayName = DAYS[(new Date().getDay() + 6) % 7];
  const [selectedDay, setSelectedDay] = useState(currentDayName);
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.menu.get();
      if (res.success && res.data) {
        setMenuData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load food menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const dayMenu = menuData[selectedDay] || {};

  return (
    <div>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '1.75rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(6, 182, 212, 0.12))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge" style={{ background: 'var(--accent-primary)', color: '#ffffff' }}>
              Hostel Mess Schedule
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Weekly Culinary Rotation
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Daily Food & Nutrition Menu
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Freshly prepared meals meeting nutritional guidelines for residents.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '0.85rem 1.25rem',
          borderRadius: '14px',
          border: '1px solid var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: 800 }}>
              Current Active Schedule
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentDayName} (Today)
            </div>
          </div>
        </div>
      </div>

      {/* Days Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {DAYS.map(day => {
          const isSelected = selectedDay === day;
          const isToday = currentDayName === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="glass-card"
              style={{
                padding: '0.75rem 1.25rem',
                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                background: isSelected ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: isSelected ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{day}</span>
              {isToday && (
                <span style={{
                  fontSize: '0.65rem',
                  background: isSelected ? '#ffffff' : 'var(--accent-success)',
                  color: isSelected ? 'var(--accent-primary)' : '#ffffff',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                  fontWeight: 800
                }}>
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading weekly menu schedule...
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          {error}
        </div>
      ) : (
        /* Meals Grid */
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          {mealMeta.map(({ key, label, color, gradient }) => {
            const mealData = dayMenu[key] || { time: 'N/A', items: [], type: 'Veg' };
            const isNonVeg = mealData.type?.toLowerCase().includes('non-veg');
            return (
              <div
                key={key}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  background: gradient,
                  borderTop: `4px solid ${color}`
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{label}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {mealData.time}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge" style={{
                      background: isNonVeg ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: isNonVeg ? '#f87171' : '#34d399',
                      fontSize: '0.7rem'
                    }}>
                      {mealData.type}
                    </span>
                    {(role === 'warden' || hasWardenPrivileges) && (
                      <button
                        onClick={() => onOpenEditMeal(selectedDay, key, mealData, dayMenu._id)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Edit Menu
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {mealData.items && mealData.items.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.45rem 0',
                          borderBottom: i < mealData.items.length - 1 ? '1px solid var(--glass-border)' : 'none',
                          fontSize: '0.93rem',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mess Guidelines */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)' }}>
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.05rem', fontWeight: 700 }}>
          Mess Rules & Dining Guidelines
        </h4>
        <div className="grid-3" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div>
            <strong>Guest Meal Coupons:</strong> Available at Mess Desk till 11:00 AM for Lunch and 6:00 PM for Dinner. ₹120 per guest meal.
          </div>
          <div>
            <strong>Cleanliness & Recycling:</strong> Please return tray and cutlery to the designated wash counter after finishing your meal.
          </div>
          <div>
            <strong>Special Dietary Needs:</strong> Students requiring sick diet (Khichdi/Curd Rice) can request the Mess Supervisor 1 hour prior.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodMenu;
