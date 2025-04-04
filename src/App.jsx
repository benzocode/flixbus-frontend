import { useState } from 'react';

function App() {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    setLoading(true);
    setResult(null); // Clear previous results
  
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
      console.log('Cheapest Trip:', data);
      setResult(data.cheapest_trip);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Always turn off loading
    }
  };
  

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>FlixBus Trip Search</h2>
      <div>
        <label>From City: </label>
        <input value={fromCity} onChange={(e) => setFromCity(e.target.value)} />
      </div>
      <div>
        <label>To City: </label>
        <input value={toCity} onChange={(e) => setToCity(e.target.value)} />
      </div>
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
      
      {/* ✅ THIS BLOCK must be INSIDE the return */}
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
