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
  const nonZeroPrices = result
  .filter(trip => trip["Price (USD)"] > 0)
  .map(trip => trip["Price (USD)"]);

  const minPriceOverall = Math.min(...nonZeroPrices);
  const maxPriceOverall = Math.max(...nonZeroPrices);


  useEffect(() => {
    const today = new Date();
    const twelveMonthsLater = new Date();
    twelveMonthsLater.setFullYear(today.getFullYear() + 1);
  
    const formatDate = (date) => date.toISOString().split('T')[0];
  
    setStartDate(formatDate(today));
    setEndDate(formatDate(twelveMonthsLater));
  }, []);  

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
  
      console.log("Raw trip data:", data.top_trips);
  
      const formattedTrips = data.top_trips.map(trip => {
        const [day, month, year] = trip.Date.split('.');
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return {
          ...trip,
          Date: isoDate
        };
      });
  
      setResult(formattedTrips);
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
          
            const tripsForDay = result.filter(
              (trip) => trip.Date === dateStr && trip["Price (USD)"] > 0
            );
          
            if (tripsForDay.length === 0) return null;
          
            const minPrice = Math.min(...tripsForDay.map(trip => trip["Price (USD)"]));
          
            // ✅ Compute min/max prices across all available trips (safe inside tileContent)
            const nonZeroPrices = result
              .filter(trip => trip["Price (USD)"] > 0)
              .map(trip => trip["Price (USD)"]);
          
            const minPriceOverall = Math.min(...nonZeroPrices);
            const maxPriceOverall = Math.max(...nonZeroPrices);
          
            let normalized = 0;
            if (maxPriceOverall !== minPriceOverall) {
              normalized = (minPrice - minPriceOverall) / (maxPriceOverall - minPriceOverall);
            }
          
            let color = '';
            if (normalized < 0.33) color = '#2ecc71';      // bright green
            else if (normalized < 0.66) color = '#1E90FF'; // vibrant blue
            else color = '#8B0000';                        // bold red
          
            return (
              <div style={{ fontSize: '0.7rem', textAlign: 'center', marginTop: '4px' }}>
                <div>${minPrice.toFixed(0)}</div>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: color,
                    margin: '4px auto 0 auto',
                  }}
                />
              </div>
            );
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
