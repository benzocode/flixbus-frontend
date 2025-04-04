import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

function App() {
  const [fromCity, setFromCity] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);

  const [toCity, setToCity] = useState('');
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (fromCity.length < 2 || fromSuggestions.includes(fromCity)) {
        setFromSuggestions([]);
        return;
      }
      try {
        const response = await fetch(
          `https://global.api.flixbus.com/search/autocomplete/cities?q=${encodeURIComponent(fromCity)}&lang=en_US`
        );
        const data = await response.json();
        setFromSuggestions(data.map(city => city.name));
        setShowFromDropdown(true);
      } catch (error) {
        console.error('Error fetching fromCity suggestions:', error);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [fromCity]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (toCity.length < 2 || toSuggestions.includes(toCity)) {
        setToSuggestions([]);
        return;
      }
      try {
        const response = await fetch(
          `https://global.api.flixbus.com/search/autocomplete/cities?q=${encodeURIComponent(toCity)}&lang=en_US`
        );
        const data = await response.json();
        setToSuggestions(data.map(city => city.name));
        setShowToDropdown(true);
      } catch (error) {
        console.error('Error fetching toCity suggestions:', error);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [toCity]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_city: fromCity,
          to_city: toCity,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      const data = await response.json();
      setResult(data.top_trips);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '90vw',
      minHeight: '100vh',
      margin: 0,
      padding: '1rem 2rem 2rem 2rem',
      fontFamily: 'sans-serif',
    }}>
      <h2 style={{ marginTop: 0 }}>FlixBus Trip Search</h2>

      <div className="form-container">
        <div className="form-group" style={{ position: 'relative' }}>
          <label>From</label>
          <input
            value={fromCity}
            onChange={(e) => {
              setFromCity(e.target.value);
              setShowFromDropdown(true);
            }}
            onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
            autoComplete="off"
          />
          {showFromDropdown && fromSuggestions.length > 0 && (
            <ul className="dropdown">
              {fromSuggestions.map((city, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setFromCity(city);
                    setShowFromDropdown(false);
                  }}
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label>To</label>
          <input
            value={toCity}
            onChange={(e) => {
              setToCity(e.target.value);
              setShowToDropdown(true);
            }}
            onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
            autoComplete="off"
          />
          {showToDropdown && toSuggestions.length > 0 && (
            <ul className="dropdown">
              {toSuggestions.map((city, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setToCity(city);
                    setShowToDropdown(false);
                  }}
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <button className="search-button" onClick={handleSubmit}>Search</button>
      </div>

      <div style={{ marginTop: '2rem', width: '100%', maxWidth: '3200px' }}>
        <Calendar
          onClickDay={(value) => {
            const clickedDate = value.toISOString().split('T')[0];
            setStartDate(clickedDate);
          }}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;
            const dateStr = date.toISOString().split('T')[0];
            const trip = result.find(trip => trip.Date === dateStr);
            return trip ? (
              <div style={{ fontSize: '0.7rem', marginTop: '4px', textAlign: 'center' }}>
                ${trip["Price (USD)"].toFixed(0)}
              </div>
            ) : null;
          }}
        />
      </div>

      {loading && (
        <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>Searching for trips...</p>
      )}

      {result.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Top 3 Cheapest Trips</h3>
          {result.map((trip, index) => (
            <div
              key={index}
              style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}
            >
              <p><strong>Date:</strong> {trip.Date}</p>
              <p><strong>Price:</strong> ${trip["Price (USD)"].toFixed(2)}</p>
              <p><strong>Departure:</strong> {trip["Departure Time"]}</p>
              <p><strong>Arrival:</strong> {trip["Arrival Time"]}</p>
              <p><strong>Duration:</strong> {trip.Duration}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
