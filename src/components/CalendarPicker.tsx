import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Sparkles, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface SmartOpportunity {
  day: number;
  month: number; // 0-indexed
  name: string;
  category: 'Festival' | 'Weekend' | 'Slump Window';
  recommendedTiming: string;
}

interface CalendarPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  placeholder = 'e.g. Monday–Thursday, 3:00 PM – 6:00 PM',
  label = 'Target Time Window & Schedule',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar Navigation
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Date Selection Range
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activePresetKey, setActivePresetKey] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('3:00 PM – 6:00 PM');

  // Time Slots Definition
  const timeSlots = [
    { label: '3:00 PM – 6:00 PM', shortLabel: '3–6 PM', name: 'Slump' },
    { label: '9:00 AM – 1:00 PM', shortLabel: '9 AM–1 PM', name: 'Morning' },
    { label: '6:00 PM – 10:00 PM', shortLabel: '6–10 PM', name: 'Evening' },
    { label: 'All Day Coverage', shortLabel: 'All Day', name: 'Full Day' },
  ];

  // Dynamic Popover Positioning (Up or Down based on clearance)
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 330 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  // Known Local Festivals & Peak Opportunities (Comprehensive Indian & Commercial Calendar)
  const smartOpportunities: SmartOpportunity[] = useMemo(() => [
    // January (Month 0)
    { day: 1, month: 0, name: 'New Year Kickoff & Fresh Start', category: 'Festival', recommendedTiming: 'January 1–4, Fresh Start & Healthy Brunch' },
    { day: 14, month: 0, name: 'Makar Sankranti & Pongal', category: 'Festival', recommendedTiming: 'January 13–16, Harvest Feast Menus' },
    { day: 26, month: 0, name: 'Republic Day Long Weekend', category: 'Weekend', recommendedTiming: 'January 24–27, Family Brunch Special' },

    // February (Month 1)
    { day: 14, month: 1, name: "Valentine's & Couples Dining", category: 'Festival', recommendedTiming: 'February 7–15, Romantic Dinner Pairings' },
    { day: 25, month: 1, name: 'Maha Shivratri Specials', category: 'Festival', recommendedTiming: 'February 24–26, Fasting & Sattvic Menus' },

    // March (Month 2)
    { day: 14, month: 2, name: 'Holi Festivities & Thandai', category: 'Festival', recommendedTiming: 'March 13–16, Festive Sweet Drops' },
    { day: 20, month: 2, name: 'Ugadi & Gudi Padwa (New Year)', category: 'Festival', recommendedTiming: 'March 19–22, Traditional Feast Platters' },
    { day: 30, month: 2, name: 'Eid-ul-Fitr Feasts', category: 'Festival', recommendedTiming: 'March 29–April 1, Celebration Platters' },

    // April (Month 3)
    { day: 5, month: 3, name: 'Easter & Spring Bakes', category: 'Festival', recommendedTiming: 'April 3–6, Spring Bakes & Brunch' },
    { day: 14, month: 3, name: 'Baisakhi & Vishu Harvest', category: 'Festival', recommendedTiming: 'April 13–16, Regional New Year Specials' },
    { day: 23, month: 3, name: 'World Book & Art Day', category: 'Slump Window', recommendedTiming: 'April 22–24, Coffee + Book Duo' },

    // May (Month 4)
    { day: 10, month: 4, name: "Mother's Day High Tea", category: 'Festival', recommendedTiming: 'May 8–11, Family Brunch & High Tea' },
    { day: 20, month: 4, name: 'Summer Mango Festival', category: 'Festival', recommendedTiming: 'May 15–31, Fresh Mango Specials' },

    // June (Month 5)
    { day: 20, month: 5, name: "Father's Day Grill & Brew", category: 'Festival', recommendedTiming: 'June 19–22, Hearty Meals & Coffee Flights' },
    { day: 21, month: 5, name: 'International Yoga Day', category: 'Slump Window', recommendedTiming: 'June 19–25, Wellness & Smoothie Boost' },
    { day: 28, month: 5, name: 'Monsoon Chai & Pakoda Window', category: 'Slump Window', recommendedTiming: 'June 25–July 10, Rainy Afternoon Combos' },

    // July (Month 6)
    { day: 7, month: 6, name: 'World Chocolate Day', category: 'Festival', recommendedTiming: 'July 6–9, Single-Origin Chocolate Drops' },
    { day: 19, month: 6, name: 'Guru Purnima Gratitude', category: 'Festival', recommendedTiming: 'July 18–20, Family Tribute Dinners' },

    // August (Month 7)
    { day: 15, month: 7, name: 'Independence Day Weekend', category: 'Festival', recommendedTiming: 'August 14–17, Tricolor & Long Weekend Brunch' },
    { day: 28, month: 7, name: 'Raksha Bandhan Hampers', category: 'Festival', recommendedTiming: 'August 26–29, Sibling Gift Hampers' },
    { day: 30, month: 7, name: 'Janmashtami Sweet Drop', category: 'Festival', recommendedTiming: 'August 28–31, Dairy & Peda Hampers' },

    // September (Month 8)
    { day: 5, month: 8, name: "Teachers' Day & Student Specials", category: 'Slump Window', recommendedTiming: 'September 4–6, Campus & Group Treats' },
    { day: 5, month: 8, name: 'Onam Grand Feast (Sadhya)', category: 'Festival', recommendedTiming: 'September 3–6, 11:30 AM – 3:30 PM Sadya' },
    { day: 15, month: 8, name: 'Ganesh Chaturthi Window', category: 'Festival', recommendedTiming: 'September 14–24, Modak & Feast Platters' },

    // October (Month 9)
    { day: 1, month: 9, name: 'International Coffee Day', category: 'Slump Window', recommendedTiming: 'September 30–October 2, Barista Specials' },
    { day: 15, month: 9, name: 'Navratri & Durga Puja Feasts', category: 'Festival', recommendedTiming: 'October 10–20, Evening & Garba Treats' },
    { day: 22, month: 9, name: 'Dussehra Celebrations', category: 'Festival', recommendedTiming: 'October 20–23, Auspicious Sweet Drops' },
    { day: 31, month: 9, name: 'Halloween Spooky Treats', category: 'Festival', recommendedTiming: 'October 29–November 1, Themed Bakes & Lattes' },

    // November (Month 10)
    { day: 10, month: 10, name: 'Diwali Lights & Gifting Rush', category: 'Festival', recommendedTiming: 'November 6–13, Premium Gift Hampers' },
    { day: 14, month: 10, name: 'Bhai Dooj Sibling Lunches', category: 'Festival', recommendedTiming: 'November 13–15, Sibling Dining Combos' },
    { day: 24, month: 10, name: 'Guru Nanak Jayanti', category: 'Festival', recommendedTiming: 'November 23–25, Community Feast Specials' },
    { day: 27, month: 10, name: 'Black Friday & Small Business Weekend', category: 'Weekend', recommendedTiming: 'November 26–30, Holiday Gift Card Specials' },

    // December (Month 11)
    { day: 10, month: 11, name: 'Winter Warmers & Hot Chocolate', category: 'Slump Window', recommendedTiming: 'December 1–18, Spiced Hot Cocoa Flights' },
    { day: 25, month: 11, name: 'Christmas & Winter Carnival', category: 'Festival', recommendedTiming: 'December 20–26, Plum Cakes & Roast Platters' },
    { day: 31, month: 11, name: "New Year's Eve Countdown", category: 'Festival', recommendedTiming: 'December 30–January 2, Celebration Reservations' },
  ], []);

  // Format full output string with current dates & time slot
  const formatSchedule = (start: Date | null, end: Date | null, time: string) => {
    if (start && end) {
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startStr} – ${endStr}, ${time}`;
    }
    if (start) {
      const startStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      return `${startStr}, ${time}`;
    }
    return time;
  };

  // Exact Range Computations for Strategic Presets
  const getPresetRange = (key: 'weekday' | 'weekend' | 'week') => {
    const now = new Date();
    const day = now.getDay();

    if (key === 'weekday') {
      let start = new Date(now);
      if (day >= 1 && day <= 4) {
        start.setDate(now.getDate() - (day - 1));
      } else if (day === 0) {
        start.setDate(now.getDate() + 1);
      } else {
        start.setDate(now.getDate() + (8 - day));
      }
      const end = new Date(start);
      end.setDate(start.getDate() + 3);
      return { start, end, time: '3:00 PM – 6:00 PM', label: 'Monday–Thursday, 3:00 PM – 6:00 PM' };
    }

    if (key === 'weekend') {
      let start = new Date(now);
      if (day === 6) {
        start = new Date(now);
      } else if (day === 0) {
        start.setDate(now.getDate() - 1);
      } else {
        start.setDate(now.getDate() + (6 - day));
      }
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      return { start, end, time: '9:00 AM – 2:00 PM', label: 'Saturday & Sunday, 9:00 AM – 2:00 PM' };
    }

    // next 7 days
    const start = new Date(now);
    const end = new Date(now);
    end.setDate(start.getDate() + 6);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { start, end, time: 'All Day Coverage', label: `Next 7 Days (${startStr} – ${endStr})` };
  };

  const handleSelectPreset = (key: 'weekday' | 'weekend' | 'week') => {
    const { start, end, time, label } = getPresetRange(key);
    setActivePresetKey(key);
    setSelectedTimeSlot(time);
    setStartDate(start);
    setEndDate(end);
    setCurrentMonth(start.getMonth());
    setCurrentYear(start.getFullYear());
    onChange(label);
  };

  const handleSelectTimeSlot = (slotLabel: string) => {
    setSelectedTimeSlot(slotLabel);
    setActivePresetKey(null);
    const formatted = formatSchedule(startDate, endDate, slotLabel);
    onChange(formatted);
  };

  const quickPresets = [
    {
      key: 'weekday' as const,
      label: 'Weekday Slump',
      detail: 'Mon–Thu 3–6 PM',
    },
    {
      key: 'weekend' as const,
      label: 'Weekend Rush',
      detail: 'Sat–Sun 9 AM–2 PM',
    },
    {
      key: 'week' as const,
      label: 'Next 7 Days',
      detail: 'Continuous Reach',
    },
  ];

  // Precomputed Opportunity Map for current month
  const opportunitiesMap = useMemo(() => {
    const map: Record<number, SmartOpportunity> = {};
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      const festival = smartOpportunities.find((o) => o.day === day && o.month === currentMonth);
      if (festival) {
        map[day] = festival;
      } else {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          map[day] = {
            day,
            month: currentMonth,
            name: 'Weekend Footfall Rush',
            category: 'Weekend',
            recommendedTiming: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, 9:00 AM – 2:00 PM`,
          };
        }
      }
    }
    return map;
  }, [currentYear, currentMonth, smartOpportunities]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Calendar Helpers
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday start
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    setActivePresetKey(null);
    const clickedDate = new Date(currentYear, currentMonth, day);
    const opp = opportunitiesMap[day];

    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
      
      if (opp && opp.category === 'Festival') {
        onChange(opp.recommendedTiming);
      } else {
        const formatted = formatSchedule(clickedDate, null, selectedTimeSlot);
        onChange(formatted);
      }
    } else if (startDate && !endDate) {
      let start = startDate;
      let end = clickedDate;
      if (clickedDate < startDate) {
        start = clickedDate;
        end = startDate;
      }
      setStartDate(start);
      setEndDate(end);

      const formatted = formatSchedule(start, end, selectedTimeSlot);
      onChange(formatted);
    }
  };

  const isDateSelected = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    if (!startDate) return false;
    if (startDate && !endDate) {
      return checkDate.toDateString() === startDate.toDateString();
    }
    if (startDate && endDate) {
      return checkDate >= startDate && checkDate <= endDate;
    }
    return false;
  };

  const isStartEdge = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    return startDate && checkDate.toDateString() === startDate.toDateString();
  };

  const isEndEdge = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    return endDate && checkDate.toDateString() === endDate.toDateString();
  };

  const isToday = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    return checkDate.toDateString() === today.toDateString();
  };

  const daysCount = daysInMonth(currentMonth, currentYear);
  const firstDay = firstDayOfMonth(currentMonth, currentYear);
  const activeOpportunity = startDate ? opportunitiesMap[startDate.getDate()] : null;

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative', marginBottom: '16px' }}>
      {label && <label className="form-label">{label}</label>}

      {/* Embedded CSS for High-Performance Luxury Animations */}
      <style>{`
        .cal-day-btn {
          transition: background 0.12s ease, transform 0.1s ease;
        }
        .cal-day-btn:hover:not(.cal-edge) {
          background: rgba(26, 77, 46, 0.08) !important;
          color: var(--color-primary) !important;
        }
        .cal-day-btn:active {
          transform: scale(0.94);
        }
        .cal-preset-card {
          transition: all 0.14s ease;
        }
        .cal-preset-card:hover {
          border-color: var(--color-primary) !important;
          background: rgba(26, 77, 46, 0.04) !important;
          transform: translateY(-1px);
        }
        .cal-nav-btn {
          transition: all 0.12s ease;
        }
        .cal-nav-btn:hover {
          background: var(--color-primary-subtle) !important;
          color: var(--color-primary) !important;
          border-color: var(--color-primary) !important;
        }
      `}</style>

      {/* Premium Input Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          className="form-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            paddingRight: '48px',
            fontSize: '13.5px',
            background: 'var(--color-surface)',
            border: isOpen ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
            boxShadow: isOpen ? '0 0 0 3px var(--color-primary-subtle)' : 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Open interactive marketing calendar"
          style={{
            position: 'absolute',
            right: '6px',
            background: isOpen ? 'var(--color-primary)' : 'var(--color-surface-raised)',
            border: isOpen ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            color: isOpen ? '#FFFFFF' : 'var(--color-ink)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-xs)',
            boxShadow: isOpen ? '0 2px 8px rgba(26, 77, 46, 0.25)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <CalendarIcon size={16} />
        </button>
      </div>

      {/* Horizontal Premium Luxury Editorial Calendar Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...(openUpwards
              ? { bottom: 'calc(100% + 8px)', top: 'auto' }
              : { top: 'calc(100% + 8px)', bottom: 'auto' }),
            left: 0,
            zIndex: 110,
            background: '#FFFFFF',
            border: '1px solid rgba(26, 77, 46, 0.12)',
            borderRadius: '12px',
            boxShadow: '0 28px 60px -12px rgba(24, 43, 31, 0.20), 0 12px 24px -6px rgba(24, 43, 31, 0.08), 0 0 0 1px rgba(26, 77, 46, 0.04)',
            padding: '20px 24px',
            width: '560px',
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          {/* Main 2-Column Horizontal Split */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '22px', alignItems: 'start' }}>
            
            {/* Left Column: Interactive Month Grid */}
            <div style={{ paddingRight: '20px', borderRight: '1px solid var(--color-border)' }}>
              
              {/* Month Header with Serif Display Typography */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="cal-nav-btn"
                  style={{
                    width: '30px',
                    height: '30px',
                    background: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: 'var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={15} />
                </button>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="cal-nav-btn"
                  style={{
                    width: '30px',
                    height: '30px',
                    background: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: 'var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Monospace Weekday Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '8px' }}>
                {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((d, i) => (
                  <span key={i} style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid with Fluid Selection Ribbons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0px', textAlign: 'center' }}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysCount }).map((_, i) => {
                  const day = i + 1;
                  const selected = isDateSelected(day);
                  const startEdge = isStartEdge(day);
                  const endEdge = isEndEdge(day);
                  const isEdge = startEdge || endEdge;
                  const todayDate = isToday(day);
                  const opp = opportunitiesMap[day];

                  return (
                    <div
                      key={day}
                      style={{
                        padding: '1px 0',
                        background: selected && !isEdge ? 'rgba(26, 77, 46, 0.08)' : 'transparent',
                        borderTopLeftRadius: startEdge ? '50%' : '0',
                        borderBottomLeftRadius: startEdge ? '50%' : '0',
                        borderTopRightRadius: endEdge ? '50%' : '0',
                        borderBottomRightRadius: endEdge ? '50%' : '0',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleDateClick(day)}
                        title={opp ? `${opp.name} (${opp.category})` : undefined}
                        className={`cal-day-btn ${isEdge ? 'cal-edge' : ''}`}
                        style={{
                          position: 'relative',
                          width: '32px',
                          height: '32px',
                          margin: '0 auto',
                          fontSize: '12.5px',
                          borderRadius: '50%',
                          border: todayDate && !isEdge ? '1.5px solid var(--color-primary)' : 'none',
                          background: isEdge
                            ? '#1A4D2E'
                            : 'transparent',
                          color: isEdge ? '#FFFFFF' : selected ? 'var(--color-primary)' : 'var(--color-ink)',
                          fontWeight: isEdge || todayDate ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1,
                          boxShadow: isEdge ? '0 2px 6px rgba(26, 77, 46, 0.35)' : 'none',
                        }}
                      >
                        <span>{day}</span>
                        {opp && (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: '3px',
                              width: '3.5px',
                              height: '3.5px',
                              borderRadius: '50%',
                              background: isEdge ? '#FFFFFF' : opp.category === 'Festival' ? '#C85A32' : '#1A4D2E',
                              boxShadow: isEdge ? 'none' : '0 0 3px rgba(200, 90, 50, 0.4)',
                            }}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Strategic Presets, Time Slots & Live Intelligence */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Strategic Presets */}
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px', fontWeight: 600 }}>
                  Strategic Presets
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {quickPresets.map((preset) => {
                    const isActive = activePresetKey === preset.key;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => handleSelectPreset(preset.key)}
                        className="cal-preset-card"
                        style={{
                          padding: '7px 10px',
                          borderRadius: '8px',
                          border: isActive ? '1.5px solid #1A4D2E' : '1px solid var(--color-border)',
                          background: isActive ? 'rgba(26, 77, 46, 0.06)' : 'var(--color-surface-raised)',
                          color: 'var(--color-ink)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          boxShadow: isActive ? '0 2px 6px rgba(26, 77, 46, 0.08)' : 'none',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: isActive ? 700 : 600, color: isActive ? '#1A4D2E' : 'var(--color-ink)' }}>
                            {preset.label}
                          </div>
                          <div style={{ fontSize: '10px', color: isActive ? '#1A4D2E' : 'var(--color-ink-muted)', marginTop: '1px' }}>
                            {preset.detail}
                          </div>
                        </div>
                        <ChevronRightIcon size={14} style={{ color: isActive ? '#1A4D2E' : 'var(--color-ink-muted)', flexShrink: 0 }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Window Slots (Interactive Hours Selection) */}
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px', fontWeight: 600 }}>
                  Active Time Slot
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.label;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        onClick={() => handleSelectTimeSlot(slot.label)}
                        style={{
                          padding: '6px 6px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          border: isSelected ? '1.5px solid #1A4D2E' : '1px solid var(--color-border)',
                          background: isSelected ? '#1A4D2E' : 'var(--color-surface-raised)',
                          color: isSelected ? '#FFFFFF' : 'var(--color-ink)',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'center',
                          lineHeight: 1.1,
                          boxShadow: isSelected ? '0 2px 6px rgba(26, 77, 46, 0.20)' : 'none',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <div>{slot.shortLabel}</div>
                        <div style={{ fontSize: '8.5px', color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--color-ink-muted)', marginTop: '1px' }}>{slot.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opportunity Insight Luxury Card */}
              <div
                style={{
                  padding: '7px 10px',
                  background: activeOpportunity ? 'rgba(200, 90, 50, 0.05)' : 'var(--color-surface-raised)',
                  border: activeOpportunity ? '1px solid rgba(200, 90, 50, 0.20)' : '1px solid var(--color-border)',
                  borderLeft: activeOpportunity ? '3px solid #C85A32' : '1px solid var(--color-border)',
                  borderRadius: '6px',
                  height: '38px',
                  minHeight: '38px',
                  maxHeight: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {activeOpportunity ? (
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {activeOpportunity.name}
                    </div>
                    <div style={{ fontSize: '8.5px', color: '#C85A32', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {activeOpportunity.category.toUpperCase()} &bull; TARGET WINDOW
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '9.5px', color: 'var(--color-ink-muted)', whiteSpace: 'nowrap' }}>
                    &bull; Dots indicate peak moments
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActivePresetKey(null);
                    setStartDate(null);
                    setEndDate(null);
                    onChange('');
                  }}
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--color-ink-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 0',
                  }}
                >
                  Clear
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary"
                  style={{
                    fontSize: '12px',
                    padding: '6px 16px',
                    borderRadius: '6px',
                  }}
                >
                  Done
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
