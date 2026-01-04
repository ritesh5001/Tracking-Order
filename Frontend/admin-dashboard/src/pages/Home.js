import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../api/axios';
import './Home.css';

// Clean homepage for SHREE CARGO SURAT
const HERO_METRICS = [
  { value: '10K+', label: 'Shipments handled' },
  { value: '24x7', label: 'Support availability' },
  { value: 'Since 1984', label: 'Trusted by Surat' }
];

const PNR_STEPS = [
  { label: 'Ordered' },
  { label: 'Shipped' },
  { label: 'In Transit' },
  { label: 'Out for Delivery' },
  { label: 'Delivered' },
];

const isPNRTrackingId = (trackingId) =>
  typeof trackingId === 'string' && trackingId.trim().toUpperCase().startsWith('PNR6');

const StatusTimeline = ({ currentIndex }) => {
  const safeIndex = Number.isFinite(currentIndex) ? currentIndex : 2;

  return (
    <div className="pnr-timeline" role="list" aria-label="Shipment status timeline">
      {PNR_STEPS.map((step, index) => {
        const isCompleted = index < safeIndex;
        const isCurrent = index === safeIndex;
        const isLast = index === PNR_STEPS.length - 1;

        return (
          <div
            key={step.label}
            className={
              `pnr-step${isCompleted ? ' pnr-step--completed' : ''}${isCurrent ? ' pnr-step--current' : ''}`
            }
            role="listitem"
          >
            <div className="pnr-step__marker" aria-hidden="true">
              <span className="pnr-step__dot">{isCompleted ? '✓' : ''}</span>
              {!isLast && <span className="pnr-step__line" />}
            </div>

            <div className="pnr-step__content">
              <div className="pnr-step__label">{step.label}</div>
            </div>

            <div className="pnr-step__state">{isCompleted ? 'Completed' : ''}</div>
          </div>
        );
      })}
    </div>
  );
};

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
        const cleanQuery = tracking.trim();
        if (isPNRTrackingId(cleanQuery)) {
          setResult({
            trackingId: cleanQuery,
            status: 'In Transit',
            currentLocation: "Parcel is dispatched from Shreecargo warehouse and it's on the way",
          });
          return;
        }

        const { data } = await api.get(`/shipment/${encodeURIComponent(cleanQuery)}`);
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
      <main id="home" className="home">
        <section className="hero">
          <div className="hero__glow" aria-hidden />
          <div className="hero__inner">
            <div className="hero__layout">
              <div className="hero__content">
                <span className="eyebrow">SHREE CARGO SURAT</span>
                <h1>Fast, reliable cargo and courier services in Surat.</h1>
                <p className="sub">Track your shipment in seconds. Call or email us for quick bookings and support.</p>

                <div className="seg" role="tablist" aria-label="Tracking mode">
                  <button
                    className={`seg__btn ${mode === 'tracking' ? 'is-active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={mode === 'tracking'}
                    onClick={() => setMode('tracking')}
                  >
                    By Tracking ID
                  </button>
                  <button
                    className={`seg__btn ${mode === 'phone' ? 'is-active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={mode === 'phone'}
                    onClick={() => setMode('phone')}
                  >
                    By Phone Number
                  </button>
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
                  <button className="track__btn" type="submit" disabled={loading}>
                    {loading ? 'Tracking…' : 'Track Order'}
                  </button>
                </form>

                {error && <div className="alert alert--error">{error}</div>}

                {mode === 'tracking' && result && (
                  <div className="card result">
                    {isPNRTrackingId(result?.trackingId) && <StatusTimeline currentIndex={2} />}
                    <div className="row"><span>Tracking ID</span><strong>{result.trackingId}</strong></div>
                    <div className="row"><span>Status</span><strong>{result.status}</strong></div>
                    <div className="row"><span>Location</span><strong>{result.currentLocation}</strong></div>
                    {result.estimatedDelivery && (
                      <div className="row"><span>ETA</span><strong>{new Date(result.estimatedDelivery).toLocaleDateString()}</strong></div>
                    )}
                  </div>
                )}

                {mode === 'phone' && list.length > 0 && (
                  <div className="card result result--list">
                    {list.map((item, index) => (
                      <div key={item._id || index} className="result__shipment">
                        <div className="result__columns">
                          <div>
                            <span>Tracking ID</span>
                            <strong>{item.trackingId}</strong>
                          </div>
                          <div>
                            <span>Status</span>
                            <strong>{item.status}</strong>
                          </div>
                          <div>
                            <span>Location</span>
                            <strong>{item.currentLocation}</strong>
                          </div>
                          {item.estimatedDelivery && (
                            <div>
                              <span>ETA</span>
                              <strong>{new Date(item.estimatedDelivery).toLocaleDateString()}</strong>
                            </div>
                          )}
                        </div>
                        {index !== list.length - 1 && <div className="result__divider" aria-hidden />}
                      </div>
                    ))}
                  </div>
                )}

                <div className="hero__metrics" aria-label="Operations insight">
                  {HERO_METRICS.map((metric) => (
                    <div key={metric.label} className="hero__metric">
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Clean homepage: remove extra dashboard panels for a simpler look */}
            </div>
          </div>
        </section>
        {/* Removed feature and timeline sections to keep homepage clean */}

        <section className="section section--cta">
          <div className="section__inner">
            <div className="cta">
              <h2>Need to book a pickup or have a query?</h2>
              <p>We’re here to help. Reach out to SHREE CARGO SURAT for fast assistance.</p>
              <div className="cta__actions">
                <Link className="cta__btn cta__btn--primary" to="/contact">Contact Us</Link>
                <Link className="cta__btn" to="/track">Track Shipment</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
