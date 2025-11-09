import React, { useState } from 'react';
import './App.css';
import DateInput from './components/DateInput';
import Results from './components/Results';
import { toGregorian, toEthiopian } from 'ethiopian-date';

function App() {
  const [edd, setEdd] = useState(null);
  const [ga, setGa] = useState(null);
  const [error, setError] = useState(null);

  const calculateEDDandGA = (lmpDate) => {
    try {
      setError(null);
      
      // Validate Ethiopian date
      if (lmpDate.month < 1 || lmpDate.month > 13) {
        throw new Error('Month must be between 1 and 13');
      }
      
      if (lmpDate.day < 1 || lmpDate.day > 30) {
        throw new Error('Day must be between 1 and 30');
      }

      // Convert LMP from Ethiopian to Gregorian for calculations
      const lmpGregorian = toGregorian(lmpDate.year, lmpDate.month, lmpDate.day);
      const lmpDateObj = new Date(lmpGregorian[0], lmpGregorian[1] - 1, lmpGregorian[2]);

      // Validate the date is valid
      if (isNaN(lmpDateObj.getTime())) {
        throw new Error('Invalid date entered');
      }

      // Calculate EDD: LMP + 280 days (40 weeks)
      const eddDateObj = new Date(lmpDateObj);
      eddDateObj.setDate(eddDateObj.getDate() + 280);

      // Convert EDD back to Ethiopian
      const eddEthiopian = toEthiopian(
        eddDateObj.getFullYear(),
        eddDateObj.getMonth() + 1,
        eddDateObj.getDate()
      );

      // Calculate GA: Today - LMP
      const today = new Date();
      const diffTime = today - lmpDateObj;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;

      // Validate GA is not negative
      if (weeks < 0 || (weeks === 0 && days < 0)) {
        throw new Error('LMP date cannot be in the future');
      }

      setEdd({
        year: eddEthiopian[0],
        month: eddEthiopian[1],
        day: eddEthiopian[2]
      });

      setGa({
        weeks: weeks,
        days: days
      });
    } catch (err) {
      setError(err.message || 'An error occurred during calculation');
      setEdd(null);
      setGa(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ethiopian EDD & GA Calculator</h1>
        <p className="subtitle">Calculate Estimated Due Date and Gestational Age</p>
        
        <div className="calculator-container">
          <div className="input-section">
            <h2>Enter Last Menstrual Period (LMP)</h2>
            <p className="instruction">Enter the date in Ethiopian calendar format</p>
            <DateInput onCalculate={calculateEDDandGA} />
            {error && <div className="error-message">{error}</div>}
          </div>

          <Results edd={edd} ga={ga} />
        </div>
      </header>
    </div>
  );
}

export default App;
