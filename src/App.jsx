import { useState, useEffect } from 'react';

function App() {
  const [fromCity, setFromCity] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [toCity, setToCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // 🔍 Fetch autocomplete suggestions for fromCity
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (fromCity.length < 2) {
        setFromSuggestions([]);
        return;
      }
  
      if (fromSuggestions.includes(fromCity)) {
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
        console.error('Error fetching city suggestions:', error);
      }
    };
  
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [fromCity]);  

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (toCity.length < 2) {
        setToSuggestions([]);
        return;
      }
      
      if (toSuggestions.includes(toCity)) {
        setFromSuggestions([]);
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
        console.error('Error fetching city suggestions:', error);
      }
    };
  
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [toCity]);  

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

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
      setResult(data.cheapest_trip);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>FlixBus Trip Search</h2>

      {/* 🔽 FROM CITY INPUT */}
      <div style={{ position: 'relative' }}>
        <label>From City: </label>
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
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            color: '#000',
            border: '1px solid #ccc',
            maxHeight: '150px',
            overflowY: 'auto',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            zIndex: 1000
          }}>          
            {fromSuggestions.map((suggestion, index) => (
              <li
              key={index}
              onClick={() => {
                setShowFromDropdown(false);  // ✅ First: hide dropdown
                setFromCity(suggestion);     // ✅ Then: set value
              }}                           
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                backgroundColor: '#fff',
                color: '#000' // ✅ makes the text visible
              }}
            >
              {suggestion}
            </li>            
            ))}
          </ul>
        )}
      </div>

      {/* TO CITY INPUT (unchanged for now) */}
      <div style={{ position: 'relative' }}>
  <label>To City: </label>
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
    <ul style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: '#fff',
      color: '#000',
      border: '1px solid #ccc',
      maxHeight: '150px',
      overflowY: 'auto',
      listStyle: 'none',
      padding: 0,
      margin: 0,
      zIndex: 1000
    }}>
      {toSuggestions.map((suggestion, index) => (
        <li
          key={index}
          onClick={() => {
            setShowToDropdown(false);  // ✅ First: hide dropdown
            setToCity(suggestion);     // ✅ Then: set value
          }}          
          style={{
            padding: '0.5rem',
            cursor: 'pointer',
            borderBottom: '1px solid #eee',
            backgroundColor: '#fff',
            color: '#000'
          }}
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

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Cheapest Trip</h3>
          <p><strong>Date:</strong> {result.Date}</p>
          <p><strong>Price:</strong> ${result["Price (USD)"].toFixed(2)}</p>
          <p><strong>Departure:</strong> {result["Departure Time"]}</p>
          <p><strong>Arrival:</strong> {result["Arrival Time"]}</p>
          <p><strong>Duration:</strong> {result.Duration}</p>
        </div>
      )}
    </div>
  );
}

export default App;
