import React, { useState } from 'react';
import './App.css';
import DateInput from './components/DateInput';
import UltrasoundInput from './components/UltrasoundInput';
import Results from './components/Results';
import { toGregorian, toEthiopian } from 'ethiopian-date';

function App() {
  const [edd, setEdd] = useState(null);
  const [ga, setGa] = useState(null);
  const [error, setError] = useState(null);
  const [calculationMethod, setCalculationMethod] = useState('lmp'); // 'lmp' or 'ultrasound'

  const calculateEDDandGA = (lmpDate) => {
    try {
      setError(null);

      if (lmpDate.month < 1 || lmpDate.month > 13) {
        throw new Error('Month must be between 1 and 13');
      }

      if (lmpDate.day < 1 || lmpDate.day > 30) {
        throw new Error('Day must be between 1 and 30');
      }

      const lmpGregorian = toGregorian(lmpDate.year, lmpDate.month, lmpDate.day);
      const lmpDateObj = new Date(lmpGregorian[0], lmpGregorian[1] - 1, lmpGregorian[2]);

      if (isNaN(lmpDateObj.getTime())) {
        throw new Error('Invalid date entered');
      }

      const eddDateObj = new Date(lmpDateObj);
      eddDateObj.setDate(eddDateObj.getDate() + 280);

      const eddEthiopian = toEthiopian(
        eddDateObj.getFullYear(),
        eddDateObj.getMonth() + 1,
        eddDateObj.getDate()
      );

      const today = new Date();
      const diffTime = today - lmpDateObj;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;

      if (weeks < 0 || (weeks === 0 && days < 0)) {
        throw new Error('LMP date cannot be in the future');
      }

      // Calculate trimester
      let trimester;
      if (weeks < 14) {
        trimester = { number: 1, name: 'First Trimester', weeks: '0-13 weeks' };
      } else if (weeks < 28) {
        trimester = { number: 2, name: 'Second Trimester', weeks: '14-27 weeks' };
      } else {
        trimester = { number: 3, name: 'Third Trimester', weeks: '28+ weeks' };
      }

      // Calculate term classification
      let termClassification;
      if (weeks < 37) {
        termClassification = { status: 'Preterm', description: 'Before 37 weeks', color: 'warning' };
      } else if (weeks <= 42) {
        termClassification = { status: 'Term', description: '37-42 weeks', color: 'success' };
      } else {
        termClassification = { status: 'Post-term', description: 'After 42 weeks', color: 'info' };
      }

      setEdd({
        year: eddEthiopian[0],
        month: eddEthiopian[1],
        day: eddEthiopian[2]
      });

      setGa({
        weeks: weeks,
        days: days,
        trimester: trimester,
        termClassification: termClassification
      });
    } catch (err) {
      setError(err.message || 'An error occurred during calculation');
      setEdd(null);
      setGa(null);
    }
  };

  const calculateFromUltrasound = (ultrasoundData) => {
    try {
      setError(null);

      const { previousVisitDate, previousGA, currentDate } = ultrasoundData;

      // Validate dates
      if (previousVisitDate.month < 1 || previousVisitDate.month > 13) {
        throw new Error('Previous visit month must be between 1 and 13');
      }

      if (previousVisitDate.day < 1 || previousVisitDate.day > 30) {
        throw new Error('Previous visit day must be between 1 and 30');
      }

      if (currentDate.month < 1 || currentDate.month > 13) {
        throw new Error('Current date month must be between 1 and 13');
      }

      if (currentDate.day < 1 || currentDate.day > 30) {
        throw new Error('Current date day must be between 1 and 30');
      }

      // Validate GA
      if (previousGA.weeks < 0 || previousGA.weeks > 42) {
        throw new Error('Previous GA weeks must be between 0 and 42');
      }

      if (previousGA.days < 0 || previousGA.days >= 7) {
        throw new Error('Previous GA days must be between 0 and 6');
      }

      // Convert dates to Gregorian
      const prevGregorian = toGregorian(previousVisitDate.year, previousVisitDate.month, previousVisitDate.day);
      const prevDateObj = new Date(prevGregorian[0], prevGregorian[1] - 1, prevGregorian[2]);

      const currGregorian = toGregorian(currentDate.year, currentDate.month, currentDate.day);
      const currDateObj = new Date(currGregorian[0], currGregorian[1] - 1, currGregorian[2]);

      if (isNaN(prevDateObj.getTime()) || isNaN(currDateObj.getTime())) {
        throw new Error('Invalid date entered');
      }

      // Check if current date is after previous visit date
      if (currDateObj <= prevDateObj) {
        throw new Error('Current date must be after previous visit date');
      }

      // Calculate time difference in days
      const diffTime = currDateObj - prevDateObj;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Calculate previous GA in total days
      const previousGADays = (previousGA.weeks * 7) + previousGA.days;

      // Calculate current GA in total days
      const currentGADays = previousGADays + diffDays;

      // Convert to weeks and days
      const currentWeeks = Math.floor(currentGADays / 7);
      const currentDays = currentGADays % 7;

      // Calculate EDD: Current Date + (40 weeks - Current GA)
      // EDD = Current Date + (280 days - Current GA in days)
      const daysUntilEDD = 280 - currentGADays;
      const eddDateObj = new Date(currDateObj);
      eddDateObj.setDate(eddDateObj.getDate() + daysUntilEDD);

      // Convert EDD to Ethiopian
      const eddEthiopian = toEthiopian(
        eddDateObj.getFullYear(),
        eddDateObj.getMonth() + 1,
        eddDateObj.getDate()
      );

      // Calculate trimester
      let trimester;
      if (currentWeeks < 14) {
        trimester = { number: 1, name: 'First Trimester', weeks: '0-13 weeks' };
      } else if (currentWeeks < 28) {
        trimester = { number: 2, name: 'Second Trimester', weeks: '14-27 weeks' };
      } else {
        trimester = { number: 3, name: 'Third Trimester', weeks: '28+ weeks' };
      }

      // Calculate term classification
      let termClassification;
      if (currentWeeks < 37) {
        termClassification = { status: 'Preterm', description: 'Before 37 weeks', color: 'warning' };
      } else if (currentWeeks <= 42) {
        termClassification = { status: 'Term', description: '37-42 weeks', color: 'success' };
      } else {
        termClassification = { status: 'Post-term', description: 'After 42 weeks', color: 'info' };
      }

      setEdd({
        year: eddEthiopian[0],
        month: eddEthiopian[1],
        day: eddEthiopian[2]
      });

      setGa({
        weeks: currentWeeks,
        days: currentDays,
        trimester: trimester,
        termClassification: termClassification,
        method: 'ultrasound',
        previousVisitDate: previousVisitDate,
        previousGA: previousGA,
        currentDate: currentDate
      });
    } catch (err) {
      setError(err.message || 'An error occurred during calculation');
      setEdd(null);
      setGa(null);
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon">🤱</span>
            <span className="brand-name">MaternalCare</span>
          </div>
          <div className="nav-links">
            <a href="#home" className="nav-link">Home</a>
            <a href="#calculator" className="nav-link">Calculator</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="hero-section">
          <div className="hero-content">
            <span className="category-badge">🇪🇹 Ethiopian Calendar</span>
            <h1 className="hero-title">Pregnancy Calculator</h1>
            <p className="hero-description">
              Calculate your Estimated Due Date (EDD) and Gestational Age (GA) using the Ethiopian calendar. 
              Choose between LMP (Last Menstrual Period) or Ultrasound method for accurate pregnancy tracking.
            </p>
          </div>
        </div>

        <div className="tool-container">
          <div className="method-selector">
            <button
              className={`method-btn ${calculationMethod === 'lmp' ? 'active' : ''}`}
              onClick={() => setCalculationMethod('lmp')}
            >
              LMP Method
            </button>
            <button
              className={`method-btn ${calculationMethod === 'ultrasound' ? 'active' : ''}`}
              onClick={() => setCalculationMethod('ultrasound')}
            >
              Ultrasound Method
            </button>
          </div>

          <div className="tool-card">
            <div className="tool-header">
              {calculationMethod === 'lmp' ? (
                <>
                  <h2 className="tool-title">Enter Last Menstrual Period (LMP)</h2>
                  <p className="tool-subtitle">Enter the date in Ethiopian calendar format (Year, Month 1-13, Day 1-30)</p>
                </>
              ) : (
                <>
                  <h2 className="tool-title">Calculate from Previous Visit</h2>
                  <p className="tool-subtitle">Enter previous visit date, GA at that visit, and current date to calculate current GA and EDD</p>
                </>
              )}
            </div>
            <div className="tool-body">
              {calculationMethod === 'lmp' ? (
                <DateInput onCalculate={calculateEDDandGA} />
              ) : (
                <UltrasoundInput onCalculate={calculateFromUltrasound} />
              )}
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>

          <Results edd={edd} ga={ga} />
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3 className="footer-title">MaternalCare</h3>
            <p className="footer-tagline">Empowering Maternal Health</p>
            <p className="footer-description">
              Accurate pregnancy calculations using the Ethiopian calendar. 
              Supporting healthcare providers and expecting mothers with precision tools.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#tools">All Tools</a></li>
              <li><a href="#categories">Categories</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><a href="#terms">Terms of Use</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#disclaimer">Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} Regasa Developer. All rights reserved. Made with ❤️ in Ethiopia
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

