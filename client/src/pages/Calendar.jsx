import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Bell } from 'lucide-react';

const Calendar = () => {
  const { token } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDateKey, setSelectedDateKey] = useState(new Date().toDateString());

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/companies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCompanies(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompanies();
  }, [token]);

  // Navigate Months
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to compile all events for a given day
  const getEventsForDate = (dateObj) => {
    const dayStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;

    const events = [];

    companies.forEach(company => {
      // 1. Check Deadline
      if (company.deadline) {
        const d = new Date(company.deadline).getTime();
        if (d >= dayStart && d <= dayEnd) {
          events.push({
            id: `${company._id}-deadline`,
            company: company.name,
            role: company.role,
            type: 'Deadline',
            time: 'EOD',
            label: 'Application Deadline',
            color: 'var(--color-danger)'
          });
        }
      }

      // 2. Check OA Test Date
      if (company.testDate) {
        const d = new Date(company.testDate).getTime();
        if (d >= dayStart && d <= dayEnd) {
          events.push({
            id: `${company._id}-oa`,
            company: company.name,
            role: company.role,
            type: 'OA Test',
            time: new Date(company.testDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            label: 'Online Assessment (OA)',
            color: 'var(--color-warning)'
          });
        }
      }

      // 3. Check Interview Date
      if (company.interviewDate) {
        const d = new Date(company.interviewDate).getTime();
        if (d >= dayStart && d <= dayEnd) {
          events.push({
            id: `${company._id}-interview`,
            company: company.name,
            role: company.role,
            type: 'Interview',
            time: new Date(company.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            label: `${company.status}`,
            color: 'var(--color-info)'
          });
        }
      }
    });

    return events;
  };

  // Click on date cell
  const handleDateSelect = (day) => {
    const dateObj = new Date(year, month, day);
    const dateKey = dateObj.toDateString();
    setSelectedDateKey(dateKey);
    setSelectedDayEvents(getEventsForDate(dateObj));
  };

  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = companies.reduce((count, company) => {
    const eventDates = [company.deadline, company.testDate, company.interviewDate].filter(Boolean);
    return eventDates.reduce((innerCount, dateValue) => {
      const date = new Date(dateValue);
      return innerCount + (date >= now && date <= oneWeekLater ? 1 : 0);
    }, count);
  }, 0);

  // Run on mount or when companies reload to select "today"
  useEffect(() => {
    const today = new Date();
    setSelectedDayEvents(getEventsForDate(today));
    setSelectedDateKey(today.toDateString());
  }, [companies]);

  // Generate date grid cells
  const renderCells = () => {
    const cells = [];
    const today = new Date();

    // Blank cells before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} style={{ height: '80px', border: '1px solid rgba(255,255,255,0.02)' }}></div>);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
      const isSelected = selectedDateKey === dateObj.toDateString();
      const dayEvents = getEventsForDate(dateObj);

      cells.push(
        <div 
          key={day}
          onClick={() => handleDateSelect(day)}
          style={{
            height: '90px',
            border: '1px solid var(--border-light)',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : isToday ? 'rgba(255,255,255,0.03)' : 'transparent',
            borderColor: isSelected ? 'var(--color-primary)' : isToday ? 'rgba(255,255,255,0.2)' : 'var(--border-light)',
            borderRadius: '6px',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => {
            if(!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
          onMouseLeave={(e) => {
            if(!isSelected) e.currentTarget.style.borderColor = 'var(--border-light)';
          }}
        >
          {/* Day number */}
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '700',
            color: isToday ? 'var(--color-primary)' : 'var(--text-primary)'
          }}>{day}</span>

          {/* Event markers (Dots / Pills) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
            {dayEvents.slice(0, 2).map((evt, idx) => (
              <div 
                key={evt.id}
                style={{
                  fontSize: '0.62rem',
                  fontWeight: '600',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  backgroundColor: `rgba(${evt.color === 'var(--color-danger)' ? '239,68,68' : evt.color === 'var(--color-warning)' ? '245,158,11' : '14,165,233'}, 0.1)`,
                  color: evt.color,
                  borderLeft: `2px solid ${evt.color}`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {evt.company}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textAlign: 'right', fontWeight: '600' }}>
                +{dayEvents.length - 2} more
              </span>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 40px 40px 40px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
      
      {/* Calendar Grid Section */}
      <div className="glass-panel" style={{ flex: 2, minWidth: '450px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '700' }}>
            {monthNames[month]} {year}
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={prevMonth} className="glass-button-secondary" style={{ padding: '8px 12px' }}><ChevronLeft size={16} /></button>
            <button onClick={nextMonth} className="glass-button-secondary" style={{ padding: '8px 12px' }}><ChevronRight size={16} /></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '18px' }}>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Upcoming events</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-primary)' }}>{upcomingEvents}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Next 7 days across deadlines, OAs, and interviews.</span>
          </div>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Currently selected</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-secondary)' }}>{selectedDayEvents.length}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Events on {selectedDateKey}</span>
          </div>
        </div>

        {/* Days of Week labels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Grid Cells */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px'
        }}>
          {renderCells()}
        </div>
      </div>

      {/* Selected Day Event List Sidebar */}
      <div className="glass-panel" style={{ flex: 1, minWidth: '280px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '300px' }}>
        <div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: '700' }}>Schedules for</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: '600', marginTop: '2px' }}>{selectedDateKey}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
          {selectedDayEvents.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 0',
              gap: '12px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <CalendarIcon size={32} style={{ opacity: 0.15 }} />
              <span style={{ fontSize: '0.8rem' }}>No assessments, deadlines, or interviews logged for this date.</span>
            </div>
          ) : (
            selectedDayEvents.map(evt => (
              <div 
                key={evt.id}
                className="glass-panel" 
                style={{
                  padding: '16px',
                  borderLeft: `4px solid ${evt.color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: evt.color,
                    background: `rgba(255,255,255,0.03)`,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>{evt.type}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <Clock size={12} />
                    <span>{evt.time}</span>
                  </div>
                </div>
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>{evt.company}</h5>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{evt.role}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <Bell size={12} />
                  <span>{evt.label}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Calendar;
