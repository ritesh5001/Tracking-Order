import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../api/axios';
import './PageLayout.css';
import './ShipmentTracker.css';

const ShipmentTracker = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setResult(null);
    setLoading(true);

    try {
      const cleanQuery = query.trim();

      if (!cleanQuery) {
        throw new Error('Please enter a tracking ID or phone number.');
      }

      const compactQuery = cleanQuery.replace(/[\s-]/g, '');
      const numericOnly = compactQuery.replace(/\D/g, '');
      const isPhoneLookup = numericOnly.length >= 6 && numericOnly.length === compactQuery.length;

      if (isPhoneLookup) {
        const { data } = await api.get(`/shipment/by-phone/${numericOnly}`);
        setResult({ type: 'phone', data });
      } else {
        const { data } = await api.get(`/shipment/${encodeURIComponent(cleanQuery)}`);
        setResult({ type: 'tracking', data });
      }
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--track">
      <NavBar />
      <main className="page__main">
        <div className="page__container">
          <header className="page__header">
            <span className="eyebrow">Shipment Lookup</span>
            <h1>Track your shipment status in seconds</h1>
            <p>
              Enter either the tracking ID or the phone number you used when booking. We'll
              detect the right lookup automatically and show you the freshest status in seconds.
            </p>
          </header>

          <section className="section-block track-card">
            <form className="track-form" onSubmit={onSubmit}>
              <div className="track-form__row">
                <label htmlFor="lookup" className="track-form__label">Tracking ID or Phone Number</label>
                <input
                  id="lookup"
                  placeholder="Enter tracking ID (e.g. TRK-948201) or phone number"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                />
              </div>
              <button disabled={loading} type="submit" className="btn btn--primary">
                {loading ? 'Verifying…' : 'Track Shipment'}
              </button>
              <p className="track-form__hint">
                No toggle needed—enter a tracking ID or a phone number (6+ digits, numbers only).
              </p>
            </form>

            {err && <div className="alert alert--error">{err}</div>}

            {result?.type === 'tracking' && (
              <div className="result-card" aria-live="polite">
                <h2>Shipment summary</h2>
                <dl className="result-card__grid">
                  <div className="result-card__row">
                    <dt>Tracking ID</dt>
                    <dd>{result.data.trackingId}</dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Status</dt>
                    <dd>{result.data.status}</dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Current Location</dt>
                    <dd>{result.data.currentLocation}</dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Recipient</dt>
                    <dd>{result.data.customerName}</dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Phone</dt>
                    <dd>{result.data.customerPhone}</dd>
                  </div>
                  {result.data.estimatedDelivery && (
                    <div className="result-card__row">
                      <dt>Estimated Delivery</dt>
                      <dd>{new Date(result.data.estimatedDelivery).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
                <p className="result-card__meta">
                  Created {result.data.createdAt ? new Date(result.data.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            )}

            {result?.type === 'phone' && (
              <div className="result-card" aria-live="polite">
                <h2>{result.data.count} shipment{result.data.count === 1 ? '' : 's'} on this number</h2>
                <dl className="result-card__grid">
                  {result.data.shipments?.map((shipment) => (
                    <div key={shipment._id || shipment.trackingId} className="result-card__row">
                      <dt>{shipment.trackingId}</dt>
                      <dd>
                        {shipment.status} —{' '}
                        <span className="result-card__meta">
                          {shipment.currentLocation}
                          {shipment.estimatedDelivery &&
                            ` · ETA ${new Date(shipment.estimatedDelivery).toLocaleDateString()}`}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="result-card__meta">
                  Showing the most recent shipments linked to {result.data.shipments?.[0]?.customerPhone}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShipmentTracker;
