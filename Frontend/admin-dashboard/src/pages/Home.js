import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../api/axios';
import './Home.css';

const Home = () => {
  const [mode, setMode] = useState('tracking'); // 'tracking' | 'phone'
  const [tracking, setTracking] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [list, setList] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setList([]);
    setLoading(true);
    try {
      if (mode === 'tracking') {
        const { data } = await api.get(`/shipment/${encodeURIComponent(tracking)}`);
        setResult(data);
      } else {
        const { data } = await api.get(`/shipment/by-phone/${encodeURIComponent(phone)}`);
        setList(data?.shipments || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <NavBar />
      <main id="home" className="hero">
        <div className="hero__inner">
          <h1>Track your shipment</h1>
          <p className="sub">Reliable, real-time tracking built for modern logistics.</p>
          <div className="seg">
            <button className={`seg__btn ${mode==='tracking' ? 'is-active':''}`} onClick={()=>setMode('tracking')}>By Tracking ID</button>
            <button className={`seg__btn ${mode==='phone' ? 'is-active':''}`} onClick={()=>setMode('phone')}>By Phone Number</button>
          </div>

          <form className="track" onSubmit={onSubmit}>
            {mode === 'tracking' ? (
              <input
                className="track__input"
                placeholder="Enter Tracking ID"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                required
              />
            ) : (
              <input
                className="track__input"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            )}
            <button className="track__btn" type="submit" disabled={loading}>{loading ? 'Tracking…' : 'Track Order'}</button>
          </form>
          {error && <div className="alert alert--error">{error}</div>}
          {mode==='tracking' && result && (
            <div className="card result">
              <div className="row"><span>Tracking ID</span><strong>{result.trackingId}</strong></div>
              <div className="row"><span>Status</span><strong>{result.status}</strong></div>
              <div className="row"><span>Location</span><strong>{result.currentLocation}</strong></div>
              {result.estimatedDelivery && (
                <div className="row"><span>ETA</span><strong>{new Date(result.estimatedDelivery).toLocaleDateString()}</strong></div>
              )}
            </div>
          )}

          {mode==='phone' && list.length > 0 && (
            <div className="card result">
              {list.map(item => (
                <div key={item._id} className="row" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <div><span>Tracking ID</span><div><strong>{item.trackingId}</strong></div></div>
                  <div><span>Status</span><div><strong>{item.status}</strong></div></div>
                  <div><span>Location</span><div><strong>{item.currentLocation}</strong></div></div>
                  {item.estimatedDelivery && (
                    <div><span>ETA</span><div><strong>{new Date(item.estimatedDelivery).toLocaleDateString()}</strong></div></div>
                  )}
                  <div style={{gridColumn:'1/-1',borderBottom:'1px dashed var(--border)',margin:'6px 0'}} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="footer">
        <div className="footer__inner">
          <span className="muted">Developed by</span>
          <a
            className="footer__link"
            href="https://api.whatsapp.com/send/?phone=%2B917348228167&text=Hello%2C+I+need+a+website&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact NextGen Fusion on WhatsApp"
          >
            NextGen Fusion
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
