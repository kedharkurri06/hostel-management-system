import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const mealMeta = [
  {
    key: 'breakfast',
    label: 'Breakfast',
    color: 'var(--chart-4)',
    accentBg: 'rgba(180, 83, 9, 0.06)'
  },
  {
    key: 'lunch',
    label: 'Lunch',
    color: 'var(--primary)',
    accentBg: 'rgba(236, 110, 64, 0.06)'
  },
  {
    key: 'snacks',
    label: 'Evening Snacks',
    color: 'var(--sidebar-primary)',
    accentBg: 'rgba(155, 44, 44, 0.06)'
  },
  {
    key: 'dinner',
    label: 'Dinner',
    color: 'var(--chart-3)',
    accentBg: 'rgba(127, 29, 29, 0.06)'
  }
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
      <div className="card" style={{
        padding: '1.75rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, var(--secondary) 0%, var(--card) 100%)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge" style={{
              background: 'var(--sidebar-primary)',
              color: 'var(--sidebar-primary-foreground)'
            }}>
              Hostel Mess Schedule
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Weekly Culinary Rotation
            </span>
          </div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            margin: 0,
            fontFamily: 'var(--font-serif)',
            color: 'var(--foreground)'
          }}>
            Daily Food & Nutrition Menu
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Freshly prepared, balanced meals meeting campus nutritional guidelines for residents.
          </p>
        </div>

        <div style={{
          background: 'var(--card)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              color: 'var(--primary)',
              fontWeight: 800,
              letterSpacing: '0.05em'
            }}>
              Current Active Schedule
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)' }}>
              {currentDayName} (Today)
            </div>
          </div>
        </div>
      </div>

      {/* Days Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.75rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem'
      }}>
        {DAYS.map(day => {
          const isSelected = selectedDay === day;
          const isToday = currentDayName === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className="card"
              style={{
                padding: '0.65rem 1.15rem',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: isSelected ? 'var(--primary)' : 'var(--card)',
                color: isSelected ? 'var(--primary-foreground)' : 'var(--foreground)',
                cursor: 'pointer',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <span>{day}</span>
              {isToday && (
                <span style={{
                  fontSize: '0.65rem',
                  background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--accent)',
                  color: isSelected ? '#ffffff' : 'var(--accent-foreground)',
                  padding: '0.12rem 0.4rem',
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
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
          Loading weekly menu schedule...
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--destructive)' }}>
          {error}
        </div>
      ) : (
        /* Meals Grid */
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          {mealMeta.map(({ key, label, color, accentBg }) => {
            const mealData = dayMenu[key] || { time: 'N/A', items: [], type: 'Veg' };
            const isNonVeg = mealData.type?.toLowerCase().includes('non-veg');
            return (
              <div
                key={key}
                className="card"
                style={{
                  padding: '1.5rem',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderTop: `4px solid ${color}`,
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--foreground)'
                      }}>
                        {label}
                      </h3>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--muted-foreground)',
                        marginTop: '0.15rem',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {mealData.time}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{
                        background: isNonVeg ? 'rgba(153, 27, 27, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                        color: isNonVeg ? 'var(--destructive)' : 'var(--accent-success)',
                        border: isNonVeg ? '1px solid rgba(153, 27, 27, 0.2)' : '1px solid rgba(22, 163, 74, 0.2)',
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

                  <div style={{
                    background: accentBg,
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius)',
                    marginBottom: '0.5rem'
                  }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {mealData.items && mealData.items.map((item, i) => (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.4rem 0',
                            borderBottom: i < mealData.items.length - 1 ? '1px solid var(--border)' : 'none',
                            fontSize: '0.9rem',
                            color: 'var(--card-foreground)'
                          }}
                        >
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: color,
                            flexShrink: 0
                          }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mess Guidelines */}
      <div className="card" style={{
        padding: '1.5rem',
        background: 'var(--muted)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)'
      }}>
        <h4 style={{
          margin: '0 0 0.75rem 0',
          fontSize: '1.05rem',
          fontWeight: 700,
          fontFamily: 'var(--font-serif)',
          color: 'var(--foreground)'
        }}>
          Mess Rules & Dining Guidelines
        </h4>
        <div className="grid-3" style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
          <div>
            <strong style={{ color: 'var(--foreground)' }}>Guest Meal Coupons:</strong> Available at Mess Desk till 11:00 AM for Lunch and 6:00 PM for Dinner. ₹120 per guest meal.
          </div>
          <div>
            <strong style={{ color: 'var(--foreground)' }}>Cleanliness & Recycling:</strong> Please return tray and cutlery to the designated wash counter after finishing your meal.
          </div>
          <div>
            <strong style={{ color: 'var(--foreground)' }}>Special Dietary Needs:</strong> Students requiring sick diet (Khichdi/Curd Rice) can request the Mess Supervisor 1 hour prior.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodMenu;
