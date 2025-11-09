import React, { useState, useEffect } from 'react';
import { toEthiopian } from 'ethiopian-date';

export default function UltrasoundInput({ onCalculate }) {
  const [previousVisitDate, setPreviousVisitDate] = useState({ year: '', month: '', day: '' });
  const [previousGA, setPreviousGA] = useState({ weeks: '', days: '' });
  const [currentDate, setCurrentDate] = useState({ year: '', month: '', day: '' });
  const [useToday, setUseToday] = useState(true);

  // Set today's date in Ethiopian calendar on component mount
  useEffect(() => {
    if (useToday) {
      const today = new Date();
      const todayEthiopian = toEthiopian(today.getFullYear(), today.getMonth() + 1, today.getDate());
      setCurrentDate({
        year: todayEthiopian[0].toString(),
        month: todayEthiopian[1].toString(),
        day: todayEthiopian[2].toString()
      });
    }
  }, [useToday]);

  const handleDateChange = (dateType, field, value) => {
    if (field === 'month' && (value === '' || (!isNaN(value) && parseInt(value) >= 1 && parseInt(value) <= 13))) {
      if (dateType === 'previous') {
        setPreviousVisitDate({ ...previousVisitDate, month: value });
      } else {
        setCurrentDate({ ...currentDate, month: value });
      }
    } else if (field === 'day' && (value === '' || (!isNaN(value) && parseInt(value) >= 1 && parseInt(value) <= 30))) {
      if (dateType === 'previous') {
        setPreviousVisitDate({ ...previousVisitDate, day: value });
      } else {
        setCurrentDate({ ...currentDate, day: value });
      }
    } else if (field === 'year' && (value === '' || (!isNaN(value) && parseInt(value) > 0))) {
      if (dateType === 'previous') {
        setPreviousVisitDate({ ...previousVisitDate, year: value });
      } else {
        setCurrentDate({ ...currentDate, year: value });
      }
    }
  };

  const handleGAChange = (field, value) => {
    if (field === 'weeks') {
      if (value === '' || (!isNaN(value) && parseInt(value) >= 0 && parseInt(value) <= 42)) {
        setPreviousGA({ ...previousGA, weeks: value });
      }
    } else if (field === 'days') {
      if (value === '' || (!isNaN(value) && parseInt(value) >= 0 && parseInt(value) < 7)) {
        setPreviousGA({ ...previousGA, days: value });
      }
    }
  };

  const handleUseTodayChange = (e) => {
    setUseToday(e.target.checked);
    if (e.target.checked) {
      const today = new Date();
      const todayEthiopian = toEthiopian(today.getFullYear(), today.getMonth() + 1, today.getDate());
      setCurrentDate({
        year: todayEthiopian[0].toString(),
        month: todayEthiopian[1].toString(),
        day: todayEthiopian[2].toString()
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prevYear = parseInt(previousVisitDate.year);
    const prevMonth = parseInt(previousVisitDate.month);
    const prevDay = parseInt(previousVisitDate.day);
    const prevWeeks = parseInt(previousGA.weeks);
    const prevDays = parseInt(previousGA.days);
    const currYear = parseInt(currentDate.year);
    const currMonth = parseInt(currentDate.month);
    const currDay = parseInt(currentDate.day);

    if (!prevYear || !prevMonth || !prevDay) {
      return;
    }

    if (prevWeeks === '' || prevDays === '') {
      return;
    }

    if (!currYear || !currMonth || !currDay) {
      return;
    }

    onCalculate({
      previousVisitDate: { year: prevYear, month: prevMonth, day: prevDay },
      previousGA: { weeks: prevWeeks, days: prevDays },
      currentDate: { year: currYear, month: currMonth, day: currDay }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="ultrasound-input">
      <div className="input-section-group">
        <h4 className="section-subtitle">Previous Visit Information</h4>
        <div className="input-group">
          <label htmlFor="prev-date">Previous Visit Date (Ethiopian Calendar)</label>
          <div className="date-inputs-row">
            <div className="input-group">
              <input
                id="prev-year"
                type="number"
                placeholder="Year"
                value={previousVisitDate.year}
                onChange={(e) => handleDateChange('previous', 'year', e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="input-group">
              <input
                id="prev-month"
                type="number"
                placeholder="Month (1-13)"
                value={previousVisitDate.month}
                onChange={(e) => handleDateChange('previous', 'month', e.target.value)}
                min="1"
                max="13"
                required
              />
            </div>
            <div className="input-group">
              <input
                id="prev-day"
                type="number"
                placeholder="Day (1-30)"
                value={previousVisitDate.day}
                onChange={(e) => handleDateChange('previous', 'day', e.target.value)}
                min="1"
                max="30"
                required
              />
            </div>
          </div>
        </div>
        <div className="ga-input-row">
          <div className="input-group">
            <label htmlFor="prev-weeks">GA at Previous Visit - Weeks</label>
            <input
              id="prev-weeks"
              type="number"
              placeholder="e.g., 12"
              value={previousGA.weeks}
              onChange={(e) => handleGAChange('weeks', e.target.value)}
              min="0"
              max="42"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="prev-days">GA at Previous Visit - Days</label>
            <input
              id="prev-days"
              type="number"
              placeholder="e.g., 3"
              value={previousGA.days}
              onChange={(e) => handleGAChange('days', e.target.value)}
              min="0"
              max="6"
              required
            />
          </div>
        </div>
      </div>

      <div className="input-section-group">
        <h4 className="section-subtitle">Current Date</h4>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useToday}
              onChange={handleUseTodayChange}
            />
            <span>Use today's date</span>
          </label>
        </div>
        <div className="input-group">
          <label htmlFor="curr-date">Current Date (Ethiopian Calendar)</label>
          <div className="date-inputs-row">
            <div className="input-group">
              <input
                id="curr-year"
                type="number"
                placeholder="Year"
                value={currentDate.year}
                onChange={(e) => handleDateChange('current', 'year', e.target.value)}
                min="1"
                required
                disabled={useToday}
              />
            </div>
            <div className="input-group">
              <input
                id="curr-month"
                type="number"
                placeholder="Month (1-13)"
                value={currentDate.month}
                onChange={(e) => handleDateChange('current', 'month', e.target.value)}
                min="1"
                max="13"
                required
                disabled={useToday}
              />
            </div>
            <div className="input-group">
              <input
                id="curr-day"
                type="number"
                placeholder="Day (1-30)"
                value={currentDate.day}
                onChange={(e) => handleDateChange('current', 'day', e.target.value)}
                min="1"
                max="30"
                required
                disabled={useToday}
              />
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="calculate-btn">
        Calculate Current GA & EDD
      </button>
    </form>
  );
}
