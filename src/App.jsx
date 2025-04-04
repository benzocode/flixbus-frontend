import { useState, useEffect } from 'react';

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

  // Fetch suggestions for 'fromCity'
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

  // Fetch suggestions for 'toCity'
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

  // Submit search request
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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>FlixBus Trip Search</h2>

      {/* FROM CITY */}
      <div style={{ position: 'relative' }}>
        <label>From: </label>
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
          <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', color: '#000', border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto', listStyle: 'none', padding: 0, margin: 0, zIndex: 1000 }}>
            {fromSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  setShowFromDropdown(false);
                  setFromCity(suggestion);
                }}
                style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: '#fff', color: '#000' }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TO CITY */}
      <div style={{ position: 'relative' }}>
        <label>To: </label>
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
          <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', color: '#000', border: '1px solid #ccc', maxHeight: '150px', overflowY: 'auto', listStyle: 'none', padding: 0, margin: 0, zIndex: 1000 }}>
            {toSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  setShowToDropdown(false);
                  setToCity(suggestion);
                }}
                style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: '#fff', color: '#000' }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* DATE INPUTS */}
      <div>
        <label>Start Date: </label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div>
        <label>End Date: </label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <button onClick={handleSubmit}>Search</button>

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
