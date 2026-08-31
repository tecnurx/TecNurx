"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DayMonthPicker({ value, onChange, name, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState('bottom');
  const [currentMonth, setCurrentMonth] = useState(0); 
  const wrapperRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (month) => {
    // 2024 is a leap year, so February gets 29 days
    return new Date(2024, month + 1, 0).getDate();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDayClick = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange({ target: { name, value: `${formattedMonth}-${formattedDay}` } });
    setIsOpen(false);
  };

  useEffect(() => {
    if (value && isOpen) {
      const parts = value.split('-');
      if (parts.length === 2) {
        const m = parseInt(parts[0], 10) - 1;
        if (!isNaN(m) && m >= 0 && m <= 11) {
          setCurrentMonth(m);
        }
      }
    }
  }, [value, isOpen]);

  const togglePopup = () => {
    if (!isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const popupHeight = 320; 
      
      if (spaceBelow < popupHeight && rect.top > popupHeight) {
        setPopupPosition('top');
      } else {
        setPopupPosition('bottom');
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'white',
          position: 'relative'
        }}
        onClick={togglePopup}
      >
        <input
          type="text"
          name={name}
          value={value}
          readOnly
          placeholder="MM-DD"
          required={required}
          style={{ cursor: 'pointer', width: '100%' }}
        />
        <CalendarIcon 
          size={18} 
          color="#888" 
          style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }} 
        />
      </div>

      {isOpen && (
        <div 
          style={{ 
            position: 'absolute', 
            ...(popupPosition === 'top' ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
            left: 0, 
            background: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
            zIndex: 999,
            width: '280px',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button 
              type="button" 
              onClick={() => setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1))}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '6px', display: 'flex' }}
            >
              <ChevronLeft size={16} />
            </button>
            <strong style={{ fontSize: '15px', color: '#0f172a' }}>{months[currentMonth]}</strong>
            <button 
              type="button" 
              onClick={() => setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1))}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '6px', display: 'flex' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1).map(day => {
              const isSelected = value === `${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  style={{
                    background: isSelected ? '#000' : 'transparent',
                    color: isSelected ? '#fff' : '#334155',
                    border: 'none',
                    padding: '8px 0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isSelected ? '600' : '400',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => { if(!isSelected) e.target.style.background = '#f1f5f9'; }}
                  onMouseOut={(e) => { if(!isSelected) e.target.style.background = 'transparent'; }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
